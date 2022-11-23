import {Inject, Injectable} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {AddKnownIssueComponent} from '../components/add-known-issue/add-known-issue.component';
import {AcceptDialogComponent, AcceptOptions} from '../components/accept-dialog/accept-dialog.component';
import {AddPropertiesComponent} from '../components/add-properties/add-properties.component';
import {RemovePropertiesComponent} from '../components/remove-properties/remove-properties.component';
import {MatDialog} from '@angular/material/dialog';
import {ApiService} from './api.service';
import {EditRunInfoDialogComponent} from '../components/edit-run-info-dialog/edit-run-info-dialog.component';

@Injectable()
export class ActionsService {
  selectedTests = new BehaviorSubject<string[]>([]);
  refresh = new Subject<boolean>();
  dialogSub: any;
  requestSub: any;

  constructor(private dialog: MatDialog,
              private api: ApiService) {
  }

  openAddKnownIssue() {
    this.dialogSub = this.dialog.open(
      AddKnownIssueComponent,
      {data: this.selectedTests.getValue()}
    ).afterClosed().subscribe(res => {
      if (res) {
        this.selectedTests.next([]);
        this.refresh.next(true);
      }
    });
  }

  removeKnownIssues() {
    this.dialogSub = this.dialog.open(
      AcceptDialogComponent,
      {data: new AcceptOptions(`Delete known issues for ${this.selectedTests.getValue().length} tests`)}
    ).afterClosed().subscribe(res => {
      if (res) {
        this.requestSub = this.api.post('remove_test_known_issue', {tests_ids: this.selectedTests.getValue()}).subscribe(res => {
          if (res.status) {
            this.api.snackMessage('Known issues removed successfully!', 2);
            this.selectedTests.next([]);
            this.refresh.next(true);
          }
        })
      }
    })
  }



  openAddProperties() {
    this.dialogSub = this.dialog.open(AddPropertiesComponent, {data: this.selectedTests.getValue()})
      .afterClosed()
      .subscribe(res => {
        if (res) {
          this.selectedTests.next([]);
          this.refresh.next(true);
        }
      });
  }

  openRemoveProperties() {
    this.dialogSub = this.dialog.open(RemovePropertiesComponent, {data: this.selectedTests.getValue()})
      .afterClosed()
      .subscribe(res => {
        if (res) {
          this.selectedTests.next([]);
          this.refresh.next(true);
        }
      });
  }


  deleteSelectedTests() {
    this.dialogSub = this.dialog.open(
      AcceptDialogComponent,
      {data: new AcceptOptions(`Delete all selected ${this.selectedTests.getValue().length} tests`)}
    ).afterClosed().subscribe(res => {
      if (res) {
        this.requestSub = this.api.post('delete_test', {
          test_ids: this.selectedTests.getValue()
        }).subscribe(res => {
          if (res.status) {
            this.api.snackMessage('Deletion in progress! It\'s take a while', 3);
            this.selectedTests.next([]);
            this.refresh.next(true);
          }
        });
      }
    });
  }

  openEditModal() {
    this.dialogSub = this.dialog.open(
      EditRunInfoDialogComponent,
      {data: this.selectedTests.getValue()}
    ).afterClosed().subscribe(res => {
      if (res) {
        this.selectedTests.next([]);
        this.refresh.next(true);
      }
    });
  }
}
