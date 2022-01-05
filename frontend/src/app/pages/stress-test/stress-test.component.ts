import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-stress-test',
  templateUrl: './stress-test.component.html',
  styleUrls: ['./stress-test.component.scss']
})
export class StressTestComponent implements OnInit {

  testId: string | null;

  openedSections: string[] = []

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute) {
    this.testId = this.activatedRoute.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    const openedSections = localStorage.getItem('openedStepsSections');
    if (openedSections !== null) {
      this.openedSections = JSON.parse(openedSections);
    }
  }

  toggleSection(name: string) {
    if (this.openedSections.includes(name)) {
      this.openedSections = this.openedSections.filter(section => section !== name);
    } else {
      this.openedSections.push(name);
    }
    localStorage.setItem('openedStepsSections', JSON.stringify(this.openedSections));
  }
}
