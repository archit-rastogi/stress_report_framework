import {Injectable, signal, WritableSignal} from '@angular/core';

@Injectable()
export class AttachmentsSyncService {
  selectedAttachments: WritableSignal<any[]> = signal([]);
}
