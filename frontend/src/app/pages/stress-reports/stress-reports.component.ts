import {Component, OnInit} from '@angular/core';
import {ApiService} from '../../services/api.service';
import {BehaviorSubject} from 'rxjs';
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
  reports = new BehaviorSubject<any[]>([])
  getReportsSub: any
  dialogSub: any;
  allowToOpen = true;
  loading = false;
  orderByCategory: string = 'name';
  orderByCategoryOrder: string = 'up';

  constructor(private api: ApiService,
              private router: Router,
              private dialog: MatDialog) {
  }

  ngOnInit(): void {
    let sortCategory = localStorage.getItem('reports_sort_category')
    let sortOrder = localStorage.getItem('reports_sort_order')
    if (sortCategory !== null && sortOrder !== null) {
      this.orderByCategory = sortCategory;
      this.orderByCategoryOrder = sortOrder;
    } else {
      this.orderByCategory = 'name'
      this.orderByCategoryOrder = 'up'
      localStorage.setItem('reports_sort_category', 'name');
      localStorage.setItem('reports_sort_order', 'up');
    }
    this.loading = false;
    this.getReports();
  }

  getReports(): void {
    this.loading = true;
    this.getReportsSub = this.api.post('get_reports', {}).subscribe(res => {
      if (res.status) {
        this.loading = false;
        this.reports.next(this.getResults(res.reports));
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

  changeSort(name: string) {
    if (name === this.orderByCategory) {
      this.orderByCategoryOrder = this.orderByCategoryOrder === 'up' ? 'down' : 'up'
    }
    this.orderByCategory = name;
    localStorage.setItem('reports_sort_category', this.orderByCategory)
    localStorage.setItem('reports_sort_order', this.orderByCategoryOrder)
    this.reports.next(this.getResults(this.reports.getValue()));
  }

  private disableOpen() {
    this.allowToOpen = false;
    setTimeout(() => this.allowToOpen = true, 200);
  }

  private getResults(reports: any[]): any[] {
    return reports.sort((a: any, b: any) => {
      let compareResult;
      if (this.orderByCategory === 'name') {
        compareResult = a.name.localeCompare(b.name);
        if (this.orderByCategoryOrder !== 'up') {
          compareResult = compareResult * -1;
        }
      } else {
        compareResult = a.start_time - b.start_time;
        if (this.orderByCategoryOrder !== 'up') {
          compareResult = compareResult * -1;
        }
      }
      return compareResult;
    }).map((obj: any) => {
      obj.prettyName = obj.name.replace(new RegExp('_', 'g'), ' ');
      return obj;
    });
  }
}
