import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {ApiService} from '../../../../services/api.service';

@Component({
  selector: 'app-stress-attachment-item',
  templateUrl: './stress-attachment-item.component.html',
  styleUrls: ['./stress-attachment-item.component.scss']
})
export class StressAttachmentItemComponent implements OnInit, OnChanges {

  @Input() attachments: Array<any> | undefined
  @Input() name: string | undefined;

  open = false;
  items = new BehaviorSubject<Array<any>>([]);
  parents = new BehaviorSubject<Array<any>>([]);

  constructor(private api: ApiService) {
  }

  ngOnChanges(changes: any) {
    this.setData();
  }

  ngOnInit(): void {
  }

  setData() {
    this.open = false;
    const items: any[] = [];
    const toParents: any[] = [];
    this.attachments?.forEach(attachment => {
      const newAttachment = Object.assign({}, attachment);
      const attachmentName = newAttachment.name;
      if (attachmentName.includes('/')) {
        newAttachment.parentName = attachmentName.slice(0, attachmentName.indexOf('/'));
        newAttachment.name = attachmentName.slice(attachmentName.indexOf('/') + 1);
        toParents.push(newAttachment);
      } else {
        items.push(newAttachment)
      }
    });
    const parents: any = {}
    toParents.forEach(toParent => {
      if (Object.keys(parents).includes(toParent.parentName)) {
        parents[toParent.parentName].push(toParent);
      } else {
        parents[toParent.parentName] = [toParent]
      }
    });
    this.items.next(items);
    this.parents.next(Object.keys(parents).map(k => {
      return {name: k, parents: parents[k]}
    }));
  }

  openAttachment(item: any) {
    window.open(`${this.api.getBaseLink()}/files/get?name=${item.source}`, '_blank')
  }
}
