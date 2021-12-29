import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-result-table',
  templateUrl: './result-table.component.html',
  styleUrls: ['./result-table.component.scss']
})
export class ResultTableComponent implements OnInit {

  @Input() result: any;

  constructor() {
  }

  ngOnInit(): void {
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
