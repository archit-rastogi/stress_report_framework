import {Component, Input, OnInit} from '@angular/core';
import {ApiService} from '../../../services/api.service';
import {BehaviorSubject, Subject} from 'rxjs';
import {AttachmentsSyncService} from './services/attachments.service';
import {MatDialog} from '@angular/material/dialog';
import {AcceptDialogComponent, AcceptOptions} from '../../../components/accept-dialog/accept-dialog.component';

@Component({
  selector: 'app-stress-attachments',
  templateUrl: './stress-attachments.component.html',
  styleUrls: ['./stress-attachments.component.scss']
})
export class StressAttachmentsComponent implements OnInit {

  @Input() testId: string | undefined | null;
  attachments = new BehaviorSubject<Array<any>>([]);
  show = new Subject<boolean>();
  getAttachmentsSub: any;
  deleteAttachmentSub: any;
  acceptDialogSub: any;

  constructor(private api: ApiService,
              public attachmentsSync: AttachmentsSyncService,
              private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.getAttachments();
  }

  getAttachments() {
    this.getAttachmentsSub = this.api.post('get_attachments', {test_id: this.testId}).subscribe(res => {
      if (res.status) {
        this.show.next(true);
        this.attachments.next(res.attachments);
      }
    })
  }

  delete() {
    const selectedAttachments = this.attachmentsSync.selectedAttachments.getValue();
    this.acceptDialogSub = this.dialog.open(
      AcceptDialogComponent,
      {data: new AcceptOptions(`You really want to delete ${selectedAttachments.length} attached files?`)}
    ).afterClosed().subscribe(res => {
      if (res) {
        this.deleteAttachmentSub = this.api.post('delete_attachments', {
          attachments: selectedAttachments
        }).subscribe(res => {
          if (res.status) {
            this.api.snackMessage(`All selected attachments deleted!`, 2);
            this.attachmentsSync.selectedAttachments.next([]);
            this.getAttachments();
          }
        });
      }
    })
  }

  cancelSelection() {
    this.attachmentsSync.selectedAttachments.next([]);
  }

  attachmentsExists() {
    return this.attachmentsSync.selectedAttachments.getValue().length > 0;
  }

  downloadAll() {
    window.open(`${this.api.getBaseLink()}/files/build_archive?test_id=${this.testId}&pattern=.+`, '_blank')
  }

  downloadLastSelectedItem() {
    const at = this.attachmentsSync.selectedAttachments.getValue()[this.attachmentsSync.selectedAttachments.getValue().length - 1]
    const pattern = at.hasOwnProperty('source_key') ? `${at.source_key}/` : at.name;
    window.open(`${this.api.getBaseLink()}/files/build_archive?test_id=${this.testId}&pattern=${pattern}`, '_blank')
  }
}
