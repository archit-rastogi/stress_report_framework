import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {ApiService} from '../../../../services/api.service';
import {AttachmentsSyncService} from '../services/attachments.service';

@Component({
  selector: 'app-stress-attachment-item',
  templateUrl: './stress-attachment-item.component.html',
  styleUrls: ['./stress-attachment-item.component.scss']
})
export class StressAttachmentItemComponent implements OnInit, OnChanges {

  @Input() attachment: any | undefined

  open = false;

  constructor(private api: ApiService,
              public attachmentsSync: AttachmentsSyncService) {
  }

  ngOnChanges(changes: any) {
    this.open = false;
  }

  ngOnInit(): void {
    const nameParts = this.attachment.name.split("/")
    this.attachment.prettyName = nameParts[nameParts.length - 1]
    this.open = false;
  }

  isRealAttachment() {
    return !this.attachment.hasOwnProperty('children')
  }

  openAttachment() {
    window.open(`${this.api.getBaseLink()}/files/get?name=${this.attachment.source}`, '_blank')
  }

  selectAttachment(event: Event) {
    event.preventDefault();
    const oldSelected = this.attachmentsSync.selectedAttachments.getValue();
    if (oldSelected.map(os => os.name).includes(this.attachment.name)) {
      this.attachmentsSync.selectedAttachments.next(oldSelected.filter(selectedId => selectedId.name !== this.attachment.name));
    } else {
      oldSelected.push(this.attachment);
      this.attachmentsSync.selectedAttachments.next(oldSelected);
    }
  }

  getStyle() {
    const contain = this.attachmentsSync.selectedAttachments.getValue().map(sa => sa.name).includes(this.attachment.name);
    return contain ? {backgroundColor: 'rgba(5, 0, 255, 0.2)'} : {};
  }
}
