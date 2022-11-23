import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {ApiService} from '../../../services/api.service';

@Component({
  selector: 'app-pages-unique-known-issues',
  templateUrl: './pages-unique-known-issues.component.html',
  styleUrls: ['./pages-unique-known-issues.component.scss']
})
export class PagesUniqueKnownIssuesComponent implements OnInit, OnChanges {
  @Input() statisticsData: any | null = null;

  show = true;
  issues = new BehaviorSubject<any[]>([]);
  pages = new BehaviorSubject<string[]>([]);
  selectedPage: string = '';

  private allowToOpen = true;

  constructor(private api: ApiService) {
  }

  ngOnInit(): void {
    const show = localStorage.getItem('pages-unique-known-issues-show');
    if (show == null) {
      this.show = true;
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

  toggleShow() {
    this.show = !this.show;
    localStorage.setItem('pages-unique-known-issues-show', this.show.toString());
  }

  openTest(test: any) {
    this.allowToOpen = false;
    setTimeout(() => this.allowToOpen = true, 300);
    window.open(`${this.api.getBaseLink()}/stress_test/${test.test_id}`, '_blank')
  }

  openKnownIssue(issue: any) {
    if (this.allowToOpen) {
      window.open(issue.url, '_blank')
    }
  }

  togglePageSelect(page: string) {
    this.selectedPage = page;
    this.update();
  }

  getPageStyle(page: string) {
    return this.selectedPage === page ? {
      backgroundColor: 'rgba(63,0,159,0.3)',
    } : {};
  }

  private update(): void {
    if (this.statisticsData === null) {
      return;
    }
    if (this.pages.getValue().length === 0) {
      let allPages = Object.keys(this.statisticsData)
        .filter((page: string) => this.statisticsData[page].length > 0)
        .sort((a: any, b: any) => this.statisticsData[a][0].order - this.statisticsData[b][0].order);
      allPages = allPages.splice(allPages.length - 10, allPages.length - 1);
      this.pages.next(allPages);
      this.selectedPage = allPages[allPages.length - 1];
    }

    const pageTests: any[] = this.statisticsData[this.selectedPage];
    const issues: any[] = [];
    pageTests.forEach((test: any) => {
      if (test.known_issues !== null) {
        test.known_issues.split(',').forEach((issue: string) => {
          const foundIssue = issues.find((i: any) => i.url === issue);
          if (foundIssue == undefined) {
            issues.push({url: issue, tests: [test]});
          } else {
            foundIssue.tests.push(test)
            foundIssue.tests = foundIssue.tests.sort((a: any, b: any) => a.order - b.order);
          }
        });
      }
    });
    this.issues.next(issues.sort((a: any, b: any) => b.tests.length - a.tests.length));
    this.findUrlNames();
  }

  private findUrlNames() {
    this.issues.getValue().forEach((issue: any) => {
      if (issue.url.startsWith('https://github.com')) {
        const p = issue.url.match('https://github.com/([a-z-0-9]+)/([a-z-0-9]+)/issues/([0-9]+)');
        if (p) {
          fetch(`https://api.github.com/repos/${p[1]}/${p[2]}/issues/${p[3]}`, {
            headers: {Accept: 'application/vnd.github+json'}
          }).then((resp) => resp.json())
            .then((respData) => {
              this.issues.next(this.issues.getValue()
                .map((iissue: any) => {
                  if (iissue.url === issue.url) {
                    iissue.title = respData.title;
                  }
                  return iissue;
                }));
            });
        }
      }
    })
  }
}
