import {Component, Inject, OnDestroy, OnInit, signal, WritableSignal} from '@angular/core';
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
  newStatus = new FormControl();
  exception = new FormControl();
  showStatusChange: WritableSignal<boolean> = signal(false)
  formFields: string[] = [];
  statusOptions = ['failed', 'passed', 'running'];

  private editTestInfoSub: Subscription;
  private infoSub: Subscription;

  constructor(@Inject(MAT_DIALOG_DATA) private testIds: string[],
              private dialogRef: MatDialogRef<EditRunInfoDialogComponent>,
              private api: ApiService) {
    this.infoSub = new Subscription();
    this.editTestInfoSub = new Subscription();
  }

  ngOnInit(): void {
    this.infoSub = this.api.post('get_tests_info', {test_ids: this.testIds}).subscribe(res => {
      if (res.status) {
        let uniqueConfigs: any = {};
        if (res.tests_info.length == 1) {
          this.newStatus.setValue(res.tests_info[0].status);
          this.showStatusChange.set(true);
        }
        res.tests_info.forEach((test: any) => {
          if (Object.keys(uniqueConfigs).length === 0) {
            uniqueConfigs = test.config;
          } else {
            const uniqueKeys: any[] = Object.keys(test.config)
              .filter(key => Object.keys(uniqueConfigs).includes(key) && uniqueConfigs[key] === test.config[key]);
            const newUniqueConfig: any = {};
            uniqueKeys.forEach(k => newUniqueConfig[k] = uniqueConfigs[k])
            uniqueConfigs = newUniqueConfig;
          }
        })
        const fields: any = {}
        Object.keys(uniqueConfigs)
          .sort((a: string, b: string) => a.localeCompare(b))
          .forEach(key => {
            fields[key] = new FormControl(uniqueConfigs[key])
          })
        this.form = new FormGroup(fields);
        this.formFields = Object.keys(uniqueConfigs);
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
    this.editTestInfoSub = this.api.post('edit_tests', {
      test_ids: this.testIds,
      info: this.form.value,
      exception: this.exception.value,
      status: this.newStatus.value
    }).subscribe(res => {
      if (res.status) {
        this.dialogRef.close(true);
      } else {
        this.api.snackMessage(`Failed to update: ${res.reason}`, 6);
      }
    })
  }

  deleteRow(field: string) {
    this.form.removeControl(field);
    this.formFields = this.formFields.filter(f => f !== field);
  }
}
