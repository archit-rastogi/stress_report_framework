import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormControl} from '@angular/forms';
import {ApiService} from '../../services/api.service';

@Component({
  selector: 'app-add-known-issue',
  templateUrl: './add-known-issue.component.html',
  styleUrls: ['./add-known-issue.component.scss']
})
export class AddKnownIssueComponent implements OnDestroy {

  knownIssueUrl = new FormControl('');
  private addKnownIssuesSub: any;

  constructor(@Inject(MAT_DIALOG_DATA) private selectedTestsIds: string[],
              public dialogRef: MatDialogRef<AddKnownIssueComponent>,
              private api: ApiService) {
  }

  ngOnDestroy() {
    this.api.unsub(this.addKnownIssuesSub);
  }

  submit() {
    this.addKnownIssuesSub = this.api.post('add_test_known_issue', {
      tests_ids: this.selectedTestsIds,
      known_issue: this.knownIssueUrl.value
    }).subscribe(res => {
      if (res.status) {
        this.api.snackMessage("Known issue was added successfully!", 2);
        this.dialogRef.close(true);
      }
    })
  }

}
