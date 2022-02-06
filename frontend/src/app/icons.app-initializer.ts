import {APP_INITIALIZER} from '@angular/core';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {icon, IconDefinition} from '@fortawesome/fontawesome-svg-core';
// Solid icons
import {definition as faAngleDown} from '@fortawesome/free-solid-svg-icons/faAngleDown';
import {definition as faAngleRight} from '@fortawesome/free-solid-svg-icons/faAngleRight';
import {definition as faFileAlt} from '@fortawesome/free-regular-svg-icons/faFileAlt';
import {definition as faTimes} from '@fortawesome/free-solid-svg-icons/faTimes';
import {definition as faPlus} from '@fortawesome/free-solid-svg-icons/faPlus';
import {definition as faMinus} from '@fortawesome/free-solid-svg-icons/faMinus';
import {definition as faTrash} from '@fortawesome/free-solid-svg-icons/faTrashAlt';
import {definition as faSync} from '@fortawesome/free-solid-svg-icons/faSync';
import {definition as faEdit} from '@fortawesome/free-solid-svg-icons/faEdit';
import {definition as faCheckDouble} from '@fortawesome/free-solid-svg-icons/faCheckDouble';
import {definition as faVirus} from '@fortawesome/free-solid-svg-icons/faVirus';
import {definition as faVirusSlash} from '@fortawesome/free-solid-svg-icons/faVirusSlash';
import {definition as faFileArchive} from '@fortawesome/free-solid-svg-icons/faFileArchive';
import {definition as faDownload} from '@fortawesome/free-solid-svg-icons/faDownload';

export const iconsAppInitializer = {
  provide: APP_INITIALIZER,
  multi: true,
  useFactory: (
    icons: MatIconRegistry,
    sanitizer: DomSanitizer,
  ) => () => {
    const faIcons = [
      faAngleDown,
      faAngleRight,
      faFileAlt,
      faTimes,
      faPlus,
      faMinus,
      faTrash,
      faSync,
      faEdit,
      faCheckDouble,
      faVirus,
      faVirusSlash,
      faFileArchive,
      faDownload,
    ];
    const registerFaIcon = (i: IconDefinition) => {
      icons.addSvgIconLiteralInNamespace(
        i.prefix,
        i.iconName,
        sanitizer.bypassSecurityTrustHtml(icon(i).html[0].replace(/class="[^\"]*"/, ''))
      );
    };
    faIcons.forEach(registerFaIcon);

  },
  deps: [MatIconRegistry, DomSanitizer]
};
