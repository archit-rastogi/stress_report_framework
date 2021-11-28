import {Component, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {ApiService} from '../../services/api.service';
import {MatDialog} from '@angular/material/dialog';
import {UniverseConfigUploadDialogComponent} from './universe-config-upload-dialog/universe-config-upload-dialog.component';
import {AcceptDialogComponent, AcceptOptions} from '../../components/accept-dialog/accept-dialog.component';

@Component({
  selector: 'app-universe-configs',
  templateUrl: './universe-configs.component.html',
  styleUrls: ['./universe-configs.component.scss']
})
export class UniverseConfigsComponent implements OnInit {

  configs = new BehaviorSubject<Array<any>>([]);
  allowToOpen = true;

  private getUniverseConfigsSub: any;
  private deleteUniverseConfigsSub: any;
  dialogSub: any;

  constructor(private api: ApiService,
              private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.getConfigs();
  }

  getConfigs() {
    this.getUniverseConfigsSub = this.api.post('get_universe_configs', {}).subscribe(res => {
      if (res.status) {
        this.configs.next(res.configs);
      }
    })
  }

  openAddDialog() {
    this.dialog.open(UniverseConfigUploadDialogComponent).afterClosed().subscribe(res => {
      if (res) {
        this.getConfigs();
      }
    })
  }

  openConfig(config: any) {
    if (!this.allowToOpen) {
      return
    }
    window.open(`${this.api.getBaseLink()}/files/get?name=${config.source}`, '_blank')
  }

  deleteConfig(config: any) {
    this.allowToOpen = false;
    setTimeout(() => {
      this.allowToOpen = true
    }, 200)
    this.dialogSub = this.dialog.open(AcceptDialogComponent, {data: new AcceptOptions()}).afterClosed().subscribe(dialogRes => {
      if (dialogRes) {
        this.deleteUniverseConfigsSub = this.api.post('delete_universe_config', {
          id: config.universe_config_id
        }).subscribe(res => {
          if (res.status) {
            this.api.snackMessage('Config deleted!', 2);
            this.getConfigs();
          }
        })
      }
    })
  }
}
