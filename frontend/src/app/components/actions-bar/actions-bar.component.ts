import { Component, OnInit } from '@angular/core';
import {ActionsService} from "../../services/actions.service";

@Component({
  selector: 'app-actions-bar',
  templateUrl: './actions-bar.component.html',
  styleUrls: ['./actions-bar.component.scss']
})
export class ActionsBarComponent implements OnInit {

  constructor(public actionsService: ActionsService) { }

  ngOnInit(): void {
  }
}
