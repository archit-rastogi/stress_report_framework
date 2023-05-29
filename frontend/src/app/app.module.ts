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
import {CreateReportDialogComponent} from './pages/stress-reports/create-report-dialog/create-report-dialog.component';
import {EditReportComponent} from './pages/stress-reports/edit-report/edit-report.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {AcceptDialogComponent} from './components/accept-dialog/accept-dialog.component';
import { StressBuildInfoComponent } from './pages/stress-test/stress-build-info/stress-build-info.component';
import { StressResultsComponent } from './pages/stress-test/stress-results/stress-results.component';
import {AttachmentsSyncService} from './pages/stress-test/stress-attachments/services/attachments.service';
import { EditRunInfoDialogComponent } from './components/edit-run-info-dialog/edit-run-info-dialog.component';
import { ResultTableComponent } from './pages/stress-test/stress-results/result-table/result-table.component';
import { ResultExceptionComponent } from './pages/stress-test/stress-results/result-exception/result-exception.component';
import { ExceptionComponent } from './components/exception/exception.component';
import { AddKnownIssueDialogComponent } from './components/add-known-issue-dialog/add-known-issue-dialog.component';
import { PagesHitmapComponent } from './pages/stress-report/pages-hitmap/pages-hitmap.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ActionsService} from './services/actions.service';
import {MatTabsModule} from '@angular/material/tabs';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {ScrollingModule} from '@angular/cdk/scrolling';
import { StressHistoryComponent } from './pages/stress-test/stress-history/stress-history.component';
import {MatSelectModule} from '@angular/material/select';
import { PagesTotalStatisticsComponent } from './pages/stress-report/pages-total-statistics/pages-total-statistics.component';
import { PageFlakyTestsComponent } from './pages/stress-report/page-flaky-tests/page-flaky-tests.component';
import { PagesUniqueKnownIssuesComponent } from './pages/stress-report/pages-unique-known-issues/pages-unique-known-issues.component';
import { AddCommentDialogComponent } from './components/add-comment-dialog/add-comment-dialog.component';
import { ActionsBarComponent } from './components/actions-bar/actions-bar.component';

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
    CreateReportDialogComponent,
    StressReportComponent,
    EditReportComponent,
    AcceptDialogComponent,
    StressBuildInfoComponent,
    StressResultsComponent,
    EditRunInfoDialogComponent,
    ResultTableComponent,
    ResultExceptionComponent,
    ExceptionComponent,
    AddKnownIssueDialogComponent,
    PagesHitmapComponent,
    StressHistoryComponent,
    PagesTotalStatisticsComponent,
    PageFlakyTestsComponent,
    PagesUniqueKnownIssuesComponent,
    AddCommentDialogComponent,
    ActionsBarComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatSnackBarModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatTabsModule,
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
    MatTooltipModule,
    MatAutocompleteModule,
    MatSelectModule,
    ScrollingModule,
    NgxEchartsModule.forRoot({echarts: () => import('echarts')}),
  ],
  providers: [
    ApiService,
    AttachmentsSyncService,
    ActionsService,
    iconsAppInitializer
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
