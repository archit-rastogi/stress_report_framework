import {Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {Router} from '@angular/router';
import * as moment from 'moment';
import {ApiService} from '../../services/api.service';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-stress-test-card',
  templateUrl: './stress-test-card.component.html',
  styleUrls: ['./stress-test-card.component.scss']
})
export class StressTestCardComponent implements OnDestroy {

  @Input() test: any;
  @Input() selected: boolean = false;
  @Output() onToggle = new EventEmitter<boolean>();
  @Output() onClick = new EventEmitter();
  exceptions = new BehaviorSubject<any[]>([]);
  private allowToOpen = true;
  private getResultsSub: any;

  constructor(private router: Router,
              private api: ApiService) {
  }

  ngOnDestroy() {
    this.api.unsub(this.getResultsSub);
  }

  blockOpen() {
    this.allowToOpen = false;
    setTimeout(() => this.allowToOpen = true, 300);
  }

  getStatusStyle(status: string): any {
    switch (status) {
      case 'passed': {
        return {color: 'rgba(38,134,0,0.5)'};
      }
      case 'failed': {
        return {color: 'rgba(255,0,0,0.65)'};
      }
      case 'running': {
        return {color: 'rgba(175,152,0,0.5)'};
      }
    }
  }

  openTest(testId: string) {
    if (!this.allowToOpen) {
      return
    }
    this.onClick.emit();
    this.router.navigate(['stress_test', testId])
  }

  formatData(time: number): string {
    return moment(time * 1000).format('HH:mm:ss DD.MM');
  }

  getTimeFormat(): string {
    if (!this.test.hasOwnProperty('start_pretty')) {
      this.test['start_pretty'] = this.formatData(this.test.start_time);
    }
    if (this.test.hasOwnProperty('start_time') && !this.test.hasOwnProperty('end_pretty')) {
      this.test['end_pretty'] = this.formatData(this.test.end_time);
    }
    if (this.test.end_time !== null) {
      return `${this.test.start_pretty} - ${this.test.end_pretty}`
    }
    return this.test.start_pretty;
  }

  getTimeDiff() {
    let endTime = this.test.end_time;
    if (endTime === null) {
      endTime = +new Date() / 1000;
    }
    const diff = endTime - this.test.start_time;
    let result = ''
    if (diff > 60) {
      if (diff / 60 > 60) {
        result = `${Math.round(diff / 60 / 60)}h `
      }
      result = `${result} ${Math.round(diff / 60) % 60}m `
    }
    return `${result} ${Math.round(diff) % 60}s `
  }

  getKeys(config: any): Array<string> {
    return Object.keys(config)
      .sort((a, b) => a.localeCompare(b) ? 0 : 1)
      .filter(k => k !== 'known_issues');
  }

  selectCard(event: Event) {
    event.preventDefault();
    this.onToggle.emit(!this.selected);
  }

  getCardColor(): any {
    return this.selected ? {backgroundColor: 'rgba(5, 0, 255, 0.2)'} : {};
  }

  openException() {
    this.blockOpen();
    if (this.exceptions.getValue().length > 0) {
      this.exceptions.next([]);
      return;
    }
    this.getResultsSub = this.api.post('get_test_results', {
      test_id: this.test.test_id
    }).subscribe(res => {
      if (res.status) {
        this.exceptions.next(res.results.filter((result: any) => result.type == 'exception'));
      }
    })
  }

  openLink(ki: string) {
    this.blockOpen();
    window.open(ki, '_blank');
  }

  getVersionStyle(status: string, testId: string): any {
    if (testId === this.test.test_id) {
      return {backgroundColor: 'rgba(90,0,178,0.4)'}
    }
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
      case 'none': {
        return {backgroundColor: 'rgba(255,255,255,0.5)'};
      }
    }
  }

  openPreviousTest(id: string): void {
    this.allowToOpen = false;
    setTimeout(() => this.allowToOpen = true, 300);
    if (id === null) {
      this.api.snackMessage('This test did not exist on this page!', 4);
    } else {
      window.open(`${this.api.getBaseLink()}/stress_test/${id}`, '_blank')
    }
  }

  openTestInNewWindow() {
    this.allowToOpen = false;
    setTimeout(() => this.allowToOpen = true, 300);
    window.open(`${this.api.getBaseLink()}/stress_test/${this.test.test_id}`, '_blank')
  }
}
