import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormGroup} from '@angular/forms';
import {BehaviorSubject} from 'rxjs';
import * as moment from 'moment';
import {ApiService} from '../../../services/api.service';

@Component({
  selector: 'app-edit-report',
  templateUrl: './edit-report.component.html',
  styleUrls: ['./edit-report.component.scss']
})
export class EditReportComponent implements OnInit {

  name = new FormControl({value: '', disabled: true});

  filterValue = new FormControl();
  filterKey = new FormControl();

  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  })

  pageProperty = new FormControl('');

  filters = new BehaviorSubject<any[]>([]);
  dateRanges = new BehaviorSubject<any[]>([]);
  excludedTests = new BehaviorSubject<any[]>([]);
  selectedExcludeTests = new BehaviorSubject<any[]>([]);
  updateReportSub: any;
  getExcludedTestsSub: any;

  constructor(public dialogRef: MatDialogRef<EditReportComponent>,
              @Inject(MAT_DIALOG_DATA) private report: any,
              private api: ApiService) {
  }

  ngOnInit(): void {
    this.name.setValue(this.report.name);
    if (this.report.config.hasOwnProperty('filters')) {
      this.filters.next(this.report.config.filters);
    }
    if (this.report.config.hasOwnProperty('dates')) {
      this.dateRanges.next(this.report.config.dates);
    }
    if (this.report.config.hasOwnProperty('page_property')) {
      this.pageProperty.setValue(this.report.config.page_property);
    }
    this.getExcludedTestsSub = this.api.post('get_excluded_tests', {report_id: this.report.report_id}).subscribe(res => {
      if (res.status) {
        this.excludedTests.next(res.tests);
      }
    })
  }

  addFilter() {
    const oldFilters = this.filters.getValue();
    oldFilters.push({
      key: this.filterKey.value,
      value: this.filterValue.value
    });
    this.filters.next(oldFilters);
    this.filterValue.setValue(null);
    this.filterKey.setValue(null);
  }

  removeFilter(filter: any): void {
    this.filters.next(this.filters.getValue().filter(f => f.key !== filter.key));
  }

  addDateRange() {
    const ranges = this.dateRanges.getValue();
    ranges.push({
      start: moment(this.range.value.start).startOf('day').unix(),
      end: moment(this.range.value.end).endOf('day').unix(),
    });
    this.dateRanges.next(ranges);
  }

  removeDateRange(dateRange: any) {
    this.dateRanges.next(this.dateRanges.getValue().filter(r => r.start !== dateRange.start && r.end !== dateRange.end));
  }

  formatData(time: number): string {
    return moment(time * 1000).format('DD.MM.YYYY');
  }

  update() {
    this.report.config['filters'] = this.filters.getValue();
    this.report.config['dates'] = this.dateRanges.getValue();
    this.report.config['excludes'] = this.excludedTests.getValue().map(t => t.test_id);
    if (this.pageProperty.value.length > 0) {
      this.report.config['page_property'] = this.pageProperty.value;
    }
    this.updateReportSub = this.api.post('update_report', {
      config: this.report.config,
      report_id: this.report.report_id
    }).subscribe(res => {
      if (res.status) {
        this.api.snackMessage('Report updated!', 2);
        this.dialogRef.close(true);
      }
    })
  }

  removeFromExcluded() {
    this.excludedTests.next(this.excludedTests.getValue().filter(test => !this.selectedExcludeTests.getValue().includes(test.test_id)));
    this.selectedExcludeTests.next([]);
  }

  selectTest(test: any) {
    const selectedExcludeTests = this.selectedExcludeTests.getValue();
    if (selectedExcludeTests.includes(test.test_id)) {
      this.selectedExcludeTests.next(selectedExcludeTests.filter(t => t !== test.test_id));
    } else {
      selectedExcludeTests.push(test.test_id);
      this.selectedExcludeTests.next(selectedExcludeTests);
    }

  }

  isSelected(exclude: any): boolean {
    return this.selectedExcludeTests.getValue().includes(exclude.test_id);
  }
}
