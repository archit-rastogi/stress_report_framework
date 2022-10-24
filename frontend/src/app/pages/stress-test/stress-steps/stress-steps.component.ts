import {Component, Input, OnInit} from '@angular/core';
import {ApiService} from '../../../services/api.service';
import * as moment from 'moment-timezone';
import * as echarts from 'echarts';
import {BehaviorSubject, map, Observable, startWith} from 'rxjs';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-stress-steps',
  templateUrl: './stress-steps.component.html',
  styleUrls: ['./stress-steps.component.scss']
})
export class StressStepsComponent implements OnInit {

  chartOptions = new BehaviorSubject<echarts.EChartsOption>({});
  @Input() testId: string | undefined | null;
  steps = new BehaviorSubject<any[]>([]);
  getStepsSub: any;
  loading = false;
  categories = 1;
  timezone: string | null = '';
  timezoneFilterForm = new FormControl();
  timezoneFilter: Observable<string[]> = new Observable<string[]>();
  zones: Array<string> = [
    'Africa/Abidjan',
    'Africa/Accra',
    'Africa/Addis_Ababa',
    'Africa/Algiers',
    'Africa/Asmara',
    'Africa/Asmera',
    'Africa/Bamako',
    'Africa/Bangui',
    'Africa/Banjul',
    'Africa/Bissau',
    'Africa/Blantyre',
    'Africa/Brazzaville',
    'Africa/Bujumbura',
    'Africa/Cairo',
    'Africa/Casablanca',
    'Africa/Ceuta',
    'Africa/Conakry',
    'Africa/Dakar',
    'Africa/Dar_es_Salaam',
    'Africa/Djibouti',
    'Africa/Douala',
    'Africa/El_Aaiun',
    'Africa/Freetown',
    'Africa/Gaborone',
    'Africa/Harare',
    'Africa/Johannesburg',
    'Africa/Juba',
    'Africa/Kampala',
    'Africa/Khartoum',
    'Africa/Kigali',
    'Africa/Kinshasa',
    'Africa/Lagos',
    'Africa/Libreville',
    'Africa/Lome',
    'Africa/Luanda',
    'Africa/Lubumbashi',
    'Africa/Lusaka',
    'Africa/Malabo',
    'Africa/Maputo',
    'Africa/Maseru',
    'Africa/Mbabane',
    'Africa/Mogadishu',
    'Africa/Monrovia',
    'Africa/Nairobi',
    'Africa/Ndjamena',
    'Africa/Niamey',
    'Africa/Nouakchott',
    'Africa/Ouagadougou',
    'Africa/Porto-Novo',
    'Africa/Sao_Tome',
    'Africa/Timbuktu',
    'Africa/Tripoli',
    'Africa/Tunis',
    'Africa/Windhoek',
    'America/Adak',
    'America/Anchorage',
    'America/Anguilla',
    'America/Antigua',
    'America/Araguaina',
    'America/Argentina/Buenos_Aires',
    'America/Argentina/Catamarca',
    'America/Argentina/ComodRivadavia',
    'America/Argentina/Cordoba',
    'America/Argentina/Jujuy',
    'America/Argentina/La_Rioja',
    'America/Argentina/Mendoza',
    'America/Argentina/Rio_Gallegos',
    'America/Argentina/Salta',
    'America/Argentina/San_Juan',
    'America/Argentina/San_Luis',
    'America/Argentina/Tucuman',
    'America/Argentina/Ushuaia',
    'America/Aruba',
    'America/Asuncion',
    'America/Atikokan',
    'America/Atka',
    'America/Bahia',
    'America/Bahia_Banderas',
    'America/Barbados',
    'America/Belem',
    'America/Belize',
    'America/Blanc-Sablon',
    'America/Boa_Vista',
    'America/Bogota',
    'America/Boise',
    'America/Buenos_Aires',
    'America/Cambridge_Bay',
    'America/Campo_Grande',
    'America/Cancun',
    'America/Caracas',
    'America/Catamarca',
    'America/Cayenne',
    'America/Cayman',
    'America/Chicago',
    'America/Chihuahua',
    'America/Coral_Harbour',
    'America/Cordoba',
    'America/Costa_Rica',
    'America/Creston',
    'America/Cuiaba',
    'America/Curacao',
    'America/Danmarkshavn',
    'America/Dawson',
    'America/Dawson_Creek',
    'America/Denver',
    'America/Detroit',
    'America/Dominica',
    'America/Edmonton',
    'America/Eirunepe',
    'America/El_Salvador',
    'America/Ensenada',
    'America/Fort_Nelson',
    'America/Fort_Wayne',
    'America/Fortaleza',
    'America/Glace_Bay',
    'America/Godthab',
    'America/Goose_Bay',
    'America/Grand_Turk',
    'America/Grenada',
    'America/Guadeloupe',
    'America/Guatemala',
    'America/Guayaquil',
    'America/Guyana',
    'America/Halifax',
    'America/Havana',
    'America/Hermosillo',
    'America/Indiana/Indianapolis',
    'America/Indiana/Knox',
    'America/Indiana/Marengo',
    'America/Indiana/Petersburg',
    'America/Indiana/Tell_City',
    'America/Indiana/Vevay',
    'America/Indiana/Vincennes',
    'America/Indiana/Winamac',
    'America/Indianapolis',
    'America/Inuvik',
    'America/Iqaluit',
    'America/Jamaica',
    'America/Jujuy',
    'America/Juneau',
    'America/Kentucky/Louisville',
    'America/Kentucky/Monticello',
    'America/Knox_IN',
    'America/Kralendijk',
    'America/La_Paz',
    'America/Lima',
    'America/Los_Angeles',
    'America/Louisville',
    'America/Lower_Princes',
    'America/Maceio',
    'America/Managua',
    'America/Manaus',
    'America/Marigot',
    'America/Martinique',
    'America/Matamoros',
    'America/Mazatlan',
    'America/Mendoza',
    'America/Menominee',
    'America/Merida',
    'America/Metlakatla',
    'America/Mexico_City',
    'America/Miquelon',
    'America/Moncton',
    'America/Monterrey',
    'America/Montevideo',
    'America/Montreal',
    'America/Montserrat',
    'America/Nassau',
    'America/New_York',
    'America/Nipigon',
    'America/Nome',
    'America/Noronha',
    'America/North_Dakota/Beulah',
    'America/North_Dakota/Center',
    'America/North_Dakota/New_Salem',
    'America/Ojinaga',
    'America/Panama',
    'America/Pangnirtung',
    'America/Paramaribo',
    'America/Phoenix',
    'America/Port-au-Prince',
    'America/Port_of_Spain',
    'America/Porto_Acre',
    'America/Porto_Velho',
    'America/Puerto_Rico',
    'America/Punta_Arenas',
    'America/Rainy_River',
    'America/Rankin_Inlet',
    'America/Recife',
    'America/Regina',
    'America/Resolute',
    'America/Rio_Branco',
    'America/Rosario',
    'America/Santa_Isabel',
    'America/Santarem',
    'America/Santiago',
    'America/Santo_Domingo',
    'America/Sao_Paulo',
    'America/Scoresbysund',
    'America/Shiprock',
    'America/Sitka',
    'America/St_Barthelemy',
    'America/St_Johns',
    'America/St_Kitts',
    'America/St_Lucia',
    'America/St_Thomas',
    'America/St_Vincent',
    'America/Swift_Current',
    'America/Tegucigalpa',
    'America/Thule',
    'America/Thunder_Bay',
    'America/Tijuana',
    'America/Toronto',
    'America/Tortola',
    'America/Vancouver',
    'America/Virgin',
    'America/Whitehorse',
    'America/Winnipeg',
    'America/Yakutat',
    'America/Yellowknife',
    'Antarctica/Casey',
    'Antarctica/Davis',
    'Antarctica/DumontDUrville',
    'Antarctica/Macquarie',
    'Antarctica/Mawson',
    'Antarctica/McMurdo',
    'Antarctica/Palmer',
    'Antarctica/Rothera',
    'Antarctica/South_Pole',
    'Antarctica/Syowa',
    'Antarctica/Troll',
    'Antarctica/Vostok',
    'Arctic/Longyearbyen',
    'Asia/Aden',
    'Asia/Almaty',
    'Asia/Amman',
    'Asia/Anadyr',
    'Asia/Aqtau',
    'Asia/Aqtobe',
    'Asia/Ashgabat',
    'Asia/Ashkhabad',
    'Asia/Atyrau',
    'Asia/Baghdad',
    'Asia/Bahrain',
    'Asia/Baku',
    'Asia/Bangkok',
    'Asia/Barnaul',
    'Asia/Beirut',
    'Asia/Bishkek',
    'Asia/Brunei',
    'Asia/Calcutta',
    'Asia/Chita',
    'Asia/Choibalsan',
    'Asia/Chongqing',
    'Asia/Chungking',
    'Asia/Colombo',
    'Asia/Dacca',
    'Asia/Damascus',
    'Asia/Dhaka',
    'Asia/Dili',
    'Asia/Dubai',
    'Asia/Dushanbe',
    'Asia/Famagusta',
    'Asia/Gaza',
    'Asia/Harbin',
    'Asia/Hebron',
    'Asia/Ho_Chi_Minh',
    'Asia/Hong_Kong',
    'Asia/Hovd',
    'Asia/Irkutsk',
    'Asia/Istanbul',
    'Asia/Jakarta',
    'Asia/Jayapura',
    'Asia/Jerusalem',
    'Asia/Kabul',
    'Asia/Kamchatka',
    'Asia/Karachi',
    'Asia/Kashgar',
    'Asia/Kathmandu',
    'Asia/Katmandu',
    'Asia/Khandyga',
    'Asia/Kolkata',
    'Asia/Krasnoyarsk',
    'Asia/Kuala_Lumpur',
    'Asia/Kuching',
    'Asia/Kuwait',
    'Asia/Macao',
    'Asia/Macau',
    'Asia/Magadan',
    'Asia/Makassar',
    'Asia/Manila',
    'Asia/Muscat',
    'Asia/Nicosia',
    'Asia/Novokuznetsk',
    'Asia/Novosibirsk',
    'Asia/Omsk',
    'Asia/Oral',
    'Asia/Phnom_Penh',
    'Asia/Pontianak',
    'Asia/Pyongyang',
    'Asia/Qatar',
    'Asia/Qyzylorda',
    'Asia/Rangoon',
    'Asia/Riyadh',
    'Asia/Saigon',
    'Asia/Sakhalin',
    'Asia/Samarkand',
    'Asia/Seoul',
    'Asia/Shanghai',
    'Asia/Singapore',
    'Asia/Srednekolymsk',
    'Asia/Taipei',
    'Asia/Tashkent',
    'Asia/Tbilisi',
    'Asia/Tehran',
    'Asia/Tel_Aviv',
    'Asia/Thimbu',
    'Asia/Thimphu',
    'Asia/Tokyo',
    'Asia/Tomsk',
    'Asia/Ujung_Pandang',
    'Asia/Ulaanbaatar',
    'Asia/Ulan_Bator',
    'Asia/Urumqi',
    'Asia/Ust-Nera',
    'Asia/Vientiane',
    'Asia/Vladivostok',
    'Asia/Yakutsk',
    'Asia/Yangon',
    'Asia/Yekaterinburg',
    'Asia/Yerevan',
    'Atlantic/Azores',
    'Atlantic/Bermuda',
    'Atlantic/Canary',
    'Atlantic/Cape_Verde',
    'Atlantic/Faeroe',
    'Atlantic/Faroe',
    'Atlantic/Jan_Mayen',
    'Atlantic/Madeira',
    'Atlantic/Reykjavik',
    'Atlantic/South_Georgia',
    'Atlantic/St_Helena',
    'Atlantic/Stanley',
    'Australia/ACT',
    'Australia/Adelaide',
    'Australia/Brisbane',
    'Australia/Broken_Hill',
    'Australia/Canberra',
    'Australia/Currie',
    'Australia/Darwin',
    'Australia/Eucla',
    'Australia/Hobart',
    'Australia/LHI',
    'Australia/Lindeman',
    'Australia/Lord_Howe',
    'Australia/Melbourne',
    'Australia/NSW',
    'Australia/North',
    'Australia/Perth',
    'Australia/Queensland',
    'Australia/South',
    'Australia/Sydney',
    'Australia/Tasmania',
    'Australia/Victoria',
    'Australia/West',
    'Australia/Yancowinna',
    'Brazil/Acre',
    'Brazil/DeNoronha',
    'Brazil/East',
    'Brazil/West',
    'CET',
    'CST6CDT',
    'Canada/Atlantic',
    'Canada/Central',
    'Canada/Eastern',
    'Canada/Mountain',
    'Canada/Newfoundland',
    'Canada/Pacific',
    'Canada/Saskatchewan',
    'Canada/Yukon',
    'Chile/Continental',
    'Chile/EasterIsland',
    'Cuba',
    'EET',
    'EST',
    'EST5EDT',
    'Egypt',
    'Eire',
    'Etc/GMT',
    'Etc/GMT+0',
    'Etc/GMT+1',
    'Etc/GMT+10',
    'Etc/GMT+11',
    'Etc/GMT+12',
    'Etc/GMT+2',
    'Etc/GMT+3',
    'Etc/GMT+4',
    'Etc/GMT+5',
    'Etc/GMT+6',
    'Etc/GMT+7',
    'Etc/GMT+8',
    'Etc/GMT+9',
    'Etc/GMT-0',
    'Etc/GMT-1',
    'Etc/GMT-10',
    'Etc/GMT-11',
    'Etc/GMT-12',
    'Etc/GMT-13',
    'Etc/GMT-14',
    'Etc/GMT-2',
    'Etc/GMT-3',
    'Etc/GMT-4',
    'Etc/GMT-5',
    'Etc/GMT-6',
    'Etc/GMT-7',
    'Etc/GMT-8',
    'Etc/GMT-9',
    'Etc/GMT0',
    'Etc/Greenwich',
    'Etc/UCT',
    'Etc/UTC',
    'Etc/Universal',
    'Etc/Zulu',
    'Europe/Amsterdam',
    'Europe/Andorra',
    'Europe/Astrakhan',
    'Europe/Athens',
    'Europe/Belfast',
    'Europe/Belgrade',
    'Europe/Berlin',
    'Europe/Bratislava',
    'Europe/Brussels',
    'Europe/Bucharest',
    'Europe/Budapest',
    'Europe/Busingen',
    'Europe/Chisinau',
    'Europe/Copenhagen',
    'Europe/Dublin',
    'Europe/Gibraltar',
    'Europe/Guernsey',
    'Europe/Helsinki',
    'Europe/Isle_of_Man',
    'Europe/Istanbul',
    'Europe/Jersey',
    'Europe/Kaliningrad',
    'Europe/Kiev',
    'Europe/Kirov',
    'Europe/Lisbon',
    'Europe/Ljubljana',
    'Europe/London',
    'Europe/Luxembourg',
    'Europe/Madrid',
    'Europe/Malta',
    'Europe/Mariehamn',
    'Europe/Minsk',
    'Europe/Monaco',
    'Europe/Moscow',
    'Europe/Nicosia',
    'Europe/Oslo',
    'Europe/Paris',
    'Europe/Podgorica',
    'Europe/Prague',
    'Europe/Riga',
    'Europe/Rome',
    'Europe/Samara',
    'Europe/San_Marino',
    'Europe/Sarajevo',
    'Europe/Saratov',
    'Europe/Simferopol',
    'Europe/Skopje',
    'Europe/Sofia',
    'Europe/Stockholm',
    'Europe/Tallinn',
    'Europe/Tirane',
    'Europe/Tiraspol',
    'Europe/Ulyanovsk',
    'Europe/Uzhgorod',
    'Europe/Vaduz',
    'Europe/Vatican',
    'Europe/Vienna',
    'Europe/Vilnius',
    'Europe/Volgograd',
    'Europe/Warsaw',
    'Europe/Zagreb',
    'Europe/Zaporozhye',
    'Europe/Zurich',
    'GB',
    'GB-Eire',
    'GMT',
    'GMT+0',
    'GMT-0',
    'GMT0',
    'Greenwich',
    'HST',
    'Hongkong',
    'Iceland',
    'Indian/Antananarivo',
    'Indian/Chagos',
    'Indian/Christmas',
    'Indian/Cocos',
    'Indian/Comoro',
    'Indian/Kerguelen',
    'Indian/Mahe',
    'Indian/Maldives',
    'Indian/Mauritius',
    'Indian/Mayotte',
    'Indian/Reunion',
    'Iran',
    'Israel',
    'Jamaica',
    'Japan',
    'Kwajalein',
    'Libya',
    'MET',
    'MST',
    'MST7MDT',
    'Mexico/BajaNorte',
    'Mexico/BajaSur',
    'Mexico/General',
    'NZ',
    'NZ-CHAT',
    'Navajo',
    'PRC',
    'PST8PDT',
    'Pacific/Apia',
    'Pacific/Auckland',
    'Pacific/Bougainville',
    'Pacific/Chatham',
    'Pacific/Chuuk',
    'Pacific/Easter',
    'Pacific/Efate',
    'Pacific/Enderbury',
    'Pacific/Fakaofo',
    'Pacific/Fiji',
    'Pacific/Funafuti',
    'Pacific/Galapagos',
    'Pacific/Gambier',
    'Pacific/Guadalcanal',
    'Pacific/Guam',
    'Pacific/Honolulu',
    'Pacific/Johnston',
    'Pacific/Kiritimati',
    'Pacific/Kosrae',
    'Pacific/Kwajalein',
    'Pacific/Majuro',
    'Pacific/Marquesas',
    'Pacific/Midway',
    'Pacific/Nauru',
    'Pacific/Niue',
    'Pacific/Norfolk',
    'Pacific/Noumea',
    'Pacific/Pago_Pago',
    'Pacific/Palau',
    'Pacific/Pitcairn',
    'Pacific/Pohnpei',
    'Pacific/Ponape',
    'Pacific/Port_Moresby',
    'Pacific/Rarotonga',
    'Pacific/Saipan',
    'Pacific/Samoa',
    'Pacific/Tahiti',
    'Pacific/Tarawa',
    'Pacific/Tongatapu',
    'Pacific/Truk',
    'Pacific/Wake',
    'Pacific/Wallis',
    'Pacific/Yap',
    'Poland',
    'Portugal',
    'ROC',
    'ROK',
    'Singapore',
    'Turkey',
    'UCT',
    'US/Alaska',
    'US/Aleutian',
    'US/Arizona',
    'US/Central',
    'US/East-Indiana',
    'US/Eastern',
    'US/Hawaii',
    'US/Indiana-Starke',
    'US/Michigan',
    'US/Mountain',
    'US/Pacific',
    'US/Pacific-New',
    'US/Samoa',
    'UTC',
    'Universal',
    'W-SU',
    'WET',
    'Zulu'
  ]

