import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ThemePalette} from "@angular/material/core";

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
    this.router.navigateByUrl(path);
  }

  getColor(path: string): ThemePalette {
    return this.router.url.includes(path) ? 'primary' : undefined
  }
}
