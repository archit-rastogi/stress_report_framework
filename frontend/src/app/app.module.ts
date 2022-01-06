import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ApiService} from './services/api.service';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {HttpClientModule} from '@angular/common/http';
import {MatIconModule} from '@angular/material/icon';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatCardModule} from '@angular/material/card';
import {RunsComponent} from './pages/runs/runs.component';
import {NavBarComponent} from './nav-bar/nav-bar.component';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatMomentDateModule} from '@angular/material-moment-adapter';
import {CommonModule} from '@angular/common';
import {StressTestComponent} from './pages/stress-test/stress-test.component';
import {StressMetricsComponent} from './pages/stress-test/stress-metrics/stress-metrics.component';
import {StressStepsComponent} from './pages/stress-test/stress-steps/stress-steps.component';
import {StressAttachmentsComponent} from './pages/stress-test/stress-attachments/stress-attachments.component';
import {NgxEchartsModule} from 'ngx-echarts';
import {StressMetricGraphComponent} from './pages/stress-test/stress-metrics/stress-metric-graph/stress-metric-graph.component';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {iconsAppInitializer} from './icons.app-initializer';
import {StressAttachmentItemComponent} from './pages/stress-test/stress-attachments/stress-attachment-item/stress-attachment-item.component';
import {MatChipsModule} from '@angular/material/chips';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {StressTestCardComponent} from './components/stress-test-card/stress-test-card.component';
import {StressReportsComponent} from './pages/stress-reports/stress-reports.component';
import {StressReportComponent} from './pages/stress-report/stress-report.component';
import {CreateReportComponent} from './pages/stress-reports/create-report/create-report.component';
import {EditReportComponent} from './pages/stress-reports/edit-report/edit-report.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {AcceptDialogComponent} from './components/accept-dialog/accept-dialog.component';
import { UniverseConfigsComponent } from './pages/universe-configs/universe-configs.component';
import { UniverseConfigUploadDialogComponent } from './pages/universe-configs/universe-config-upload-dialog/universe-config-upload-dialog.component';
import { StressBuildInfoComponent } from './pages/stress-test/stress-build-info/stress-build-info.component';
import { StressResultsComponent } from './pages/stress-test/stress-results/stress-results.component';
import {AttachmentsSyncService} from './pages/stress-test/stress-attachments/services/attachments.service';
import { EditRunInfoDialogComponent } from './components/edit-run-info-dialog/edit-run-info-dialog.component';
import { ResultTableComponent } from './pages/stress-test/stress-results/result-table/result-table.component';
import { ResultExceptionComponent } from './pages/stress-test/stress-results/result-exception/result-exception.component';
import { ExceptionComponent } from './components/exception/exception.component';
import { AddKnownIssueComponent } from './components/add-known-issue/add-known-issue.component';

@NgModule({
  declarations: [
    AppComponent,
    RunsComponent,
    NavBarComponent,
    StressTestComponent,
    StressMetricsComponent,
    StressStepsComponent,
    StressAttachmentsComponent,
    StressMetricGraphComponent,
    StressAttachmentItemComponent,
    StressTestCardComponent,
    StressReportsComponent,
    CreateReportComponent,
    StressReportComponent,
    EditReportComponent,
    AcceptDialogComponent,
    UniverseConfigsComponent,
    UniverseConfigUploadDialogComponent,
    StressBuildInfoComponent,
    StressResultsComponent,
    EditRunInfoDialogComponent,
    ResultTableComponent,
    ResultExceptionComponent,
    ExceptionComponent,
    AddKnownIssueComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatSnackBarModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    FontAwesomeModule,
    MatIconModule,
    MatMomentDateModule,
    MatDatepickerModule,
    MatButtonToggleModule,
    MatInputModule,
    MatCardModule,
    MatProgressBarModule,
    MatChipsModule,
    MatCheckboxModule,
    NgxEchartsModule.forRoot({echarts: () => import('echarts')}),
  ],
  providers: [
    ApiService,
    AttachmentsSyncService,
    iconsAppInitializer
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
