import {Component, Input, OnInit} from '@angular/core';
import {ApiService} from '../../../services/api.service';
import {BehaviorSubject} from 'rxjs';


@Component({
  selector: 'app-stress-metrics',
  templateUrl: './stress-metrics.component.html',
  styleUrls: ['./stress-metrics.component.scss']
})
export class StressMetricsComponent implements OnInit {

  @Input() testId: string | undefined | null;
  graphs = new BehaviorSubject<any>({});
  sections = new BehaviorSubject<Array<string>>([]);
  openedGraphs = new BehaviorSubject<Array<string>>([]);
  getMetricsSub: any;
  loading = false;

  constructor(private api: ApiService) {
  }

  ngOnInit(): void {
    this.loading = true;
    this.openedGraphs.next([]);
    this.getMetricsSub = this.api
      .post('get_metrics', {test_id: this.testId})
      .subscribe((res: any) => {
        const graphs: any = {};
        const allGraphs: Array<any> = [];
        const sections: Array<any> = [];
        const pattern = new RegExp('\[[a-zA-Z0-9 _-]+\]+', 'g')
        const catSections = (s: string) => s.substr(1, s.length - 2);
        res.metrics.filter((metricName: string) => {
          const foundSections: Array<string> | null = metricName.match(pattern);
          if (foundSections !== null) {
            metricName = metricName.replace(foundSections[0], '').trim();
            const section = catSections(foundSections[0]);
            if (!sections.includes(section)) {
              sections.push(section);
            }
          } else if (!sections.includes('default')) {
            sections.push('default');
          }
          allGraphs.push({name: metricName, section: foundSections ? catSections(foundSections[0]) : 'default'});
        })
        sections.forEach((section: string) => {
          graphs[section] = allGraphs.filter(g => g.section === section).map(g => g.name);
        });
        this.sections.next(sections);
        this.graphs.next(graphs);
        this.loading = false;
      });
  }

  graphIsOpen(graphName: string) {
    return this.openedGraphs.getValue().includes(graphName);
  }

  toggleShow(graphName: string) {
    if (this.graphIsOpen(graphName)) {
      this.openedGraphs.next(this.openedGraphs.getValue().filter(g => g !== graphName));
    } else {
      const openedGraphs = this.openedGraphs.getValue();
      openedGraphs.push(graphName);
      this.openedGraphs.next(openedGraphs);
    }
  }

  toggleCloseOpen() {
    if (this.openedGraphs.getValue().length > 0) {
      return this.openedGraphs.next([])
    } else {
      const graphsToOpen: Array<string> = []
      Object.values(this.graphs.getValue()).forEach(
        (names: any) => names.forEach((name: string) => graphsToOpen.push(name)));
      this.openedGraphs.next(graphsToOpen)
    }
  }
}
