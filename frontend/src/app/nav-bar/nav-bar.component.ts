import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

  constructor(private router: Router) {
  }

  ngOnInit(): void {
  }

  goTo(path: string): void {
    console.log('go', path);
    this.router.navigateByUrl(path);
  }

  getColor(path: string): string {
    return this.router.url.includes(path) ? 'primary' : ''
  }
}
