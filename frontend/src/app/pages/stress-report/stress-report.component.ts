import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ApiService} from '../../services/api.service';
import {BehaviorSubject, Subject} from 'rxjs';

@Component({
  selector: 'app-stress-report',
  templateUrl: './stress-report.component.html',
  styleUrls: ['./stress-report.component.scss']
})
export class StressReportComponent implements OnInit {
  reportId: string | null = null;

  tests = new Subject<any[]>()
  stats = new BehaviorSubject<any[]>([])
  getReportTestsSub: any;
  selectedTests = new BehaviorSubject<any[]>([]);
  excludeTestsSub: any;

  constructor(private activatedRoute: ActivatedRoute,
              private api: ApiService) {
  }

  ngOnInit(): void {
    this.reportId = this.activatedRoute.snapshot.paramMap.get('id');
    this.getReportTests();
  }

  getReportTests() {
    this.getReportTestsSub = this.api.post('get_report_tests', {name: this.reportId}).subscribe(res => {
      if (res.status) {
        const tests = res.tests.sort((a: any, b: any) => a.start_time - b.start_time);
        const statuses: any = {};
        tests.forEach((test: any) => {
          if (statuses.hasOwnProperty(test.status)) {
            statuses[test.status]++;
          } else {
            statuses[test.status] = 1
          }
        })
        this.stats.next(Object.keys(statuses)
          .sort((a: any, b: any) => a.localeCompare(b))
          .map(key => {
            return {name: key, count: statuses[key]}
          }))
        this.tests.next(tests);
      }
    })
  }

  isSelected(test: any): boolean {
    return this.selectedTests.getValue().includes(test.test_id);
  }

  testSelected(test: any) {
    const selected = this.selectedTests.getValue();
    if (this.isSelected(test)) {
      this.selectedTests.next(selected.filter(t => t !== test.test_id));
    } else {
      selected.push(test.test_id);
      this.selectedTests.next(selected);
    }
  }

  excludeTests() {
    this.excludeTestsSub = this.api.post('add_exclude_tests', {
      tests: this.selectedTests.getValue(),
      name: this.reportId
    }).subscribe(res => {
      if (res.status) {
        this.api.snackMessage(`${this.selectedTests.getValue().length} tests excluded from report!`, 2);
        this.selectedTests.next([]);
        this.getReportTests();
      }
    })
  }

  getChipStyle(stat: any) {
    return {
      backgroundColor: stat.name === 'passed'
        ? 'rgba(6,218,0,0.1)' : stat.name === 'failed'
          ? 'rgba(218,0,0,0.1)' : stat.name === 'running'
            ? 'rgba(218,182,0,0.1)' : ''
    };
  }
}
