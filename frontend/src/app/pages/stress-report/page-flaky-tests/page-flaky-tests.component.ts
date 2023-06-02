import {Component, Input, OnChanges, OnInit, signal, SimpleChanges, WritableSignal} from '@angular/core';
import {ApiService} from '../../../services/api.service';

@Component({
  selector: 'app-page-flaky-tests',
  templateUrl: './page-flaky-tests.component.html',
  styleUrls: ['./page-flaky-tests.component.scss']
})
export class PageFlakyTestsComponent implements OnInit, OnChanges {
  @Input() statisticsData: any | null = null;

  show = false;
  tests: WritableSignal<any[]> = signal([]);
  private allowToOpen = true;

  constructor(private api: ApiService) {
  }

  ngOnInit(): void {
    const show = localStorage.getItem('pages-flaky-tests-show');
    if (show == null) {
      this.show = false;
    } else {
      this.show = show === 'true';
    }
    this.update();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['statisticsData'].firstChange) {
      this.update();
    }
  }

  toggleShow() {
    this.show = !this.show;
    localStorage.setItem('pages-flaky-tests-show', this.show.toString());
  }

  getTestStyle(status: string): any {
    switch (status) {
      case 'passed': {
        return {backgroundColor: 'rgba(38,134,0,0.3)'};
      }
      case 'failed': {
        return {backgroundColor: 'rgba(255,0,0,0.3)'};
      }
      case 'running': {
        return {backgroundColor: 'rgba(175,152,0,0.3)'};
      }
    }
  }

  openTest(test: any) {
    if (this.allowToOpen) {
      window.open(`${this.api.getBaseLink()}/stress_test/${test.test_id}`, '_blank')
    }
  }

  openPreviousVersion(test: any) {
    this.allowToOpen = false;
    setTimeout(() => this.allowToOpen = true, 300);
    window.open(`${this.api.getBaseLink()}/stress_test/${test.test_id}`, '_blank')
  }

  private update() {
    let orderedPages = Object.keys(this.statisticsData)
      .filter((page: string) => this.statisticsData[page].length > 0)
      .sort((a: any, b: any) => this.statisticsData[a][0].order - this.statisticsData[b][0].order);
    orderedPages = orderedPages.reverse().splice(0, 11)
    const lastPageTests: any[] = Object.assign([], this.statisticsData[orderedPages[0]]);
    lastPageTests.forEach((test: any) => {
      let changedStatuses = 0;
      let lastStatus: string | null = null;
      const previousTests: any[] = [];
      orderedPages
        .filter((page: string) => page !== orderedPages[orderedPages.length - 1])
        .forEach((page: any) => {
          let foundTest = this.statisticsData[page].find((t: any) => t.test_name === test.test_name);
          if (foundTest) {
            foundTest = Object.assign({}, foundTest);
            previousTests.push({
              test: foundTest,
              page: page
            })
            if (lastStatus !== null && lastStatus !== foundTest.status && foundTest.status !== 'running') {
              changedStatuses++;
            }
            lastStatus = foundTest.status === 'running' ? null : foundTest.status;
          }
        });
      test.changedStatuses = changedStatuses;
      test.previousTests = previousTests.reverse();
    });

    this.tests.set(
      lastPageTests
        .filter((test: any) => test.changedStatuses > 0)
        .sort((a: any, b: any) => a.changedStatuses - b.changedStatuses)
        .reverse()
        .splice(0, 10)
    );
  }
}
