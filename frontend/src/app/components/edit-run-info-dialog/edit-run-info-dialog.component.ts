import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ApiService} from '../../services/api.service';
import {FormControl, FormGroup} from '@angular/forms';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-edit-run-info-dialog',
  templateUrl: './edit-run-info-dialog.component.html',
  styleUrls: ['./edit-run-info-dialog.component.scss']
})
export class EditRunInfoDialogComponent implements OnInit, OnDestroy {

  form = new FormGroup({});
  newKey = new FormControl();
  newValue = new FormControl();
  formFields: string[] = [];

  private editTestInfoSub: Subscription;
  private infoSub: Subscription;

  constructor(@Inject(MAT_DIALOG_DATA) private testId: string,
              private dialogRef: MatDialogRef<EditRunInfoDialogComponent>,
              private api: ApiService) {
    this.infoSub = new Subscription();
    this.editTestInfoSub = new Subscription();
  }

  ngOnInit(): void {
    this.infoSub = this.api.post('get_test_info', {test_id: this.testId}).subscribe(res => {
      if (res.status) {
        const fields: any = {}
        Object.keys(res.test_info.config)
          .sort((a: string, b: string) => a.localeCompare(b))
          .forEach(key => {
            fields[key] = new FormControl(res.test_info.config[key])
          })
        this.form = new FormGroup(fields);
        this.formFields = Object.keys(res.test_info.config);
      }
    })
  }

  ngOnDestroy() {
    this.api.unsub(this.infoSub);
    this.api.unsub(this.editTestInfoSub);
  }

  addField() {
    this.form.addControl(this.newKey.value, new FormControl(this.newValue.value))
    this.formFields.push(this.newKey.value);
    this.newKey.setValue('');
    this.newValue.setValue('');
  }


  update() {
    this.editTestInfoSub = this.api.post('edit_test_info', {
      test_id: this.testId,
      info: this.form.value
    }).subscribe(res => {
      if (res.status) {
        this.dialogRef.close(true);
      }
    })
  }

  close() {
    this.dialogRef.close(false);
  }

  deleteRow(field: string) {
    this.form.removeControl(field);
    this.formFields = this.formFields.filter(f => f !== field);
  }
}
