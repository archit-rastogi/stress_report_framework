import {Component, OnInit} from '@angular/core';
import {ApiService} from '../../services/api.service';
import {Subject} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {CreateReportComponent} from './create-report/create-report.component';
import {EditReportComponent} from './edit-report/edit-report.component';
import {AcceptDialogComponent, AcceptOptions} from '../../components/accept-dialog/accept-dialog.component';

@Component({
  selector: 'app-stress-reports',
  templateUrl: './stress-reports.component.html',
  styleUrls: ['./stress-reports.component.scss']
})
export class StressReportsComponent implements OnInit {
  reports = new Subject<any[]>()
  getReportsSub: any
  dialogSub: any;
  allowToOpen = true;

  constructor(private api: ApiService,
              private router: Router,
              private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.getReports();
  }

  getReports(): void {
    this.getReportsSub = this.api.post('get_reports', {}).subscribe(res => {
      if (res.status) {
        this.reports.next(res.reports);
      }
    })
  }

  openCreateDialog() {
    this.dialogSub = this.dialog.open(CreateReportComponent, {maxWidth: '500px'}).afterClosed().subscribe(res => {
      if (res) {
        this.getReports();
      }
    });
  }

  openReport(report: any) {
    if (this.allowToOpen) {
      this.router.navigateByUrl(`stress_report/${report.name}`);
    }
  }

  editReport(report: any) {
    this.disableOpen();
    this.dialogSub = this.dialog.open(EditReportComponent, {data: report}).afterClosed().subscribe(res => {
      if (res) {
        this.getReports();
      }
    })
  }

  deleteReport(report: any) {
    this.disableOpen();
    this.dialogSub = this.dialog.open(AcceptDialogComponent, {
      data: new AcceptOptions()
    }).afterClosed().subscribe(res => {
      if (res) {
        this.api.post('delete_report', {report_id: report.report_id}).subscribe(res => {
          if (res.status) {
            this.getReports();
            this.api.snackMessage(`Report ${report.name} deleted!`, 2);
          }
        })
      }
    })
  }

  private disableOpen() {
    this.allowToOpen = false;
    setTimeout(() => this.allowToOpen = true, 200);
  }
}
