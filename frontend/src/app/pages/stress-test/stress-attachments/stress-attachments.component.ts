import {Component, Input, OnInit} from '@angular/core';
import {ApiService} from '../../../services/api.service';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-stress-attachments',
  templateUrl: './stress-attachments.component.html',
  styleUrls: ['./stress-attachments.component.scss']
})
export class StressAttachmentsComponent implements OnInit {

  @Input() testId: string | undefined | null;
  attachments = new Subject<Array<any>>();
  show = new Subject<boolean>();
  getAttachmentsSub: any;
  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.getAttachmentsSub = this.api.post('get_attachments', {test_id: this.testId}).subscribe(res => {
      if (res.status) {
        this.show.next(true);
        this.attachments.next(res.attachments);
      }
    })
  }
}
