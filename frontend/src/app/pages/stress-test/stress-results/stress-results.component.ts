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
        this.results.next(res.results);
      }
    })
  }

  getTableBody(rows: any[]): any[] {
    return rows.filter((_: any, idx: number) => idx > 0)
  }

  getColspan(rows: any[]): any {
    return {width: `${Math.round(100 / rows.length)}%`};
  }

  getCell(column: any | string | number): any {
    if (typeof column == 'string' || typeof column == 'number') {
      return column;
    } else {
      return column.value
    }
  }

  getCellStyle(cell: any): any {
    if (typeof cell == 'string' || typeof cell == 'number') {
      return {};
    } else {
      switch (cell.status) {
        case 'passed': {
          return {backgroundColor: 'rgba(38,134,0,0.2)'}
        }
        case 'failed': {
          return {backgroundColor: 'rgba(255,0,0,0.2)'}
        }
        default: {
          return {}
        }
      }
    }
  }
}
