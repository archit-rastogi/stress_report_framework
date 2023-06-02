import {Component, Inject, OnInit, signal, WritableSignal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormGroup} from '@angular/forms';
import * as moment from 'moment';
import {ApiService} from '../../../services/api.service';

@Component({
  selector: 'app-edit-report',
  templateUrl: './edit-report.component.html',
  styleUrls: ['./edit-report.component.scss']
})
export class EditReportComponent implements OnInit {

  name = new FormControl('');

  filterValue = new FormControl();
  filterKey = new FormControl();

  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  })

  pageProperty = new FormControl('');

  filters: WritableSignal<any[]> = signal([]);
  dateRanges: WritableSignal<any[]> = signal([]);
  excludedTests: WritableSignal<any[]> = signal([]);
  selectedExcludeTests: WritableSignal<any[]> = signal([]);
  updateReportSub: any;
  getExcludedTestsSub: any;

  constructor(public dialogRef: MatDialogRef<EditReportComponent>,
              @Inject(MAT_DIALOG_DATA) private report: any,
              private api: ApiService) {
  }

  ngOnInit(): void {
    this.name.setValue(this.report.name);
    if (this.report.config.hasOwnProperty('filters')) {
      this.filters.set(this.report.config.filters);
    }
    if (this.report.config.hasOwnProperty('dates')) {
      this.dateRanges.set(this.report.config.dates);
    }
    if (this.report.config.hasOwnProperty('page_property')) {
      this.pageProperty.setValue(this.report.config.page_property);
    }
    this.getExcludedTestsSub = this.api.post('get_excluded_tests', {report_id: this.report.report_id}).subscribe(res => {
      if (res.status) {
        this.excludedTests.set(res.tests);
      }
    })
  }

  addFilter() {
    const oldFilters = this.filters();
    oldFilters.push({
      key: this.filterKey.value,
      value: this.filterValue.value
    });
    this.filters.set(oldFilters);
    this.filterValue.setValue(null);
    this.filterKey.setValue(null);
  }

  removeFilter(filter: any): void {
    this.filters.set(this.filters().filter(f => f.key !== filter.key));
  }

  addDateRange() {
    const ranges = this.dateRanges();
    ranges.push({
      start: moment(this.range.value.start).startOf('day').unix(),
      end: moment(this.range.value.end).endOf('day').unix(),
    });
    this.dateRanges.set(ranges);
  }

  removeDateRange(dateRange: any) {
    this.dateRanges.set(this.dateRanges().filter(r => r.start !== dateRange.start && r.end !== dateRange.end));
  }

  formatData(time: number): string {
    return moment(time * 1000).format('DD.MM.YYYY');
  }

  update() {
    const newConfig: any = {
      filters: this.filters(),
      dates: this.dateRanges(),
      excludes: this.excludedTests().map(t => t.test_id),
    };
    if (this.pageProperty.value !== null && this.pageProperty.value.length > 0) {
      newConfig.page_property = this.pageProperty.value;
    }
    this.updateReportSub = this.api.post('update_report', {
      config: newConfig,
      name: this.name.value,
      report_id: this.report.report_id
    }).subscribe(res => {
      if (res.status) {
        this.api.snackMessage('Report updated!', 2);
        this.dialogRef.close(true);
      }
    })
  }

  removeFromExcluded() {
    this.excludedTests.set(this.excludedTests().filter(test => !this.selectedExcludeTests().includes(test.test_id)));
    this.selectedExcludeTests.set([]);
  }

  selectTest(test: any) {
    const selectedExcludeTests = this.selectedExcludeTests();
    if (selectedExcludeTests.includes(test.test_id)) {
      this.selectedExcludeTests.set(selectedExcludeTests.filter(t => t !== test.test_id));
    } else {
      selectedExcludeTests.push(test.test_id);
      this.selectedExcludeTests.set(selectedExcludeTests);
    }

  }

  isSelected(exclude: any): boolean {
    return this.selectedExcludeTests().includes(exclude.test_id);
  }
}
