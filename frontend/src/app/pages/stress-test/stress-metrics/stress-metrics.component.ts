import {Component, Input, OnInit, signal, WritableSignal} from '@angular/core';
import {ApiService} from '../../../services/api.service';


@Component({
  selector: 'app-stress-metrics',
  templateUrl: './stress-metrics.component.html',
  styleUrls: ['./stress-metrics.component.scss']
})
export class StressMetricsComponent implements OnInit {

  @Input() testId: string | undefined | null;
  graphs : WritableSignal<any> = signal({})
  sections: WritableSignal<string[]> = signal([])
  openedGraphs: WritableSignal<string[]> = signal([])
  getMetricsSub: any;
  loading = false;

  constructor(private api: ApiService) {
  }

  ngOnInit(): void {
    this.loading = true;
    this.openedGraphs.set([]);
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
          let modifiedMetricName = metricName;
          if (foundSections !== null) {
            modifiedMetricName = metricName.replace(foundSections[0], '').trim();
            const section = catSections(foundSections[0]);
            if (!sections.includes(section)) {
              sections.push(section);
            }
          } else if (!sections.includes('default')) {
            sections.push('default');
          }
          allGraphs.push({
            name: metricName,
            modified: modifiedMetricName,
            section: foundSections ? catSections(foundSections[0]) : 'default'
          });
        })
        sections.forEach((section: string) => {
          graphs[section] = allGraphs
            .filter(g => g.section === section)
            .sort((a: any, b: any) => a.modified.localeCompare(b.modified));
        });
        this.sections.set(sections.sort((a: string, b: string) => a.localeCompare(b)));
        this.graphs.set(graphs);
        this.loading = false;
      });
  }

  graphIsOpen(graphName: string) {
    return this.openedGraphs().includes(graphName);
  }

  toggleShow(graphName: string) {
    if (this.graphIsOpen(graphName)) {
      this.openedGraphs.set(this.openedGraphs().filter(g => g !== graphName));
    } else {
      const openedGraphs = this.openedGraphs();
      openedGraphs.push(graphName);
      this.openedGraphs.set(openedGraphs);
    }
  }

  toggleCloseOpen() {
    if (this.openedGraphs().length > 0) {
      return this.openedGraphs.set([])
    } else {
      const graphsToOpen: Array<string> = []
      Object.values(this.graphs()).forEach(
        (names: any) => names.forEach((name: string) => graphsToOpen.push(name)));
      this.openedGraphs.set(graphsToOpen)
    }
  }
}
