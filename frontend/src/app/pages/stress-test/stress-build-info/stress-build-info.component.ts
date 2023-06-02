import {Component, Input, OnDestroy, OnInit, signal, WritableSignal} from '@angular/core';
import * as moment from 'moment';
import {ApiService} from '../../../services/api.service';

@Component({
  selector: 'app-stress-build-info',
  templateUrl: './stress-build-info.component.html',
  styleUrls: ['./stress-build-info.component.scss']
})
export class StressBuildInfoComponent implements OnInit, OnDestroy {

  @Input() testId: string | undefined | null;
  testInfo: WritableSignal<any> = signal(null)
  showInfo = false;
  knownIssues: WritableSignal<any[]> = signal([])
  private getTestInfoSub: any;

  constructor(private api: ApiService) {
  }

  ngOnInit(): void {
    const savedState = localStorage.getItem("openedBuildInfo");
    if (savedState !== null) {
      this.showInfo = savedState === "true"
    }
    this.getTestInfo();
  }

  getTestInfo() {
    this.getTestInfoSub = this.api.post('get_test_info', {test_id: this.testId}).subscribe(res => {
      if (res.status) {
        this.testInfo.set(res.test_info);
        this.findKnownIssues(res.test_info);
      }
    });
  }

  ngOnDestroy() {
  }

  findKnownIssues(buildInfo: any) {
    Object.keys(buildInfo.config).forEach(key => {
      if (typeof buildInfo.config[key] !== 'string') {
        return;
      }
      buildInfo.config[key].split(',').forEach((knownIssue: string) => {
        if (knownIssue.startsWith('https://github.com')) {
          const p = knownIssue.match('https://github.com/([a-z-0-9]+)/([a-z-0-9]+)/issues/([0-9]+)');
          if (p) {
            fetch(`https://api.github.com/repos/${p[1]}/${p[2]}/issues/${p[3]}`, {
              headers: {Accept: 'application/vnd.github+json'}
            }).then((resp) => resp.json())
              .then((respData) => {
                const existedKnownIssues = this.knownIssues()
                existedKnownIssues.push({
                  title: respData.title,
                  url: knownIssue
                });
                this.knownIssues.set(existedKnownIssues);
              });
          }
        }
      });
    });
  }

  getKeys(properties: any): any[] {
    if (properties === undefined) {
      return [];
    }
    return Object.keys(properties);
  }

  format(timestamp: number) {
    return moment(timestamp * 1000).format('DD.MM HH:mm:ss');
  }

  getStatusStyle(status: string) {
    let color = ''
    switch (status) {
      case 'passed': {
        color = 'rgba(38,134,0,0.2)';
        break;
      }
      case 'failed': {
        color = 'rgba(255,0,0,0.2)';
        break;
      }
      case 'running': {
        color = 'rgba(255,222,0,0.18)';
        break;
      }
    }
    return {backgroundColor: color};
  }

  toggleInfo() {
    this.showInfo = !this.showInfo;
    localStorage.setItem("openedBuildInfo", this.showInfo ? "true" : "false");
  }

  getValue(propKey: any): string {
    return `${this.testInfo().config[propKey]}`;
  }

  openLink(link: string) {
    window.open(link, '_blank');
  }
}
