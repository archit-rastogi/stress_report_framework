import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {RunsComponent} from './pages/runs/runs.component';
import {StressTestComponent} from './pages/stress-test/stress-test.component';
import {StressReportsComponent} from './pages/stress-reports/stress-reports.component';
import {StressReportComponent} from './pages/stress-report/stress-report.component';
import {UniverseConfigsComponent} from './pages/universe-configs/universe-configs.component';

const routes: Routes = [
  {
    path: 'runs',
    component: RunsComponent
  },
  {
    path: 'stress_test/:id',
    component: StressTestComponent
  },
  {
    path: 'stress_reports',
    component: StressReportsComponent
  },
  {
    path: 'stress_report/:id',
    component: StressReportComponent
  },
  {
    path: 'universe_configs',
    component: UniverseConfigsComponent
  },
  {
    path: '**',
    redirectTo: 'runs'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