  openedSteps = new BehaviorSubject<any[]>([]);

  constructor(private api: ApiService) {
  }

  deepCopy(obj: any): any {
    return JSON.parse(JSON.stringify(obj))
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.zones.filter(option => option.toLowerCase().includes(filterValue));
  }

  ngOnInit(): void {
    this.timezoneFilterForm.setValue(localStorage.getItem('timezone_selected_zone'));
    this.timezoneFilter = this.timezoneFilterForm.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
    this.timezone = localStorage.getItem('timezone_steps') == null ? 'utc' : localStorage.getItem('timezone_steps')
    this.loading = true;
    this.getStepsSub = this.api.post('get_steps', {test_id: this.testId}).subscribe(res => {
      this.loading = false;
      if (res.status) {
        this.steps.next(this.deepCopy(res.steps));
        this.drawGraph(this.deepCopy(res.steps));
      }
    })
  }

  formatTs(timezone: string | null, timestamp: number) {
    let prepareTime = (momentTime: any) => momentTime;
    switch (timezone) {
      case 'utc': {
        prepareTime = (momentTime: any) => momentTime.utc()
        break;
      }
      case 'custom': {
        prepareTime = (momentTime: any) => momentTime.tz(this.timezoneFilterForm.value);
        break;
      }
    }
    return prepareTime(moment(timestamp * 1000)).format('DD.MM HH:mm:ss');
  }

