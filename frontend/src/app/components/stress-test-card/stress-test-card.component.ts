import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Router} from '@angular/router';
import * as moment from 'moment';

@Component({
  selector: 'app-stress-test-card',
  templateUrl: './stress-test-card.component.html',
  styleUrls: ['./stress-test-card.component.scss']
})
export class StressTestCardComponent implements OnInit {

  @Input() test: any;
  @Input() selected: boolean = false;
  @Output() onToggle = new EventEmitter<boolean>();
  @Output() onClick = new EventEmitter();

  constructor(private router: Router) {
  }

  ngOnInit(): void {
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
    this.onClick.emit();
    this.router.navigate(['stress_test', testId])
  }

  formatData(time: number): string {
    return moment(time * 1000).format('HH:mm:ss DD.MM');
  }

  getTimeFormat(test: any): string {
    if (!test.hasOwnProperty('start_pretty')) {
      test['start_pretty'] = this.formatData(test.start_time);
    }
    if (test.hasOwnProperty('start_time') && !test.hasOwnProperty('end_pretty')) {
      test['end_pretty'] = this.formatData(test.end_time);
    }
    if (test.end_time !== null) {
      return `${test.start_pretty} - ${test.end_pretty}`
    }
    return test.start_pretty;
  }

  getKeys(config: any): Array<string> {
    return Object.keys(config).sort((a, b) => a.localeCompare(b) ? 0 : 1);
  }

  selectCard(event: Event) {
    event.preventDefault();
    this.onToggle.emit(!this.selected);
  }

  getCardColor(): any {
    return this.selected ? {backgroundColor: 'rgba(5, 0, 255, 0.2)'} : {};
  }
}
