import {Injectable, signal, WritableSignal} from '@angular/core';
import {AddKnownIssueDialogComponent} from '../components/add-known-issue-dialog/add-known-issue-dialog.component';
import {AcceptDialogComponent, AcceptOptions} from '../components/accept-dialog/accept-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {ApiService} from './api.service';
import {EditRunInfoDialogComponent} from '../components/edit-run-info-dialog/edit-run-info-dialog.component';
import {AddCommentDialogComponent} from "../components/add-comment-dialog/add-comment-dialog.component";

@Injectable()
export class ActionsService {
  selectedTests: WritableSignal<string[]> = signal([]);
  refresh: WritableSignal<boolean> = signal(false);
  dialogSub: any;
  requestSub: any;

  constructor(private dialog: MatDialog,
              private api: ApiService) {
  }

  openAddKnownIssue() {
    this.dialogSub = this.dialog.open(
      AddKnownIssueDialogComponent,
      {data: this.selectedTests()}
    ).afterClosed().subscribe(res => {
      if (res) {
        this.selectedTests.set([]);
        this.refresh.set(true);
      }
    });
  }

  removeKnownIssues() {
    this.dialogSub = this.dialog.open(
      AcceptDialogComponent,
      {data: new AcceptOptions(`Delete known issues for ${this.selectedTests().length} tests`)}
    ).afterClosed().subscribe(res => {
      if (res) {
        this.requestSub = this.api.post('remove_test_properties', {
          test_ids: this.selectedTests(),
          properties: ["known_issues"]
        }).subscribe(res => {
          if (res.status) {
            this.api.snackMessage('Known issues removed successfully!', 2);
            this.selectedTests.set([]);
            this.refresh.set(true);
          }
        })
      }
    })
  }

  deleteSelectedTests() {
    this.dialogSub = this.dialog.open(
      AcceptDialogComponent,
      {data: new AcceptOptions(`Delete all selected ${this.selectedTests().length} tests`)}
    ).afterClosed().subscribe(res => {
      if (res) {
        this.requestSub = this.api.post('delete_test', {
          test_ids: this.selectedTests()
        }).subscribe(res => {
          if (res.status) {
            this.api.snackMessage('Deletion in progress! It\'s take a while', 3);
            this.selectedTests.set([]);
            this.refresh.set(true);
          }
        });
      }
    });
  }

  openEditModal() {
    this.dialogSub = this.dialog.open(
      EditRunInfoDialogComponent,
      {data: this.selectedTests()}
    ).afterClosed().subscribe(res => {
      if (res) {
        this.selectedTests.set([]);
        this.refresh.set(true);
      }
    });
  }

  openAddCommentModal() {
    this.dialogSub = this.dialog.open(
      AddCommentDialogComponent,
      {data: this.selectedTests()}
    ).afterClosed().subscribe(res => {
      if (res) {
        this.selectedTests.set([]);
        this.refresh.set(true);
      }
    });
  }
}
