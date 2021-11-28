import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {BehaviorSubject, Subscriber, Subscription} from 'rxjs';
import * as moment from 'moment';
import {EChartsOption} from 'echarts';
import {ApiService} from '../../../../services/api.service';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-stress-metric-graph',
  templateUrl: './stress-metric-graph.component.html',
  styleUrls: ['./stress-metric-graph.component.scss']
})
export class StressMetricGraphComponent implements OnInit, OnDestroy {
  echartsOptions = new BehaviorSubject<EChartsOption>({} as EChartsOption);
  @Input() graphName: any;
  @Input() testId: any;

  toggle = new FormControl('avg');
  getMetricSub = new Subscription();

  constructor(private api: ApiService) {
  }

  ngOnInit(): void {
    this.drawGraph();
  }

  changeValue() {
    this.drawGraph();
  }

  ngOnDestroy() {
    this.api.unsub(this.getMetricSub);
  }

  drawGraph() {
    this.getMetricSub = this.api.post('get_metric', {
      test_id: this.testId,
      metric_name: this.graphName,
      graph_type: this.toggle.value,
    }).subscribe(res => {
      if (res.status) {

        const toRound = 10 ** res.round_value;
        const series: any[] = Object.keys(res.series).map(lineName => {
          return {
            name: lineName,
            type: 'line',
            data: res.series[lineName].map((data: number[]) => {
              return [data[0] * 1000, (Math.round(data[1] * toRound)) / toRound]
            })
          }
        });
        const manyLines = Object.keys(res.series).length > 10;
        const formatCursor = (params: any) => {
          const lines = params
            .filter((p: any) => p.value[1] > 0)
            .sort((a: any, b: any) => b.value[1] - a.value[1])
            .map((s: any) => `<tr><td>${s.marker} ${s.seriesName}</td><td>${s.value[1]}</td></tr>`);
          return `${params[0].axisValueLabel}<br/><table style="width: 100%">${lines.join('')}</table>`
        }
        this.echartsOptions.next({
          animationDuration: 100,
          legend: {
            data: Object.keys(res.series),
            bottom: 0,
          },
          tooltip: {
            order: 'valueDesc',
            trigger: 'axis',
            formatter: formatCursor,
          },
          toolbox: {
            feature: {
              dataZoom: {
                yAxisIndex: 'none'
              },
              restore: {},
              saveAsImage: {},
            },
            z: 0
          },
          emphasis: {
            focus: 'series'
          },
          xAxis: [{
            type: 'time',
            axisLabel: {
              formatter: this.format
            }
          }],

          grid: {
            bottom: manyLines ? 150 : 50
          },
          yAxis: [{
            name: res.symbol,
            type: 'value'
          }],
          series: series
        });
      }
    });
  }

  format = (timestamp: number) => moment(timestamp).format('DD.MM HH:mm:ss');
}
