import {Component, OnInit, signal, WritableSignal} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import * as moment from 'moment';
import {MatDialogRef} from '@angular/material/dialog';
import {ApiService} from '../../../services/api.service';

@Component({
  selector: 'app-create-report-dialog',
  templateUrl: './create-report-dialog.component.html',
  styleUrls: ['./create-report-dialog.component.scss']
})
export class CreateReportDialogComponent implements OnInit {

  name = new FormControl();
  filterValue = new FormControl();
  filterKey = new FormControl();

  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  })

  filters: WritableSignal<any[]> = signal([]);
  dateRanges: WritableSignal<any[]> = signal([]);

  pageProperty = new FormControl('');

  constructor(private api: ApiService,
              private dialogRef: MatDialogRef<CreateReportDialogComponent>) {
  }

  ngOnInit(): void {
  }

  create() {
    if (this.name.value.length == 0) {
      this.api.snackMessage('Report name required!', 5);
      return;
    }

    const config: any = {};
    if (this.filters()) {
      config['filters'] = this.filters()
    }

    if (this.dateRanges()) {
      config['dates'] = this.dateRanges()
    }

    if (this.pageProperty.value !== null && this.pageProperty.value.length > 0) {
      config['page_property'] = this.pageProperty.value;
    }

    this.api.post('add_report', {
      name: this.name.value,
      config
    }).subscribe(res => {
      if (res.status) {
        this.api.snackMessage("Report created!", 2);
        this.dialogRef.close(true);
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
}
