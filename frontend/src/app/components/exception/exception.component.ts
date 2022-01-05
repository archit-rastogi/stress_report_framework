import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-exception',
  templateUrl: './exception.component.html',
  styleUrls: ['./exception.component.scss']
})
export class ExceptionComponent {

  @Input() result: any;
  showContentNames: Array<string> = [];

  toggleException(name: string) {
    if (this.showContentNames.includes(name)) {
      this.showContentNames = this.showContentNames.filter(scn => scn !== name);
    } else {
      this.showContentNames.push(name);
    }
  }
}
