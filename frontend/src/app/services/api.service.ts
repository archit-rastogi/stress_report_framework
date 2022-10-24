import {Inject, Injectable} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {MatSnackBar} from '@angular/material/snack-bar';
import {HttpClient} from '@angular/common/http';
import {Observable, Subscription} from 'rxjs';


@Injectable()
export class ApiService {
  baseUrl = `/back`;

  constructor(@Inject(DOCUMENT) private document: Document,
              private snack: MatSnackBar,
              private http: HttpClient) {
  }

  unsub(sub: Subscription, idx: number | null = null): Subscription {
    try {
      if (sub) {
        sub.unsubscribe();
      }
    } catch (e) {
      if (idx !== null) {
        console.error(`Failed to unsubscribe from subscription ${idx}`);
      }
      console.error('failed to unsubscribe', e);
    }
    return sub;
  }

  post(path: string, data: any): Observable<any> {
    return this.http.post<any>(this.path(path), data);
  }

  get(path: string): Observable<any> {
    return this.http.get<any>(this.path(path));
  }

  snackMessage(message: string, durationSeconds: number): void {
    this.snack.open(message, 'Ok', {duration: durationSeconds * 1000});
  }

  getBaseLink(): string {
    return `${this.document.location.protocol}//${this.document.location.host}`
  }

  private path(methodPath: string) {
    return `${this.baseUrl}/${methodPath}`;
  }
}
