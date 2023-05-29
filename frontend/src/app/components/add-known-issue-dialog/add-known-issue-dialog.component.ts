import {Component, Inject, OnDestroy} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormControl} from '@angular/forms';
import {ApiService} from '../../services/api.service';

@Component({
  selector: 'app-add-known-issue-dialog',
  templateUrl: './add-known-issue-dialog.component.html',
  styleUrls: ['./add-known-issue-dialog.component.scss']
})
export class AddKnownIssueDialogComponent implements OnDestroy {

  knownIssueUrl = new FormControl('');
  private addKnownIssuesSub: any;

  constructor(@Inject(MAT_DIALOG_DATA) private selectedTestsIds: string[],
              public dialogRef: MatDialogRef<AddKnownIssueDialogComponent>,
              private api: ApiService) {
  }

  ngOnDestroy() {
    this.api.unsub(this.addKnownIssuesSub);
  }

  submit() {
    this.addKnownIssuesSub = this.api.post('add_test_properties', {
      test_ids: this.selectedTestsIds,
      properties: {
        known_issues: this.knownIssueUrl.value
      }
    }).subscribe(res => {
      if (res.status) {
        this.api.snackMessage("Known issue was added successfully!", 2);
        this.dialogRef.close(true);
      }
    })
  }

}
