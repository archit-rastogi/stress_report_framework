import {Component, Input, OnChanges, OnInit, signal, SimpleChanges, WritableSignal} from '@angular/core';

@Component({
  selector: 'app-pages-total-statistics',
  templateUrl: './pages-total-statistics.component.html',
  styleUrls: ['./pages-total-statistics.component.scss']
})
export class PagesTotalStatisticsComponent implements OnInit, OnChanges {
  @Input() statisticsData: any | null = null;

  show = true;
  options: WritableSignal<any> = signal({})

  constructor() {
  }

  ngOnInit(): void {
    const show = localStorage.getItem('pages-total-statistics-show');
    if (show == null) {
      this.show = true;
    } else {
      this.show = show === 'true';
    }
    this.draw();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['statisticsData'].firstChange) {
      this.draw();
    }
  }

  toggleShow() {
    this.show = !this.show;
    localStorage.setItem('pages-total-statistics-show', this.show.toString());
  }

  private draw() {
    if (this.statisticsData === null) {
      return;
    }
    const xAxis = Object.keys(this.statisticsData)
      .filter((page: string) => this.statisticsData[page].length > 0)
      .sort((a: any, b: any) => this.statisticsData[a][0].order - this.statisticsData[b][0].order);
    this.options.set({
      tooltip: {
        order: 'valueDesc',
        trigger: 'axis'
      },
      legend: {
        data: [
          'Passed',
          'Failed',
          'Running',
          'Failed with Known Issues',
          'Passed with Known Issues'
        ],
        bottom: 0
      },
      animationDuration: 100,
      xAxis: {
        type: 'category',
        data: xAxis,
      },
      yAxis: {
        type: 'value',
      },
      grid: {
        left: -10,
        right: -10,
      },
      series: [
        {
          name: 'Passed',
          stack: 'all',
          type: 'line',
          emphasis: {
            focus: 'series'
          },
          itemStyle: {
            color: 'rgba(24,173,0,0.56)'
          },
          lineStyle: {
            color: 'rgba(24,173,0,0.56)'
          },
          areaStyle: {
            color: 'rgba(24,173,0,0.56)'
          },
          data: xAxis.map((x: any) => this.statisticsData[x].filter((test: any) => test.status === 'passed').length)
        },
        {
          name: 'Running',
          stack: 'all',
          type: 'line',
          emphasis: {
            focus: 'series'
          },
          itemStyle: {
            color: 'rgba(150,117,0,0.5)'
          },
          lineStyle: {
            color: 'rgba(150,117,0,0.5)'
          },
          areaStyle: {
            color: 'rgba(150,117,0,0.5)'
          },
          data: xAxis.map((x: any) => this.statisticsData[x].filter((test: any) => test.status === 'running').length)
        },
        {
          name: 'Failed',
          stack: 'all',
          type: 'line',
          emphasis: {
            focus: 'series'
          },
          itemStyle: {
            color: 'rgba(127,0,13,0.5)'
          },
          lineStyle: {
            color: 'rgba(127,0,13,0.5)'
          },
          areaStyle: {
            color: 'rgba(127,0,13,0.5)'
          },
          data: xAxis.map((x: any) => this.statisticsData[x].filter((test: any) => test.status === 'failed').length)
        },
        {
          name: 'Failed with Known Issues',
          stack: 'known_issues',
          type: 'line',
          emphasis: {
            focus: 'series'
          },
          itemStyle: {
            color: 'rgba(127,0,64,0.5)'
          },
          lineStyle: {
            color: 'rgba(127,0,64,0.5)'
          },
          areaStyle: {
            color: 'rgba(127,0,64,0.5)'
          },
          data: xAxis.map((x: any) => this.statisticsData[x]
            .filter((test: any) => test.status === 'failed' && test.known_issues !== null).length)
        },
        {
          name: 'Passed with Known Issues',
          stack: 'known_issues',
          type: 'line',
          emphasis: {
            focus: 'series'
          },
          itemStyle: {
            color: 'rgba(20,129,1,0.5)'
          },
          lineStyle: {
            color: 'rgba(20,129,1,0.5)'
          },
          areaStyle: {
            color: 'rgba(20,129,1,0.5)'
          },
          data: xAxis.map((x: any) => this.statisticsData[x]
            .filter((test: any) => test.status === 'passed' && test.known_issues !== null).length)
        }
      ]
    });
  }
}
