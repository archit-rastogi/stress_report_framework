import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, map, Observable, startWith, Subscription} from 'rxjs';
import * as moment from 'moment';
import {EChartsOption} from 'echarts';
import {ApiService} from '../../../../services/api.service';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-stress-metric-graph',
  templateUrl: './stress-metric-graph.component.html',
  styleUrls: ['./stress-metric-graph.component.scss']
})
export class StressMetricGraphComponent implements OnInit, OnDestroy {
  echartsOptions = new BehaviorSubject<EChartsOption>({} as EChartsOption);
  loading = false;
  @Input() graphName: any;
  @Input() testId: any;
  timezoneType: string | null = 'local';
  timezoneFilterForm = new FormControl("UTC");
  timezoneFilter: Observable<string[]> = new Observable<string[]>();
  zones: Array<string> = [
    'America/Adak',
    'America/Anchorage',
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

  latestRes: any = null;

  toggle = new FormControl('avg');
  getMetricSub = new Subscription();

  constructor(private api: ApiService) {
  }

  ngOnInit(): void {
    const savedTimezoneType = localStorage.getItem('timezone_type_metric');
    if (savedTimezoneType) {
      this.timezoneType = savedTimezoneType
    }
    const savedTimezone = localStorage.getItem('timezone_selected_zone_metric');
    if (savedTimezone) {
      this.timezoneFilterForm.setValue(savedTimezone);
    }
    this.timezoneFilter = this.timezoneFilterForm.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
    this.loading = false;
    this.getGraph();
  }

  changeValue() {
    this.getGraph();
  }

  ngOnDestroy() {
    this.api.unsub(this.getMetricSub);
  }

  getGraph() {
    this.loading = true;
    this.getMetricSub = this.api.post('get_metric', {
      test_id: this.testId,
      metric_name: this.graphName,
      graph_type: this.toggle.value,
    }).subscribe(res => {
      if (res.status) {
        this.loading = false;
        this.latestRes = res;
        this.drawGraph(res);
      }
    });
  }

  drawGraph(res: any) {
    const toRound = 10 ** res.round_value;
    const series: any[] = Object.keys(res.series).map(lineName => {
      return {
        name: lineName,
        type: 'line',
        data: res.series[lineName].map((data: number[]) => {
          return [data[0] * 1000, (Math.round(data[1] * toRound)) / toRound]
        })
      }
    });
    const manyLines = Object.keys(res.series).length > 10;
    const formatCursor = (params: any) => {
      const lines = params
        .filter((p: any) => p.value[1] > 0)
        .sort((a: any, b: any) => b.value[1] - a.value[1])
        .map((s: any) => `<tr><td>${s.marker} ${s.seriesName}</td><td>${s.value[1]}</td></tr>`);
      return `${params[0].axisValueLabel}<br/><table style="width: 100%">${lines.join('')}</table>`
    }
    this.echartsOptions.next({
      animationDuration: 100,
      legend: {
        data: Object.keys(res.series),
        bottom: 0,
      },
      tooltip: {
        order: 'valueDesc',
        trigger: 'axis',
        formatter: formatCursor,
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
      emphasis: {
        focus: 'series'
      },
      xAxis: [{
        type: 'time',
        axisLabel: {
          formatter: (ts: number) => this.formatTs(this.timezoneType, ts)
        }
      }],
      grid: {
        bottom: manyLines ? 150 : 50
      },
      yAxis: [{
        name: res.symbol,
        type: 'value'
      }],
      series: series
    });
  }

  formatTs(timezoneType: string | null, timestamp: number) {
    const sourceTime = moment(timestamp * 1000);

    switch (timezoneType) {
      case 'utc': {
        return sourceTime.utc().format('DD.MM HH:mm:ss');
      }
      case 'custom': {
        const selectedTz = this.timezoneFilterForm.value;
        return sourceTime.tz(selectedTz ? selectedTz : "UTC").format('DD.MM HH:mm:ss');
      }
      default: {
        return sourceTime.format('DD.MM HH:mm:ss');
      }
    }
  }

  timezoneChange(change: any) {
    localStorage.setItem('timezone_type_metric', change.value);
    this.timezoneType = change.value;
    this.drawGraph(this.latestRes);
  }

  timezoneChangeCustom(change: any) {
    localStorage.setItem('timezone_selected_zone_metric', change)
    this.drawGraph(this.latestRes);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    const res = this.zones.filter(option => option.toLowerCase().includes(filterValue))
    return res;
  }
}
