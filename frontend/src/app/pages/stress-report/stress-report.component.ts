import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiService} from '../../services/api.service';
import {BehaviorSubject} from 'rxjs';
import {FormControl} from '@angular/forms';
import {ActionsService} from '../../services/actions.service';
import * as moment from 'moment';

export class PageData {
  order: number;
  statuses: any;

  constructor(order: number, statuses: any) {
    this.order = order;
    this.statuses = statuses;
  }
}

export class Page {
  name: string;
  data: PageData;

  constructor(name: string, data: PageData) {
    this.name = name;
    this.data = data;
  }
}

@Component({
  selector: 'app-stress-report',
  templateUrl: './stress-report.component.html',
  styleUrls: ['./stress-report.component.scss']
})
export class StressReportComponent implements OnInit, OnDestroy {
  open = false;
  reportName: string | null = null;
  showStatistics = true;

  tests = new BehaviorSubject<any[]>([])
  showTests = new BehaviorSubject<any[]>([])
  stats = new BehaviorSubject<any[]>([])
  pages = new BehaviorSubject<Page[]>([]);
  statistics = new BehaviorSubject<any>(null);
  statisticsUpdateTime = new BehaviorSubject<any>(null)

  activePage: string | null = null;
  contextSearch = new FormControl('');
  loading = false;
  statisticsLoading = false;
  activeChip = new BehaviorSubject<string>('all');
  orderByCategory: string = 'date';
  orderByCategoryOrder: string = 'down';

