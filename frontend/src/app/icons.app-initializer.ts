import {APP_INITIALIZER} from '@angular/core';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {icon, IconDefinition} from '@fortawesome/fontawesome-svg-core';
// Solid icons
import {
  faAngleDown,
  faAngleRight,
  faAngleLeft,
  faAngleUp,
  faCheckDouble,
  faDownload,
  faPen,
  faBoxArchive,
  faMinus,
  faPlus,
  faArrowsRotate,
  faXmark,
  faTrashCan,
  faVirus,
  faVirusSlash,
  faArrowUpRightFromSquare
} from '@fortawesome/free-solid-svg-icons';
import {faFile as faFileR} from '@fortawesome/free-regular-svg-icons';

export const iconsAppInitializer = {
  provide: APP_INITIALIZER,
  multi: true,
  useFactory: (
    icons: MatIconRegistry,
    sanitizer: DomSanitizer,
  ) => () => {
    const faIcons = [
      faAngleDown,
      faAngleUp,
      faAngleRight,
      faAngleLeft,
      faFileR,
      faXmark,
      faPlus,
      faMinus,
      faTrashCan,
      faArrowsRotate,
      faPen,
      faCheckDouble,
      faVirus,
      faVirusSlash,
      faBoxArchive,
      faDownload,
      faArrowUpRightFromSquare,
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
