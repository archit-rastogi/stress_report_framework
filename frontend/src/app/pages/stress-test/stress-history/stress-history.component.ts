import {Component, Input, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {ApiService} from '../../../services/api.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-stress-history',
  templateUrl: './stress-history.component.html',
  styleUrls: ['./stress-history.component.scss']
})
export class StressHistoryComponent implements OnInit {

  @Input() testId: string | undefined | null;
  foundReports = new BehaviorSubject<any[]>([]);
  test = new BehaviorSubject({});
  loading = false;

  private getHistorySub: any;

  constructor(private api: ApiService, private router: Router) {
  }

  ngOnInit(): void {
    this.loading = true;
    this.getHistorySub = this.api.post('get_test_history', {
      test_id: this.testId
    }).subscribe(res => {
      if (res.status) {
        this.loading = false;
        this.foundReports.next(res.found_reports);
      }
    });
  }

  getCardStyle(test: any): any {
    if (test.test_id === this.testId) {
      return {
        'background-color': 'rgba(90,0,178,0.4)'
      }
    }
    switch (test.status) {
      case 'passed': {
        return {backgroundColor: 'rgba(38,134,0,0.3)'};
      }
      case 'failed': {
        return {backgroundColor: 'rgba(255,0,0,0.3)'};
      }
      case 'running': {
        return {backgroundColor: 'rgba(175,152,0,0.3)'};
      }
    }
  }

  openReport(reportName: string) {
    window.open(`${this.api.getBaseLink()}/stress_report/${reportName}`, '_blank')
  }

  openTest(testId: string) {
    window.open(`${this.api.getBaseLink()}/stress_test/${testId}`, '_blank')
  }
}