  drawGraph(steps: Array<any>) {
    const data: any[] = [];
    let categories: string[] = []
    new Set(steps.map(step => step.properties.name)).forEach(i => {
      categories.push(i);
    })
    const findTime = (name: string) => steps.find(s => s.properties.name === name).start_time
    categories = categories.sort((a: string, b: string) => findTime(b) - findTime(a));
    this.categories = categories.length;

    let lowestTime = +new Date() + 10000;
    let highest = 0;

    steps.forEach((step: any) => {
      if (step.start_time < lowestTime) {
        lowestTime = step.start_time;
      }
      if (step.end_time > highest) {
        highest = step.end_time;
      }
    });
    if (highest == 0) {
      highest = lowestTime + 60 * 3;
    }
    let longestNameLength = 0;
    steps.forEach((step: any) => {
      if (step.end_time === null) {
        step.end_time = +new Date()
      }
      if (longestNameLength < step.properties.name.length) {
        longestNameLength = step.properties.name.length;
      }
      data.push({
        name: step.properties.name,
        value: [categories.indexOf(step.properties.name), step.start_time, step.end_time, step.end_time - step.start_time],
        step,
        itemStyle: {
          normal: {
            color: this.getColorByStatus(step.status)
          }
        }
      });
    });
    const render: echarts.CustomSeriesRenderItem = (params: any, api: any) => {
      const categoryIndex = api.value(0);
      const start = api.coord([api.value(1), categoryIndex]);
      const end = api.coord([api.value(2), categoryIndex]);
      const height = api.size([0, 1])[1] * 0.6;
      const rectShape = echarts.graphic.clipRectByRect(
        {
          x: start[0],
          y: start[1] - height / 2,
          width: end[0] - start[0],
          height
        },
        {
          x: params.coordSys.x,
          y: params.coordSys.y,
          width: params.coordSys.width,
          height: params.coordSys.height
        }
      );
      return (
        rectShape && {
          type: 'rect',
          transition: ['shape'],
          shape: rectShape,
          style: api.style()
        }
      );
    };
    let graphHeight = categories.length * 50;
    graphHeight = graphHeight > window.innerHeight - 200 ? window.innerHeight - 200 : graphHeight;
    this.chartOptions.next({
      tooltip: {
        formatter: (params: any) => {
          const step = params.data.step
          let time = this.formatTs(this.timezone, step.start_time)
          if (step.end_time) {
            time = `${time} - ${this.formatTs(this.timezone, step.end_time)}`
          }
          const rows = Object.keys(step.properties)
            .filter(key => key !== 'name')
            .map(key => `<tr><td>${key}</td><td>${step.properties[key]}</td></tr>`)
          let properties = '';
          if (rows.length > 0) {
            properties = `<span style="font-weight: bold">Properties</span><table>${rows.join('')}</table>`
          }
          return `${params.marker} <span style="font-weight: bold">${step.properties.name}</span> ${step.status}</br>${time}</br>${properties}`;
        }
      },
      title: {
        text: 'Profile',
        left: 'center'
      },
      dataZoom: [
        {
          type: 'slider',
          filterMode: 'weakFilter',
          showDataShadow: false,
          labelFormatter: ''
        },
        {
          type: 'inside',
          filterMode: 'weakFilter'
        }
      ],
      grid: {
        height: graphHeight,
        left: `${longestNameLength / 16 * 100}px` // 16
      },
      xAxis: {
        type: 'value',
        min: lowestTime,
        max: highest,
        axisLabel: {
          formatter: (ts: number) => this.formatTs(this.timezone, ts)
        }
      },
      yAxis: {
        data: categories
      },
      toolbox: {
        feature: {
          dataZoom: {
            yAxisIndex: 'none'
          },
          restore: {},
          saveAsImage: {},
        },
        z: 0
      },
      series: [
        {
          type: 'custom',
          renderItem: render,
          itemStyle: {
            opacity: 0.6
          },
          encode: {
            x: [1, 2],
            y: 0
          },
          data
        }
      ]
    });
  }

