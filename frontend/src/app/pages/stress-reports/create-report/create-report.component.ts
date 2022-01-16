import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import * as moment from 'moment';
import {BehaviorSubject} from 'rxjs';
import {MatDialogRef} from '@angular/material/dialog';
import {ApiService} from '../../../services/api.service';

@Component({
  selector: 'app-create-report',
  templateUrl: './create-report.component.html',
  styleUrls: ['./create-report.component.scss']
})
export class CreateReportComponent implements OnInit {

  name = new FormControl();
  filterValue = new FormControl();
  filterKey = new FormControl();

  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  })

  filters = new BehaviorSubject<any[]>([]);
  dateRanges = new BehaviorSubject<any[]>([]);

  pageProperty = new FormControl('');

  constructor(private api: ApiService,
              private dialogRef: MatDialogRef<CreateReportComponent>) {
  }

  ngOnInit(): void {
  }

  create() {
    if (this.name.value.length == 0) {
      this.api.snackMessage('Report name required!', 5);
      return;
    }

    const config: any = {};
    if (this.filters.getValue()) {
      config['filters'] = this.filters.getValue()
    }

    if (this.dateRanges.getValue()) {
      config['dates'] = this.dateRanges.getValue()
    }

    if (this.pageProperty.value.length > 0) {
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
}