  private getReportPagesSub: any;
  private excludeTestsSub: any;
  private getReportTestsSub: any;
  private deleteTestSub: any;
  private getReportStatisticsSub: any;
  private searchSub: any = null;

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private api: ApiService,
              public actionsService: ActionsService) {
    actionsService.refresh.subscribe(refresh => {
      if (refresh && this.open) {
        this.getReportTests();
      }
    })
  }

  ngOnInit(): void {
    this.statisticsLoading = false;
    const reportShowStatistics = localStorage.getItem('report_show_statistics');
    if (reportShowStatistics !== null) {
      this.showStatistics = reportShowStatistics === 'true';
    }

    const reportSortCategory = localStorage.getItem('report_sort_category');
    if (reportSortCategory !== null) {
      this.orderByCategory = reportSortCategory;
    }

    const reportSortOrder = localStorage.getItem('report_sort_order');
    if (reportSortOrder !== null) {
      this.orderByCategoryOrder = reportSortOrder;
    }
    const activeChip = localStorage.getItem('report_chip_selected');
    if (activeChip !== null) {
      this.activeChip.next(activeChip);
    }
    this.open = true;
    this.activePage = null;
    const contextSearchText = localStorage.getItem('reportContextSearch')
    if (contextSearchText !== null) {
      this.contextSearch.setValue(contextSearchText);
    }
    this.reportName = this.activatedRoute.snapshot.paramMap.get('id');
    const params: any = this.activatedRoute.snapshot.url[this.activatedRoute.snapshot.url.length - 1].parameters;
    if (params.page !== null && params.page !== undefined) {
      this.setActivePage(params.page);
    }
    this.getReportPages();
  }

  ngOnDestroy() {
    this.actionsService.selectedTests.next([]);
    this.open = false;
    [
      this.excludeTestsSub,
      this.getReportTestsSub,
      this.deleteTestSub,
    ].forEach((sub: any) => this.api.unsub(sub));
    if (this.searchSub) {
      clearTimeout(this.searchSub);
    }
  }

  toggleFilterChips(chipName: string) {
    this.changeFilterChips(chipName);
    const chipFilter = this.getChipFilter(chipName);
    this.activeChip.next(chipName);
    this.showTests.next(this.sortTests(
      this.tests.getValue()
        .filter((test: any) => chipFilter(test) && this.getContextTestFilter(
          test, this.contextSearch.value === null ? '' : this.contextSearch.value
        ))
    ));
  }

  setActivePage(page: string) {
    this.activePage = page;
    this.router.navigate(['stress_report', this.reportName, {page}]);
  }

  getReportPages() {
    this.loading = true;
    this.getReportPagesSub = this.api.post('get_report_pages', {name: this.reportName}).subscribe(res => {
      if (res.status) {
        if (res.hasOwnProperty('pages') && Object.keys(res.pages).length > 0) {
          const listPages = Object.keys(res.pages).map(pageName => {
            return {
              name: pageName,
              data: res.pages[pageName]
            } as Page
          }).sort((a: any, b: any) => a.data.order - b.data.order);
          this.pages.next(listPages)
          if (this.activePage === null) {
            this.setActivePage(listPages[listPages.length - 1].name)
          }
        }
        this.getStatistics();
        this.getReportTests();
      }
    })
  }

  getStatistics() {
    this.statisticsLoading = true;
    this.getReportStatisticsSub = this.api.post('get_report_statistics', {
      name: this.reportName
    }).subscribe(res => {
      if (res.status && res.data) {
        this.statistics.next(res.data.detailed_statistics);
        const updateDate = moment(res.data.update_ts * 1000);
        this.statisticsUpdateTime.next({
          date: updateDate.toDate(),
          formatted: updateDate.format('HH:mm:ss DD.MM.YYYY')
        });
        this.updateTestsWithStatistics();
        this.statisticsLoading = false;
      }
    });
  }

  updateTestsWithStatistics() {
    const newTests: any[] = [];
    const stat = this.statistics.getValue();
    if (stat !== null) {
      this.tests.getValue().forEach((test: any) => {
        const previousTests: any[] = [];
        Object.keys(stat)
          .filter((page: string) => stat[page].length > 0)
          .sort((a: string, b: string) => stat[a][0].order - stat[b][0].order)
          .forEach((pageName: any) => {
            const foundPageTest = stat[pageName].find((pageTest: any) => pageTest.test_name === test.config.test_name);
            previousTests.push({
              name: test.config.test_name,
              page: pageName,
              status: foundPageTest ? foundPageTest.status : 'none',
              id: foundPageTest ? foundPageTest.test_id : null,
            })
          });
        test.previousTests = previousTests.splice(
          previousTests.length - 10 < 0 ? 0 : previousTests.length - 10,
          previousTests.length
        );
        newTests.push(test)
      });
      this.tests.next(newTests);
      const updateTests = this.showTests.getValue()
        .map((test: any) => newTests
          .find((nt: any) => nt.test_id === test.test_id))
      this.showTests.next(updateTests);
    }
  }

  getReportTests() {
    this.loading = true;
    this.getReportTestsSub = this.api.post('get_report_tests', {
      name: this.reportName,
      page: this.activePage
    }).subscribe(res => {
      if (res.status) {
        let tests = res.tests.sort((a: any, b: any) => a.start_time - b.start_time);
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
        const failedWithKnownIssues = tests.filter((test: any) => {
          return test.status === 'failed'
            && test.config.hasOwnProperty('known_issues')
            && test.config.known_issues.length > 0
        }).length;
        if (failedWithKnownIssues > 0) {
          chips.push({name: 'failed with known issues', count: failedWithKnownIssues});
        }
        const failedWithoutKnownIssues = tests
          .filter((test: any) => test.status === 'failed'
            && !test.config.hasOwnProperty('known_issues')).length
        if (failedWithoutKnownIssues > 0) {
          chips.push({name: 'failed without known issues', count: failedWithoutKnownIssues});
        }
        this.loading = false;
        this.stats.next(chips.sort((a: any, b: any) => a.name.localeCompare(b.name)));
        this.tests.next(tests);
        const chipFilteredTests: any[] = tests
          .filter((test: any) => this.getChipFilter(this.activeChip.getValue())(test))
        if (chipFilteredTests.length === 0) {
          this.toggleFilterChips('all');
          return;
        }
        const newTests = this.sortTests(chipFilteredTests.filter(test => this.getContextTestFilter(
          test, this.contextSearch.value === null ? '' : this.contextSearch.value
        )))
        this.showTests.next(newTests);
        this.updateTestsWithStatistics();
      }
    })
  }

  isSelected(test: any): boolean {
    return this.actionsService.selectedTests.getValue().includes(test.test_id);
  }

  testSelected(test: any) {
    const selected = this.actionsService.selectedTests.getValue();
    if (this.isSelected(test)) {
      this.actionsService.selectedTests.next(selected.filter(t => t !== test.test_id));
    } else {
      selected.push(test.test_id);
      this.actionsService.selectedTests.next(selected);
    }
  }

  excludeTests() {
    this.excludeTestsSub = this.api.post('add_exclude_tests', {
      tests: this.actionsService.selectedTests.getValue(),
      name: this.reportName
    }).subscribe(res => {
      if (res.status) {
        this.api.snackMessage(`${this.actionsService.selectedTests.getValue().length} tests excluded from report!`, 2);
        this.actionsService.selectedTests.next([]);
        this.getReportTests();
      }
    })
  }

  getChipStyle(stat: any) {
    if (stat.name === this.activeChip.getValue()) {
      return {}
    } else {
      return {
        backgroundColor: stat.name === 'passed'
          ? 'rgba(6,218,0,0.3)' : stat.name === 'failed'
            ? 'rgba(255,0,0,0.4)' : stat.name === 'failed without known issues'
              ? 'rgba(255,0,0,0.3)' : stat.name === 'failed with known issues'
                ? 'rgba(255,0,0,0.2)' : stat.name === 'running'
                  ? 'rgba(150,117,0,0.3)' : ''
      };
    }
  }

  getChipClass(stat: any): string {
    return stat.name === this.activeChip.getValue() ? 'selected-chip' : '';
  }

  filterByContext(text: string) {
    this.showTests.next(this.sortTests(this.tests.getValue().filter((test: any) => this.getContextTestFilter(test, text))));
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
        this.toggleFilterChips(this.activeChip.getValue());
        return;
      }
      if (change.target.value === '') {
        this.showTests.next(this.sortTests(this.tests.getValue()));
        localStorage.removeItem('reportContextSearch');
      }

      this.filterByContext(change.target.value);
      localStorage.setItem('reportContextSearch', change.target.value);
      this.searchSub = 0;
    }, 300);
  }

  selectAllShown() {
    const selectedTests = this.actionsService.selectedTests.getValue();
    this.showTests.getValue().forEach((test: any) => {
      if (!selectedTests.includes(test.test_id)) {
        selectedTests.push(test.test_id);
      }
    })
    this.actionsService.selectedTests.next(selectedTests);
  }

  onSelectPage(page: Page) {
    this.setActivePage(page.name);
    this.getReportTests();
  }

  changeSort(name: string) {
    if (this.orderByCategory === name) {
      this.orderByCategoryOrder = this.orderByCategoryOrder === 'up' ? 'down' : 'up';
    } else {
      this.orderByCategory = name;
      this.orderByCategoryOrder = 'up';
    }
    this.showTests.next(this.sortTests(this.showTests.getValue()));
    localStorage.setItem('report_sort_category', this.orderByCategory)
    localStorage.setItem('report_sort_order', this.orderByCategoryOrder)
  }

  getStatisticsUpdateWarning(): string {
    const statDateUpdate = this.statisticsUpdateTime.getValue();
    if (statDateUpdate !== null) {
      return (statDateUpdate.date.getTime() - new Date().getTime()) / 1000 > 60 * 5 ? 'update in progress. Please update page in minute or so fpr new results' : '';
    }
    return '';
  }

  toggleShowStatistics() {
    this.showStatistics = !this.showStatistics;
    localStorage.setItem('report_show_statistics', this.showStatistics ? 'true' : 'false');
  }

  private changeFilterChips(chipName: string) {
    localStorage.setItem('report_chip_selected', chipName);
    this.activeChip.next(chipName);
  }

  private getChipFilter(chipName: string): any {
    switch (chipName) {
      case 'running': {
        return (test: any) => test.status == 'running';
      }
      case 'failed': {
        return (test: any) => test.status == 'failed';
      }
      case 'failed with known issues': {
        return (test: any) => test.status == 'failed' && test.config.hasOwnProperty('known_issues') && test.config.known_issues.length > 0;
      }
      case 'failed without known issues': {
        return (test: any) => test.status == 'failed' && !test.config.hasOwnProperty('known_issues');
      }
      case 'passed': {
        return (test: any) => test.status == 'passed';
      }
      case 'all': {
        return (_: any) => true;
      }
    }
  }

  private getContextTestFilter(test: any, text: string): boolean {
    return !!Object.keys(test.config)
      .find(k => test.config[k].toString().includes(text)
        || k.includes(text)
        || test.status.includes(text)
        || (test.start_pretty ? test.start_pretty.includes(text) : false)
        || (test.hasOwnProperty('end_pretty') && test.end_pretty.includes(text)));
  }

  private sortTests(tests: Array<any>): Array<any> {
    return tests.sort((a: any, b: any) => {
      let res;
      if (this.orderByCategory === 'name') {
        res = a.config.test_name.localeCompare(b.config.test_name);
        if (this.orderByCategoryOrder === 'up') {
          return res * -1;
        }
        return res;
      } else if (this.orderByCategory === 'start_date') {
        res = a.start_time - b.start_time;
        if (this.orderByCategoryOrder === 'up') {
          return res * -1;
        }
        return res;
      } else {
        let aEnd = a.start_time
        let bEnd = b.start_time
        if (a.hasOwnProperty('end_time')) {
          aEnd = a.end_time;
        }
        if (b.hasOwnProperty('end_time')) {
          bEnd = b.end_time;
        }
        res = aEnd - bEnd;
        if (this.orderByCategoryOrder === 'up') {
          return res * -1;
        }
        return res;
      }
    });
  }
}
