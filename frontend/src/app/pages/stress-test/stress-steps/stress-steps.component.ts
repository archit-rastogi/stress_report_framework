import {Component, Input, OnInit} from '@angular/core';
import {ApiService} from '../../../services/api.service';
import * as moment from 'moment';
import {EChartsOption} from 'echarts';
import {BehaviorSubject, Subject} from 'rxjs';

@Component({
  selector: 'app-stress-steps',
  templateUrl: './stress-steps.component.html',
  styleUrls: ['./stress-steps.component.scss']
})
export class StressStepsComponent implements OnInit {

  chartOptions = new Subject<EChartsOption>();
  @Input() testId: string | undefined | null;
  steps = new BehaviorSubject<any[]>([]);
  minTime = 0;
  getStepsSub: any;

  openedSteps = new BehaviorSubject<any[]>([]);

  constructor(private api: ApiService) {
  }

  ngOnInit(): void {
    this.getStepsSub = this.api.post('get_steps', {test_id: this.testId}).subscribe(res => {
      if (res.status) {
        this.steps.next(res.steps);
        this.drawGraph(res.steps);
      }
    })
  }

  format = (timestamp: number) => moment(timestamp * 1000).format('DD.MM HH:mm:ss');

  drawGraph(newSteps: Array<any>) {
    if (!newSteps) {
      return;
    }
    let stepsGroups: any = {}
    if (newSteps.length === 1) {
      stepsGroups[newSteps[0].properties.name] = [newSteps[0]]
    } else {
      stepsGroups = newSteps.reduce((prev, next) => {
        if (!prev.hasOwnProperty('status')) {
          if (Object.keys(prev).includes(next.properties.name)) {
            prev[next.properties.name].push(next);
            prev[next.properties.name] = prev[next.properties.name].sort((a: any, b: any) => a.start_time - b.start_time)
          } else {
            prev[next.properties.name] = [next]
          }
        } else {
          const res: any = {}
          res[next.properties.name] = [next]
          res[prev.properties.name] = [prev]
          return res
        }
        return prev
      });
    }

    this.minTime = Math.min(...newSteps.map(step => step.start_time))
    const stepsNames = Object.keys(stepsGroups).sort((a, b) => stepsGroups[b][0].start_time - stepsGroups[a][0].start_time)
    const stepLastTime: any = {}
    const series: Array<any> = []
    const steps = []
    stepsNames.forEach((stepKey, skIdx) => {
      stepsGroups[stepKey].forEach((step: any, _: number) => {
        steps.push(step);
        if (step.status === 'running') {
          step.end_time = step.start_time + 60 * 5;
        }
        const stepName = step.properties.name;
        if (!stepLastTime.hasOwnProperty(stepName)) {
          stepLastTime[stepName] = {
            diff: step.start_time - this.minTime,
            point: step.start_time
          };
        } else {
          stepLastTime[stepName] = {
            diff: step.start_time - stepLastTime[stepName].point,
            point: step.start_time
          };
        }
        series.push({
          type: 'bar',
          name: 'test',
          stack: 'test',
          emphasis: {
            itemStyle: {
              borderColor: 'rgba(0,0,0,0)',
              color: 'rgba(0,0,0,0)'
            }
          },
          itemStyle: {
            borderColor: 'rgba(0,0,0,0)',
            color: 'rgba(0,0,0,0)'
          },
          data: [...Array(skIdx).keys()].map(_ => '-')
            .concat([stepLastTime[stepName].diff])
            .concat([...Array(stepsNames.length - skIdx - 1).keys()].map(_ => '-'))
        });


        stepLastTime[stepName] = {
          diff: step.end_time - stepLastTime[stepName].point,
          point: step.end_time
        };
        series.push({
          type: 'bar',
          name: stepName,
          stack: 'test',
          itemStyle: {
            color: step.status === 'passed' ? 'rgba(1,215,19,0.4)' : step.status === 'failed' ? 'rgba(215,1,1,0.4)' : 'rgba(241,186,4,0.53)'
          },
          data: [...Array(skIdx).keys()].map(_ => '-')
            .concat([stepLastTime[stepName].diff])
            .concat([...Array(stepsNames.length - skIdx - 1).keys()].map(_ => '-'))
        });
      })
    })
    const red = 'rgb(196,0,0)';
    const green = 'rgb(46,185,1)';
    const yellow = 'rgb(185,121,1)';
    const formatCursor = (params: any) => {
      const foundParam = params.find((param: any) => param.value !== '-' && param.seriesName !== 'test');
      if (!foundParam) {
        return '';
      }
      const dates = stepsGroups[foundParam.seriesName].map((step: any) => {
        return `<span style="color: ${step.status == 'passed' ? green : step.status == 'running' ? yellow : red}">${this.format(step.start_time)} - ${this.format(step.end_time)}</span>`
      }).join('<br/>')
      return `${foundParam.seriesName}<br/>${dates}`;
    }
    const timeFormat = (data: number) => {
      return this.format(this.minTime + data);
    }
    this.chartOptions.next({
      title: {
        text: ''
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          formatter: timeFormat
        }
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
      yAxis: {
        type: 'category',
        data: stepsNames
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: formatCursor
      },
      grid: {
        containLabel: true,
      },
      series
    });
  }

  click(event: any) {
    let selectedSteps = this.steps.getValue()
      .filter(step => step.properties.name === event.seriesName)
      .map(step => {
        step.value = step.end_time - step.start_time;
        return step;
      });
    const step = selectedSteps.find(step => event.value === step.value);
    if (step !== undefined) {
      const steps = this.openedSteps.getValue();
      if (steps.find(oStep => oStep.step_id === step.step_id)) {
        this.openedSteps.next(steps.filter(oStep => oStep.step_id !== step.step_id));
      } else {
        steps.push(step);
        this.openedSteps.next(steps);
      }
    } else {
      selectedSteps = this.steps.getValue().filter(step => step.properties.name === event.name)
      const openedSteps = this.openedSteps.getValue();
      const canFindInSelected = (step_id: string) => selectedSteps.find(ss => ss.step_id === step_id) !== undefined
      if (openedSteps.find(s => canFindInSelected(s.step_id))) {
        this.openedSteps.next(openedSteps.filter(s => !canFindInSelected(s.step_id)));
      } else {
        selectedSteps
          .filter(os => openedSteps.find(ss => ss.step_id === os.step_id) === undefined)
          .forEach(os => {
            openedSteps.push(os);
          })
        this.openedSteps.next(openedSteps);
      }

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
    let color = '';
    switch (status) {
      case 'passed': {
        color = 'rgb(46,185,1)';
        break;
      }
      case 'failed': {
        color = 'rgb(196,0,0)';
        break
      }
      case 'running': {
        color = 'rgb(185,121,1)';
        break
      }
    }
    return {color}
  }
}
