import {Component, effect, OnDestroy, OnInit, signal, WritableSignal} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import * as moment from 'moment';
import {ApiService} from '../../services/api.service';
import {ActionsService} from '../../services/actions.service';

@Component({
  selector: 'app-runs',
  templateUrl: './runs.component.html',
  styleUrls: ['./runs.component.scss']
})
export class RunsComponent implements OnInit, OnDestroy {
  open = false;
  range = RunsComponent.initDates();
  sourceTests: WritableSignal<Array<any>> = signal([]);
  showTests: WritableSignal<Array<any>> = signal([]);
  testsSub: any;
  contextSearch = new FormControl();
  searchSub: any = null;
  loading = false;

  private acceptDialogSub: any;

  constructor(private api: ApiService, public actionsService: ActionsService) {
    effect(() => {
      if (actionsService.refresh() && this.open) {
        this.getTests();
      }
    })
  }

  private static initDates(): FormGroup {
    return new FormGroup({
      start: new FormControl(moment().subtract(2, 'days').toDate()),
      end: new FormControl(new Date()),
    });
  }

  ngOnDestroy() {
    this.actionsService.selectedTests.set([]);
    this.open = false;
    this.api.unsub(this.acceptDialogSub);
  }

  ngOnInit(): void {
    this.open = true;
    const runsContextSearch = localStorage.getItem('runsContextSearch')
    if (runsContextSearch !== null) {
      this.contextSearch.setValue(runsContextSearch);
    }
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
    this.getTests();
  }

  getTests() {
    if (this.range.value.end === null) {
      return;
    }
    const {start, end} = this.range.value
    const requestData: any = {
      start: moment(start).startOf('day').unix(),
      end: moment(end).endOf('day').unix()
    }
    localStorage.setItem('runs_dates', JSON.stringify({start: requestData.start, end: requestData.end}));
    this.loading = true;
    this.testsSub = this.api.post('get_tests', requestData).subscribe(res => {
      if (res.status) {
        this.loading = false;
        const tests = res.tests
          .sort((a: any, b: any) => a.start - b.start)
          .map((test: any) => {
            test['start_pretty'] = this.formatData(test.start_time);
            if (test.hasOwnProperty('end_time') && test.end_time !== null) {
              test['end_pretty'] = this.formatData(test.end_time);
            }
            return test;
          });
        this.sourceTests.set(tests);
        this.showTests.set(tests);
        const contextSearchText = localStorage.getItem('runsContextSearch')
        if (contextSearchText !== null) {
          this.filterByContext(contextSearchText);
        }
      }
    })
  }

  formatData(time: number): string {
    return moment(time * 1000).format('HH:mm:ss DD.MM');
  }

  filterByContext(text: string) {
    this.showTests.set(this.sourceTests().filter(test =>
      Object.keys(test.config).find(k => test.config[k].toString().includes(text)
        || k.includes(text)
        || test.status.includes(text)
        || (test.start_pretty ? test.start_pretty.includes(text) : false)
        || (test.hasOwnProperty('end_pretty') && test.end_pretty.includes(text)))
    ));
  }

  searchContext(change: any) {
    if (change.target.value === '') {
      this.showTests.set(this.sourceTests());
      localStorage.removeItem('runsContextSearch');
    }
    if (this.searchSub !== null) {
      clearTimeout(this.searchSub);
    }

    this.searchSub = setTimeout(() => {
      this.filterByContext(change.target.value);
      localStorage.setItem('runsContextSearch', change.target.value);
      this.searchSub = null;
    }, 300);
  }

  onTestToggle(test: any): void {
    if (this.actionsService.selectedTests().includes(test.test_id)) {
      this.actionsService.selectedTests.set(
        this.actionsService.selectedTests().filter(t => t !== test.test_id)
      );
    } else {
      const selectedTests = this.actionsService.selectedTests();
      selectedTests.push(test.test_id);
      this.actionsService.selectedTests.set(selectedTests);
    }
  }

  findTests() {
    this.getTests();
  }

  selectAllShown() {
    const selectedTests = this.actionsService.selectedTests();
    this.showTests().forEach((test: any) => {
      if (!selectedTests.includes(test.test_id)) {
        selectedTests.push(test.test_id);
      }
    })
    this.actionsService.selectedTests.set(selectedTests);
  }

  today() {
    this.range = new FormGroup({
      start: new FormControl(moment().subtract(0, 'days').toDate()),
      end: new FormControl(new Date()),
    });
    this.getTests();
  }
}