  click(event: any) {
    let selectedSteps = this.openedSteps.getValue();
    const step = event.data.step;
    if (selectedSteps.find(s => s.step_id === step.step_id)) {
      this.openedSteps.next(selectedSteps.filter(s => s.step_id !== step.step_id));
    } else {
      selectedSteps.push(step);
      this.openedSteps.next(selectedSteps);
    }
  }

  getKeys(obj: any): any[] {
    return Object.keys(obj);
  }

  getStepTime(step: any): any {
    let res = this.formatTs(this.timezone, step.start_time);
    if (step.status !== 'running') {
      res = `${res} - ${this.formatTs(this.timezone, step.end_time)}`;
    }
    return res;
  }

  getStepStatus(status: string) {
    return {color: this.getColorByStatus(status)}
  }

  getColorByStatus(status: string): string {
    switch (status) {
      case 'passed': {
        return 'rgb(46,185,1)';
      }
      case 'failed': {
        return 'rgb(196,0,0)';
      }
      case 'running': {
        return 'rgb(255,166,0)';
      }
      default: {
        return 'rgb(1,1,1,1)';
      }
    }
  }

  graphStyle() {
    let height = (this.categories * 50) + 150;
    const res: any = {
      height: `${height > window.innerHeight - 100 ? window.innerHeight - 20 : height}px`
    };
    return res;
  }

  timezoneChange(change: any) {
    if (['local', 'utc', 'custom'].includes(change.value)) {
      localStorage.setItem('timezone_steps', change.value);
    }
    this.timezone = change.value;
    if (this.timezoneFilterForm.value !== null) {
      localStorage.setItem('timezone_selected_zone', this.timezoneFilterForm.value)
    } else if (this.timezone === 'custom') {
      return
    }
    this.drawGraph(this.deepCopy(this.steps.getValue()));
  }
}
