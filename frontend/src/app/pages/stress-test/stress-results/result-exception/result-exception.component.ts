import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-result-exception',
  templateUrl: './result-exception.component.html',
  styleUrls: ['./result-exception.component.scss']
})
export class ResultExceptionComponent {

  @Input() result: any;
}
