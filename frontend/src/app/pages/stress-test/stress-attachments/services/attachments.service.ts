import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable()
export class AttachmentsSyncService {
  selectedAttachments = new BehaviorSubject<any[]>([]);
}
