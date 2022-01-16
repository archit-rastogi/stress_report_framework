import {Component, Inject, OnDestroy} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ApiService} from '../../services/api.service';
import {BehaviorSubject} from 'rxjs';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-add-properties',
  templateUrl: './add-properties.component.html',
  styleUrls: ['./add-properties.component.scss']
})
export class AddPropertiesComponent implements OnDestroy {

  key = new FormControl('');
  value = new FormControl('');

  properties = new BehaviorSubject<any[]>([])

  private addTestPropertiesSub: any;

  constructor(@Inject(MAT_DIALOG_DATA) public testIds: string[],
              private dialogRef: MatDialogRef<AddPropertiesComponent>,
              private api: ApiService) {
  }

  ngOnDestroy(): void {
    this.api.unsub(this.addTestPropertiesSub);
  }

  submit() {
    this.addTestPropertiesSub = this.api.post('add_test_properties', {
      test_ids: this.testIds,
      properties: this.properties.getValue()
    }).subscribe(res => {
      if (res.status) {
        this.api.snackMessage('Properties added successfully!', 2);
        this.dialogRef.close(true);
      }
    });
  }

  add(): void {
    const props = this.properties.getValue();
    props.push({key: this.key.value, value: this.value.value});
    this.properties.next(props);
    this.key.setValue('');
    this.value.setValue('');
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
