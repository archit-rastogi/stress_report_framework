import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from "@angular/material/button";

export class AcceptOptions {
  question: string;
  approve: string;
  discard: string;

  constructor(question = 'Are you sure?', approve = 'Yes', discard = 'No') {
    this.question = question;
    this.approve = approve;
    this.discard = discard;
  }
}

@Component({
  selector: 'app-accept-dialog',
  templateUrl: './accept-dialog.component.html',
  styleUrls: ['./accept-dialog.component.scss'],
})
export class AcceptDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: AcceptOptions,
              private dialogRef: MatDialogRef<AcceptDialogComponent>) {
  }

  approve() {
    this.dialogRef.close(true);
  }

  discard() {
    this.dialogRef.close(false);
  }

}
