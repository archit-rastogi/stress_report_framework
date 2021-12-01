import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-stress-test',
  templateUrl: './stress-test.component.html',
  styleUrls: ['./stress-test.component.scss']
})
export class StressTestComponent implements OnInit {

  testId: string | null;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute) {
    this.testId = this.activatedRoute.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
  }

}
