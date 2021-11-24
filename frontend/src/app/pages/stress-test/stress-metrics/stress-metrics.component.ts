import {Component, Input, OnInit} from '@angular/core';
import {ApiService} from '../../../services/api.service';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-stress-metrics',
  templateUrl: './stress-metrics.component.html',
  styleUrls: ['./stress-metrics.component.scss']
})
export class StressMetricsComponent implements OnInit {

  @Input() testId: string | undefined | null;
  graphs = new Subject<Array<any>>();
  toggleStatus = false;
  getMetricsSub: any;

  constructor(private api: ApiService) {
  }

  ngOnInit(): void {
    this.toggleStatus = false;
    this.getMetricsSub = this.api.post('get_metrics', {test_id: this.testId}).subscribe((res: any) => {
      if (res.status) {
        const graphs: Array<any> = [];
        res.metrics.forEach((sample: any) => {
          const newMetrics = Object.keys(sample.data).filter(metricName => !graphs.includes(metricName));
          if (newMetrics.length > 0) {
            graphs.push(...newMetrics)
          }
        })

        const graphsData: any = {};
        res.metrics.forEach((sample: any) => {
          graphs.forEach(graphName => {
            if (sample.data.hasOwnProperty(graphName)) {
              const sampleData = sample.data[graphName];
              const sampleToAdd = {
                data: sampleData.data,
                time: sample.time
              }

              if (!graphsData.hasOwnProperty(graphName)) {
                graphsData[graphName] = {data: [sampleToAdd], name: sampleData.name, symbol: sampleData.symbol, round: sampleData.round_val}
              } else {
                graphsData[graphName].data.push(sampleToAdd)
                graphsData[graphName].data = graphsData[graphName].data.sort((a: any, b: any) => a.time - b.time);
              }
            }
          })
        });
        this.graphs.next(Object.values(graphsData));
      }
    })
  }

  toggleAll() {

  }
}
