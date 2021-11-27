import {Component, Input, OnInit} from '@angular/core';
import {ApiService} from '../../../services/api.service';
import {BehaviorSubject, Subject} from 'rxjs';


@Component({
  selector: 'app-stress-metrics',
  templateUrl: './stress-metrics.component.html',
  styleUrls: ['./stress-metrics.component.scss']
})
export class StressMetricsComponent implements OnInit {

  @Input() testId: string | undefined | null;
  graphs = new BehaviorSubject<Array<string>>([]);
  openedGraphs = new BehaviorSubject<Array<string>>([]);
  getMetricsSub: any;

  constructor(private api: ApiService) {
  }

  ngOnInit(): void {
    this.openedGraphs.next([]);
    this.getMetricsSub = this.api
      .post('get_metrics', {test_id: this.testId})
      .subscribe((res: any) => this.graphs.next(res.metrics));
  }

  graphIsOpen(graphName: string) {
    return this.openedGraphs.getValue().includes(graphName);
  }

  toggleShow(graphName: string) {
    if (this.graphIsOpen(graphName)) {
      this.openedGraphs.next(this.openedGraphs.getValue().filter(g => g !== graphName));
    } else {
      const openedGraphs = this.openedGraphs.getValue();
      openedGraphs.push(graphName);
      this.openedGraphs.next(openedGraphs);
    }
  }
}
