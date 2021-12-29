import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-result-exception',
  templateUrl: './result-exception.component.html',
  styleUrls: ['./result-exception.component.scss']
})
export class ResultExceptionComponent implements OnInit {

  @Input() result: any;
  showContentNames: Array<string> = [];

  constructor() {
  }

  ngOnInit(): void {
  }

  toggleException(name: string) {
    if (this.showContentNames.includes(name)) {
      this.showContentNames = this.showContentNames.filter(scn => scn !== name);
    } else {
      this.showContentNames.push(name);
    }
  }
}
