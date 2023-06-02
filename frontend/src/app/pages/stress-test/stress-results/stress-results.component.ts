import {Component, Input, OnInit, signal, WritableSignal} from '@angular/core';
import {ApiService} from '../../../services/api.service';

@Component({
  selector: 'app-stress-results',
  templateUrl: './stress-results.component.html',
  styleUrls: ['./stress-results.component.scss']
})
export class StressResultsComponent implements OnInit {
  @Input() testId: string | undefined | null;

  results: WritableSignal<any[]> = signal([])
  getTestResults: any;
  loading = false;

  constructor(private api: ApiService) {
  }

  ngOnInit(): void {
    this.loading = true;
    this.getTestResults = this.api.post('get_test_results', {test_id: this.testId}).subscribe(res => {
      this.loading = false;
      if (res.status) {
        this.results.set(res.results.sort((a: any, b: any) => a.name.localeCompare(b.name)));
      }
    })
  }
}
