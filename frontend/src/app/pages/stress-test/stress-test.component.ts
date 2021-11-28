import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiService} from '../../services/api.service';
import {BehaviorSubject} from 'rxjs';
import * as moment from 'moment';

@Component({
  selector: 'app-stress-test',
  templateUrl: './stress-test.component.html',
  styleUrls: ['./stress-test.component.scss']
})
export class StressTestComponent implements OnInit {

  testId: string | undefined | null = '';
  testInfo = new BehaviorSubject<any>(null);
  showInfo = false;
  private getTestInfoSub: any;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private api: ApiService) {
  }

  ngOnInit(): void {
    this.testId = this.activatedRoute.snapshot.paramMap.get('id');
    this.getTestInfoSub = this.api.post('get_test_info', {test_id: this.testId}).subscribe(res => {
      if (res.status) {
        this.testInfo.next(res.test_info);
      }
    })
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
}
