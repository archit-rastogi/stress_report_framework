import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-exception',
  templateUrl: './exception.component.html',
  styleUrls: ['./exception.component.scss']
})
export class ExceptionComponent implements OnInit{

  @Input() result: any;
  @Input() stateByDefault: boolean = true;
  showContentNames: Array<string> = [];

  ngOnInit() {
    if (this.stateByDefault) {
      this.showContentNames.push(this.result.name);
    }
  }

  toggleException(name: string) {
    if (this.showContentNames.includes(name)) {
      this.showContentNames = this.showContentNames.filter(scn => scn !== name);
    } else {
      this.showContentNames.push(name);
    }
  }
}
