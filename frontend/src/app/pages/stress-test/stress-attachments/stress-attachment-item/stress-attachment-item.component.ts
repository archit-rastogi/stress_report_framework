import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {ApiService} from '../../../../services/api.service';
import {AttachmentsSyncService} from '../services/attachments.service';

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
  clickBlock = false;

  constructor(private api: ApiService,
              public attachmentsSync: AttachmentsSyncService) {
  }

  ngOnChanges(changes: any) {
    this.setData();
  }

  ngOnInit(): void {
    this.clickBlock = false;
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
    this.parents.next(Object.keys(parents)
      .sort((a: string, b: string) => a.localeCompare(b))
      .map(k => {
        return {name: k, parents: parents[k]}
      }));
  }

  openAttachment(item: any) {
    if (!this.clickBlock) {
      window.open(`${this.api.getBaseLink()}/files/get?name=${item.source}`, '_blank')
    }
  }

  selectAttachment(event: Event, attachment: any) {
    event.preventDefault();
    const oldSelected = this.attachmentsSync.selectedAttachments.getValue();
    if (oldSelected.map(os => os.attachment_id).includes(attachment.attachment_id)) {
      this.attachmentsSync.selectedAttachments.next(oldSelected.filter(selectedId => selectedId.attachment_id !== attachment.attachment_id));
    } else {
      oldSelected.push(attachment);
      this.attachmentsSync.selectedAttachments.next(oldSelected);
    }
  }

  getStyle(item: any) {
    return this.attachmentsSync.selectedAttachments.getValue().map(os => os.attachment_id).includes(item.attachment_id) ? {backgroundColor: 'rgba(5, 0, 255, 0.2)'} : {};
  }

  selectAllList() {
    const items = this.items.getValue()
    const selected = this.attachmentsSync.selectedAttachments.getValue();
    const itemsIds = items.map(i => i.attachment_id)
    const selectedIds = selected.map(os => os.attachment_id)
    if (selectedIds.filter(atId => itemsIds.includes(atId)).length > 0 && selected.length > 1) {
      this.attachmentsSync.selectedAttachments.next(selected.filter(os => !itemsIds.includes(os.attachment_id)))
    } else {
      items.forEach(i => {
        if (!selectedIds.includes(i.attachment_id)) {
          selected.push(i);
        }
      });
      this.attachmentsSync.selectedAttachments.next(selected);
    }
  }
}
