import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ApiService} from "../../services/api.service";
import {AddKnownIssueComponent} from "../add-known-issue/add-known-issue.component";
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-add-comment-dialog',
  templateUrl: './add-comment-dialog.component.html',
  styleUrls: ['./add-comment-dialog.component.scss']
})
export class AddCommentDialogComponent implements OnInit, OnDestroy {

  comment = new FormControl('');
  private addCommentSub: any;

  constructor(@Inject(MAT_DIALOG_DATA) private selectedTestsIds: string[],
              public dialogRef: MatDialogRef<AddKnownIssueComponent>,
              private api: ApiService) {
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.api.unsub(this.addCommentSub);
  }

  submit() {
    this.addCommentSub = this.api.post('add_test_properties', {
      test_ids: this.selectedTestsIds,
      properties: {
        comment: this.comment.value
      }
    }).subscribe(res => {
      if (res.status) {
        this.api.snackMessage("Comment was added successfully!", 2);
        this.dialogRef.close(true);
      }
    })
  }
}
