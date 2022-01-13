import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ApiService} from '../../services/api.service';
import {BehaviorSubject} from 'rxjs';
import {FormControl} from '@angular/forms';
import {AcceptDialogComponent, AcceptOptions} from '../../components/accept-dialog/accept-dialog.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-stress-report',
  templateUrl: './stress-report.component.html',
  styleUrls: ['./stress-report.component.scss']
})
export class StressReportComponent implements OnInit, OnDestroy {
  reportId: string | null = null;

  tests = new BehaviorSubject<any[]>([])
  showTests = new BehaviorSubject<any[]>([])
  stats = new BehaviorSubject<any[]>([])
  selectedTests = new BehaviorSubject<any[]>([]);
  contextSearch = new FormControl('');
  loading = false;
  activeChip = new BehaviorSubject<string>('all');

  private excludeTestsSub: any;
  private getReportTestsSub: any;
  private acceptDialogSub: any;
  private deleteTestSub: any;
  private searchSub: number | null = null;

  constructor(private activatedRoute: ActivatedRoute,
              private api: ApiService,
              private dialog: MatDialog) {
  }

  filterChips(chipName: string) {
    let filter = (_: any) => true;
    switch (chipName) {
      case 'running': {
        filter = (test: any) => test.status == 'running';
        break;
      }
      case 'failed': {
        filter = (test: any) => test.status == 'failed';
        break;
      }
      case 'passed': {
        filter = (test: any) => test.status == 'passed';
        break;
      }
      case 'all': {
        filter = (_: any) => true;
        break;
      }
    }
    this.activeChip.next(chipName);

    this.showTests.next(
      this.tests.getValue()
        .filter((test: any) => filter(test) && this.testContainedText(test, this.contextSearch.value))
    );
  }

  ngOnInit(): void {
    const contextSearchText = localStorage.getItem('reportContextSearch')
    if (contextSearchText !== null) {
      this.contextSearch.setValue(contextSearchText);
    }
    this.reportId = this.activatedRoute.snapshot.paramMap.get('id');
    this.getReportTests();
  }

  ngOnDestroy() {
    [
      this.excludeTestsSub,
      this.getReportTestsSub,
      this.acceptDialogSub,
      this.deleteTestSub,
      this.searchSub
    ].forEach((sub: any) => this.api.unsub(sub));
  }

  getReportTests() {
    this.loading = true;
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
        const chips = Object.keys(statuses)
          .sort((a: any, b: any) => a.localeCompare(b))
          .map(key => {
            return {name: key, count: statuses[key]}
          });
        chips.push({name: 'all', count: tests.length});
        this.loading = false;

        this.stats.next(chips);
        this.tests.next(tests);
        this.showTests.next(tests);

        const contextSearchText = localStorage.getItem('reportContextSearch')
        if (contextSearchText !== null) {
          this.filterByContext(contextSearchText);
        }
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
            ? 'rgba(150,117,0, 0.1)' : ''
    };
  }

  testContainedText(test: any, text: string): boolean {
    return !!Object.keys(test.config)
      .find(k => test.config[k].includes(text)
        || k.includes(text)
        || test.status.includes(text)
        || (test.start_pretty ? test.start_pretty.includes(text) : false)
        || (test.hasOwnProperty('end_pretty') && test.end_pretty.includes(text)));
  }

  filterByContext(text: string) {
    this.showTests.next(this.tests.getValue().filter((test: any) => this.testContainedText(test, text)));
  }

  searchContext(change: any) {
    if (this.searchSub !== null) {
      clearTimeout(this.searchSub);
    }
    this.searchSub = setTimeout(() => {
      if (this.activeChip.getValue() != 'all') {
        if (change.target.value === '') {
          localStorage.removeItem('reportContextSearch');
        } else {
          localStorage.setItem('reportContextSearch', change.target.value);
        }
        this.filterChips(this.activeChip.getValue());
        return;
      }
      if (change.target.value === '') {
        this.showTests.next(this.tests.getValue());
        localStorage.removeItem('reportContextSearch');
      }

      this.filterByContext(change.target.value);
      localStorage.setItem('reportContextSearch', change.target.value);
      this.searchSub = null;
    }, 300);
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
            this.api.snackMessage('Deletion in progress! It\'s take a while', 3);
            this.selectedTests.next([]);
            this.getReportTests();
          }
        });
      }
    });
  }

  selectAllShown() {
    const selectedTests = this.selectedTests.getValue();
    this.showTests.getValue().forEach((test: any) => {
      if (!selectedTests.includes(test.test_id)) {
        selectedTests.push(test.test_id);
      }
    })
    this.selectedTests.next(selectedTests);
  }
}
