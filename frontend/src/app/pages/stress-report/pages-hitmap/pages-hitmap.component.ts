import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {EChartsOption} from 'echarts';
import {BehaviorSubject} from 'rxjs';
import {Page} from '../stress-report.component';

@Component({
  selector: 'app-pages-hitmap',
  templateUrl: './pages-hitmap.component.html',
  styleUrls: ['./pages-hitmap.component.scss']
})
export class PagesHitmapComponent implements OnInit {

  @Input() pages: Page[] | null = null;
  @Output() onSelect = new EventEmitter<Page>();
  options = new BehaviorSubject<EChartsOption>({} as EChartsOption);
  pageCoord: any[] = [];

  maxRowWidth = 7;

  constructor() {
  }

  ngOnInit(): void {
    this.draw();
  }

  findPageByCoord(sCoord: any[]): Page {
    return this.pageCoord.find((coord: any[]) => coord[0] === sCoord[0] && coord[1] === sCoord[1])[2];
  }

  draw() {
    let maxFailed = 100;
    if (this.pages === null) {
      return;
    }
    const pageNames: string[] = []
    let rows = 1;
    const rowMax = this.pages.length < this.maxRowWidth ? this.pages.length : this.maxRowWidth;
    let x = -1;
    this.pageCoord = [];
    const data = this.pages
      .sort((a: Page, b: Page) => a.data.order - b.data.order)
      .map((page: Page) => {
        const failedCount = page.data.statuses.hasOwnProperty('failed') ? page.data.statuses.failed : 0;
        const passedCount = page.data.statuses.hasOwnProperty('passed') ? page.data.statuses.passed : 0;
        if (!pageNames.includes(page.name)) {
          pageNames.push(page.name);
        }
        if (x == rowMax - 1) {
          rows++;
          x = 0;
        } else {
          x++;
        }

        this.pageCoord.push([x, rows - 1, page]);
        const failedState = failedCount/passedCount * 100;
        return [x, rows - 1, Math.round(failedCount == 0 && passedCount == 0 ? 0 : failedState)]
      });
    this.options.next({
      tooltip: {
        position: 'bottom',
        formatter: (params: any) => {
          const page: Page = this.findPageByCoord(params.data);
          const rows = Object.keys(page.data.statuses)
            .sort((a: string, b: string) => a.localeCompare(b))
            .map((k: string) => `<tr style="background-color: ${this.getColor(k)}"><td style="padding: 10px">${k}</td><td style="padding: 10px">${page.data.statuses[k]}</td></tr>`)
          return `<span style="font-weight: bold">${page.name}</span><br/><table style="border-collapse: collapse">${rows.join('')}</table>`;
        }
      },
      grid: {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      },
      xAxis: {
        axisLabel: {
          show: false
        },
        type: 'category',
        data: [...new Array(rowMax).keys()],
        splitArea: {
          show: true
        }
      },
      yAxis: {
        axisLabel: {
          show: false
        },
        type: 'category',
        data: [...new Array(rows).keys()],
        splitArea: {
          show: true
        }
      },
      visualMap: {
        type: 'continuous',
        show: false,
        min: 0,
        max: maxFailed,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        inRange : {
          color: [
            'rgba(5,126,0, 0.8)',
            'rgba(155,0,0, 0.8)'
          ]
        },
        borderWidth: 0
      },
      series: [
        {
          type: 'heatmap',
          data,
          label: {
            show: true,
            formatter: (param: any) => {
              return this.findPageByCoord(param.data).name;
            }
          },
          emphasis: {

            itemStyle: {
              color: 'black',
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    });
  }

  getHeight() {
    return {
      height: this.pages === null ? '30px' : this.pages.length > this.maxRowWidth ? `${Math.ceil(this.pages.length/this.maxRowWidth) * 30}px` : '30px'
    };
  }

  getColor(status: any) {
    return status === 'passed'
      ? 'rgba(6,218,0,0.2)' : status === 'failed'
        ? 'rgba(218,0,0,0.2)' : status === 'running'
          ? 'rgba(150,117,0, 0.2)' : '';
  }

  click(params: any) {
    this.onSelect.next(this.findPageByCoord(params.data));
  }
}
