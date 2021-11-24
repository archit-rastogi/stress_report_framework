import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import * as moment from 'moment';
import {EChartsOption} from 'echarts';

@Component({
  selector: 'app-stress-metric-graph',
  templateUrl: './stress-metric-graph.component.html',
  styleUrls: ['./stress-metric-graph.component.scss']
})
export class StressMetricGraphComponent implements OnInit, OnChanges {

  echartsOptions = new BehaviorSubject<EChartsOption>({});
  open: boolean = false;
  @Input() graphData: any;
  @Input() openInput: boolean | undefined;
  selectedGraph: string = 'avg';

  constructor() {
  }

  ngOnInit(): void {
    this.open = false;
    this.selectedGraph = 'avg';
    this.setOption(this.selectedGraph);
  }

  ngOnChanges(changes: any): void {
    if (changes.hasOwnProperty('openInput')) {
      this.open = changes.openInput.currentValue;
    }
  }

  avg = (items: Array<any>) => {
    return items.reduce((prev, next) => prev + next) / items.length
  }

  format = (timestamp: number) => moment(timestamp).format('DD.MM HH:mm:ss');

  setOption = (type: string) => {
    const series: Array<any> = []
    const legends: Array<string> = []
    const subGraphs: any = {}
    Object.keys(this.graphData.data).forEach(subGraphKey => {
      const subGraphData = this.graphData.data[subGraphKey];
      Object.keys(subGraphData.data).forEach(subGraphName => {
        const separatedData = subGraphData.data[subGraphName];
        if (subGraphs.hasOwnProperty(subGraphName)) {
          subGraphs[subGraphName] = subGraphs[subGraphName].concat([{time: subGraphData.time, data: separatedData}])
        } else {
          subGraphs[subGraphName] = [{time: subGraphData.time, data: separatedData}]
        }
      })
    })
    if (type === 'avg') {
      const roundV = 10 ** this.graphData.round;
      Object.keys(subGraphs).forEach(subGraphName => {
        const subGraphData = subGraphs[subGraphName];
        const seriesName = `${subGraphName} avg`
        series.push({
          type: 'line',
          name: seriesName,
          data: subGraphData
            .filter((pointData: any) => Object.keys(pointData.data).length > 0)
            .map((pointData: any) =>
              [pointData.time * 1000, Math.round(this.avg(Object.values(pointData.data)) * roundV) / roundV]
            )
        })
        legends.push(seriesName)
      });
    } else if (type === 'separated') {
      Object.keys(subGraphs).forEach(subGraphName => {
        const subGraphData = subGraphs[subGraphName];
        const hostsData: any = {}
        subGraphData.forEach((point: any) => {
          Object.keys(point.data).forEach(host => {
            const d = [Math.round(point.time) * 1000, point.data[host]]
            if (hostsData.hasOwnProperty(host)) {
              hostsData[host] = hostsData[host].concat([d])
            } else {
              hostsData[host] = [[d]]
            }
          })
        });
        Object.keys(hostsData).forEach(host => {
          const seriesName = `${subGraphName} ${host}`;
          series.push({
            type: 'line',
            name: seriesName,
            data: hostsData[host]
          });
          legends.push(seriesName);
        })
      });
    }
    this.echartsOptions.next({
      animationDuration: 100,
      legend: {
        data: legends,
        bottom: 0
      },
      tooltip: {
        order: 'valueDesc',
        trigger: 'axis'
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
      yAxis: [{
        name: this.graphData.symbol,
        type: 'value'
      }],
      series
    });
  }

}
