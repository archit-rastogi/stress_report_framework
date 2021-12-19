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
        this.tests.next(res.tests.sort((a: any, b: any) => a.start_time - b.start_time));
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
}
