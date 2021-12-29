import {Component, Input, OnInit} from '@angular/core';
import {ApiService} from '../../../services/api.service';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-stress-results',
  templateUrl: './stress-results.component.html',
  styleUrls: ['./stress-results.component.scss']
})
export class StressResultsComponent implements OnInit {
  @Input() testId: string | undefined | null;

  results = new BehaviorSubject<any[]>([]);
  getTestResults: any;

  constructor(private api: ApiService) {
  }

  ngOnInit(): void {
    this.getTestResults = this.api.post('get_test_results', {test_id: this.testId}).subscribe(res => {
      if (res.status) {
        this.results.next(res.results.sort((a: any, b: any) => a.name.localeCompare(b.name)));
      }
    })
  }
}
