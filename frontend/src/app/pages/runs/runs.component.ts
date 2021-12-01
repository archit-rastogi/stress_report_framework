import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {BehaviorSubject, Subject} from 'rxjs';
import * as moment from 'moment';
import {ApiService} from '../../services/api.service';
import {MatDialog} from '@angular/material/dialog';
import {AcceptDialogComponent, AcceptOptions} from '../../components/accept-dialog/accept-dialog.component';

@Component({
  selector: 'app-runs',
  templateUrl: './runs.component.html',
  styleUrls: ['./runs.component.scss']
})
export class RunsComponent implements OnInit {
  range = RunsComponent.initDates();
  sourceTests = new BehaviorSubject<Array<any>>([]);
  showTests = new Subject<Array<any>>();
  filters = new BehaviorSubject<Array<any>>([]);
  testsSub: any;
  filterKey = new FormControl();
  filterValue = new FormControl();
  searchSub: number | null = null;
  loading = false;
  selectedTests = new BehaviorSubject<any[]>([]);
  acceptDialogSub: any;
  deleteTestSub: any;

  constructor(private api: ApiService,
              private dialog: MatDialog) {
  }

  private static initDates(): FormGroup {
    return new FormGroup({
      start: new FormControl(moment().subtract(2, 'days').toDate()),
      end: new FormControl(new Date()),
    });
  }

  ngOnInit(): void {
    this.loading = false;
    const localDates = localStorage.getItem('runs_dates');
    if (localDates !== null) {
      const dates = JSON.parse(localDates);
      this.range = new FormGroup({
        start: new FormControl(moment(dates.start * 1000)),
        end: new FormControl(moment(dates.end * 1000)),
      })
    } else {
      this.range = RunsComponent.initDates();
    }
    const localFilters = localStorage.getItem('runs_filters');
    this.getTests(localFilters !== null ? JSON.parse(localFilters) : []);
  }

  getTests(filters: any[] = []) {
    this.filters.next(filters);
    if (this.range.value.end === null) {
      return;
    }
    const {start, end} = this.range.value
    const requestData: any = {
      start: moment(start).startOf('day').unix(),
      end: moment(end).endOf('day').unix()
    }
    if (filters.length > 0) {
      requestData['filters'] = filters
    }
    localStorage.setItem('runs_filters', JSON.stringify(filters));
    localStorage.setItem('runs_dates', JSON.stringify({start: requestData.start, end: requestData.end}));
    this.loading = true;
    this.testsSub = this.api.post('get_tests', requestData).subscribe(res => {
      if (res.status) {
        this.loading = false;
        const tests = res.tests
          .sort((a: any, b: any) => a.start > b.start)
          .map((test: any) => {
            test['start_pretty'] = this.formatData(test.start_time);
            if (test.hasOwnProperty('end_time') && test.end_time !== null) {
              test['end_pretty'] = this.formatData(test.end_time);
            }
            return test;
          });
        this.sourceTests.next(tests);
        this.showTests.next(tests);
      }
    })
  }

  formatData(time: number): string {
    return moment(time * 1000).format('HH:mm:ss DD.MM');
  }

  removeFilter(filter: any) {
    const newFilters = this.filters.getValue().filter(f => f.key != filter.key);
    this.getTests(newFilters);
  }

  addFilter() {
    let existedFilters: any[] = this.filters.getValue();
    existedFilters = existedFilters.filter(f => f.key !== this.filterKey.value)
    existedFilters.push({
      key: this.filterKey.value,
      value: this.filterValue.value,
    });
    this.getTests(existedFilters);
  }

  clearAllFilters() {
    this.getTests();
  }

  contextSearch(change: any) {
    if (change.target.value === '') {
      this.showTests.next(this.sourceTests.getValue());
    }
    if (this.searchSub !== null) {
      clearTimeout(this.searchSub);
    }

    this.searchSub = setTimeout(() => {
      const searchingValue = change.target.value;
      this.showTests.next(this.sourceTests.getValue().filter(test =>
        Object.keys(test.config).find(k => test.config[k].includes(searchingValue)
          || k.includes(searchingValue)
          || test.status.includes(searchingValue)
          || test.start_pretty.includes(searchingValue)
          || (test.hasOwnProperty('end_pretty') && test.end_pretty.includes(searchingValue)))
      ));
      this.searchSub = null;
    }, 300);
  }

  onTestToggle(test: any): void {
    if (this.selectedTests.getValue().includes(test.test_id)) {
      this.selectedTests.next(this.selectedTests.getValue().filter(t => t !== test.test_id));
    } else {
      const selectedTests = this.selectedTests.getValue();
      selectedTests.push(test.test_id);
      this.selectedTests.next(selectedTests);
    }
  }

  deleteSelectedTests() {
    this.acceptDialogSub = this.dialog.open(
      AcceptDialogComponent,
      {data: new AcceptOptions(`Delete all selected ${this.selectedTests.getValue().length} tests`)}
    ).afterClosed().subscribe(res => {
      if (res) {
        this.deleteTestSub = this.api.post('delete_test', {
          test_ids: this.selectedTests.getValue()
        }).subscribe(res => {
          if (res.status) {
            this.api.snackMessage("Deletion in progress! It's take a while", 3);
            this.selectedTests.next([]);
            this.getTests(this.filters.getValue());
          }
        });
      }
    });
  }
}
