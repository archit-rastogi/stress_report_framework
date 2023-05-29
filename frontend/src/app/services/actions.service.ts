import {Inject, Injectable} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {AddKnownIssueDialogComponent} from '../components/add-known-issue-dialog/add-known-issue-dialog.component';
import {AcceptDialogComponent, AcceptOptions} from '../components/accept-dialog/accept-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {ApiService} from './api.service';
import {EditRunInfoDialogComponent} from '../components/edit-run-info-dialog/edit-run-info-dialog.component';
import {AddCommentDialogComponent} from "../components/add-comment-dialog/add-comment-dialog.component";

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
      AddKnownIssueDialogComponent,
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
        this.requestSub = this.api.post('remove_test_properties', {
          test_ids: this.selectedTests.getValue(),
          properties: ["known_issues"]
        }).subscribe(res => {
          if (res.status) {
            this.api.snackMessage('Known issues removed successfully!', 2);
            this.selectedTests.next([]);
            this.refresh.next(true);
          }
        })
      }
    })
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

  openAddCommentModal() {
    this.dialogSub = this.dialog.open(
      AddCommentDialogComponent,
      {data: this.selectedTests.getValue()}
    ).afterClosed().subscribe(res => {
      if (res) {
        this.selectedTests.next([]);
        this.refresh.next(true);
      }
    });
  }
}
