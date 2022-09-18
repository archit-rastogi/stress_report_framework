import {Component, Inject, OnDestroy} from '@angular/core';
import {FormControl} from '@angular/forms';
import {BehaviorSubject} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ApiService} from '../../services/api.service';

@Component({
  selector: 'app-remove-properties',
  templateUrl: './remove-properties.component.html',
  styleUrls: ['./remove-properties.component.scss']
})
export class RemovePropertiesComponent implements OnDestroy {
  key = new FormControl('');
  properties = new BehaviorSubject<string[]>([]);
  private removeTestSub: any;

  constructor(@Inject(MAT_DIALOG_DATA) public testIds: string[],
              private dialogRef: MatDialogRef<RemovePropertiesComponent>,
              private api: ApiService) {
  }

  ngOnDestroy(): void {
    this.api.unsub(this.removeTestSub);
  }

  submit() {
    this.removeTestSub = this.api.post('remove_test_properties', {
      test_ids: this.testIds,
      properties: this.properties.getValue()
    }).subscribe(res => {
      if (res.status) {
        this.api.snackMessage('Properties removed successfully!', 2);
        this.dialogRef.close(true);
      }
    });
  }

  add(): void {
    const props = this.properties.getValue();
    if (this.key.value != null) {
      props.push(this.key.value);
    }
    this.properties.next(props);
    this.key.setValue('');
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
