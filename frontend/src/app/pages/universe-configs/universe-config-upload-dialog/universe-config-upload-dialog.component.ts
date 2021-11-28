import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatDialogRef} from '@angular/material/dialog';
import {ApiService} from '../../../services/api.service';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-universe-config-upload-dialog',
  templateUrl: './universe-config-upload-dialog.component.html',
  styleUrls: ['./universe-config-upload-dialog.component.scss']
})
export class UniverseConfigUploadDialogComponent implements OnInit {

  name = new FormControl();
  addUniverseConfigSub: any;
  fileData = new BehaviorSubject<any>(null);

  constructor(private dialogRef: MatDialogRef<UniverseConfigUploadDialogComponent>,
              private api: ApiService) {
  }

  ngOnInit(): void {
  }

  handle(files: any) {
    const fileReader = new FileReader();
    fileReader.readAsText(files.target.files.item(0), 'UTF-8');
    fileReader.onload = () => {
      if (typeof fileReader.result === 'string') {
        this.fileData.next(JSON.parse(fileReader.result));
      } else {
        this.api.snackMessage('Failed to parse file!', 4);
      }
    }
    fileReader.onerror = (error) => {
      this.api.snackMessage(`Failed to parse json file: ${error}`, 5);
    }
  }

  upload() {
    this.addUniverseConfigSub = this.api.post('add_universe_config', {
      config: this.fileData.getValue(),
      name: this.name.value
    }).subscribe(res => {
      if (res.status) {
        this.api.snackMessage(`Universe config ${this.name.value} added!`, 2);
        this.dialogRef.close(true);
      }
    });
  }
}
