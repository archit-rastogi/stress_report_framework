import {Component, Input, OnInit} from '@angular/core';
import {ApiService} from '../../../services/api.service';
import * as moment from 'moment';
import * as echarts from 'echarts';
import {BehaviorSubject, Subject} from 'rxjs';

@Component({
  selector: 'app-stress-steps',
  templateUrl: './stress-steps.component.html',
  styleUrls: ['./stress-steps.component.scss']
})
export class StressStepsComponent implements OnInit {

  chartOptions = new BehaviorSubject<echarts.EChartsOption>({});
  @Input() testId: string | undefined | null;
  steps = new BehaviorSubject<any[]>([]);
  getStepsSub: any;
  loading = false;
  categories = 1;

  openedSteps = new BehaviorSubject<any[]>([]);

  constructor(private api: ApiService) {
  }

  ngOnInit(): void {
    this.loading = true;
    this.getStepsSub = this.api.post('get_steps', {test_id: this.testId}).subscribe(res => {
      this.loading = false;
      if (res.status) {
        this.steps.next(res.steps);
        this.drawGraph(res.steps);
      }
    })
  }

  format = (timestamp: number) => moment(timestamp * 1000).format('DD.MM HH:mm:ss');

  drawGraph(newSteps: Array<any>) {

    const data: any[] = [];
    let categories: string[] = []
    new Set(newSteps.map(step => step.properties.name)).forEach(i => {
      categories.push(i);
    })
    const findTime = (name: string) => newSteps.find(s => s.properties.name === name).start_time
    categories = categories.sort((a: string, b: string) => findTime(b) - findTime(a));
    this.categories = categories.length;

    let lowestTime = +new Date() + 10000;
    let highest = 0;

    newSteps.forEach((step: any) => {
      if (step.start_time < lowestTime) {
        lowestTime = step.start_time;
      }
      if (step.end_time > highest) {
        highest = step.end_time;
      }
    });
    if (highest == 0) {
      highest = lowestTime + 60 * 3;
    }
    newSteps.forEach((step: any) => {
      if (step.end_time === null) {
        step.end_time = +new Date()
      }
      data.push({
        name: step.properties.name,
        value: [categories.indexOf(step.properties.name), step.start_time, step.end_time, step.end_time - step.start_time],
        step,
        itemStyle: {
          normal: {
            color: this.getColorByStatus(step.status)
          }
        }
      });
    });
    const render: echarts.CustomSeriesRenderItem = (params: any, api: any) => {
      const categoryIndex = api.value(0);
      const start = api.coord([api.value(1), categoryIndex]);
      const end = api.coord([api.value(2), categoryIndex]);
      const height = api.size([0, 1])[1] * 0.6;
      const rectShape = echarts.graphic.clipRectByRect(
        {
          x: start[0],
          y: start[1] - height / 2,
          width: end[0] - start[0],
          height
        },
        {
          x: params.coordSys.x,
          y: params.coordSys.y,
          width: params.coordSys.width,
          height: params.coordSys.height
        }
      );
      return (
        rectShape && {
          type: 'rect',
          transition: ['shape'],
          shape: rectShape,
          style: api.style()
        }
      );
    };
    let graphHeight = categories.length * 50;
    graphHeight = graphHeight > window.innerHeight - 200 ? window.innerHeight - 200 : graphHeight;
    this.chartOptions.next({
      tooltip: {
        formatter: (params: any) => {
          const step = params.data.step
          let time = this.format(step.start_time)
          if (step.end_time) {
            time = `${time} - ${this.format(step.end_time)}`
          }
          const rows = Object.keys(step.properties)
            .filter(key => key !== 'name')
            .map(key => `<tr><td>${key}</td><td>${step.properties[key]}</td></tr>`)
          let properties = '';
          if (rows.length > 0) {
            properties = `<span style="font-weight: bold">Properties</span><table>${rows.join('')}</table>`
          }
          return `${params.marker} <span style="font-weight: bold">${step.properties.name}</span> ${step.status}</br>${time}</br>${properties}`;
        }
      },
      title: {
        text: 'Profile',
        left: 'center'
      },
      dataZoom: [
        {
          type: 'slider',
          filterMode: 'weakFilter',
          showDataShadow: false,
          labelFormatter: ''
        },
        {
          type: 'inside',
          filterMode: 'weakFilter'
        }
      ],
      grid: {
        height: graphHeight
      },
      xAxis: {
        type: 'value',
        min: lowestTime,
        max: highest,
        axisLabel: {
          formatter: this.format
        }
      },
      yAxis: {
        data: categories
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
      series: [
        {
          type: 'custom',
          renderItem: render,
          itemStyle: {
            opacity: 0.6
          },
          encode: {
            x: [1, 2],
            y: 0
          },
          data
        }
      ]
    });
  }

  click(event: any) {
    let selectedSteps = this.openedSteps.getValue();
    const step = event.data.step;
    if (selectedSteps.find(s => s.step_id === step.step_id)) {
      this.openedSteps.next(selectedSteps.filter(s => s.step_id !== step.step_id));
    } else {
      selectedSteps.push(step);
      this.openedSteps.next(selectedSteps);
    }
  }

  getKeys(obj: any): any[] {
    return Object.keys(obj);
  }

  getStepTime(step: any): any {
    let res = this.format(step.start_time);
    if (step.status !== 'running') {
      res = `${res} - ${this.format(step.end_time)}`;
    }
    return res;
  }

  getStepStatus(status: string) {
    return {color: this.getColorByStatus(status)}
  }

  getColorByStatus(status: string): string {
    switch (status) {
      case 'passed': {
        return 'rgb(46,185,1)';
      }
      case 'failed': {
        return 'rgb(196,0,0)';
      }
      case 'running': {
        return 'rgb(255,166,0)';
      }
      default: {
        return 'rgb(1,1,1,1)';
      }
    }

  }

  graphStyle() {
    let height = (this.categories * 50) + 150;
    const res: any = {
      height: `${height > window.innerHeight - 200 ? window.innerHeight - 50 : height}px`
    };
    return res;
  }
}
