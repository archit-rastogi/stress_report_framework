import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiService} from '../../services/api.service';

@Component({
  selector: 'app-stress-test',
  templateUrl: './stress-test.component.html',
  styleUrls: ['./stress-test.component.scss']
})
export class StressTestComponent implements OnInit {

  testId: string | undefined | null = '';

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private api: ApiService) {
  }

  ngOnInit(): void {
    this.testId = this.activatedRoute.snapshot.paramMap.get('id');
  }

}
