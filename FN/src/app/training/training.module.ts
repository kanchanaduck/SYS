import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '../shared/shared.module';
import { DataTablesModule } from 'angular-datatables';
import { NgSelectModule } from '@ng-select/ng-select';
import { ColorPickerModule } from 'ngx-color-picker';
import { TinymceModule } from 'angular2-tinymce';
import { FormsModule } from '@angular/forms';
import { CustomFormsModule } from 'ngx-custom-validators';
import { FormWizardModule } from 'angular2-wizard';
import { HttpClientModule } from '@angular/common/http';
import { ChartsModule } from 'ng2-charts';

import { TrainingComponent } from './training/training.component';
import { CourseMasterComponent } from './course-master/course-master.component';
import { CourseComponent } from './course/course.component';
import { SurveySettingComponent } from './survey-setting/survey-setting.component';
import { SurveyComponent } from './survey/survey.component';
import { RegisterComponent } from './register/register.component';
import { ApproveMgrComponent } from './approve-mgr/approve-mgr.component';
import { ApproveFinalComponent } from './approve-final/approve-final.component';
import { ConfirmationSheetComponent } from './confirmation-sheet/confirmation-sheet.component';
import { RegisterContinuousComponent } from './register-continuous/register-continuous.component';
import { CourseScoreComponent } from './course-score/course-score.component';
import { StakeholderComponent } from './stakeholder/stakeholder.component';
import { CenterComponent } from './center/center.component';
import { TrainerComponent } from './trainer/trainer.component';
import { TrainerHistoryComponent } from './trainer-history/trainer-history.component';
import { AssessmentFileComponent } from './assessment-file/assessment-file.component';
import { SurveyApproveComponent } from './survey-approve/survey-approve.component';
import { RegisterDataComponent } from './register-data/register-data.component';
import { CourseMasterDataComponent } from './course-master-data/course-master-data.component';

const routes: Routes = [
  { path: '', component: TrainingComponent },
  { path: 'training', component: TrainingComponent, data: { title: 'Training', active: true} },
  { path: 'approve-mgr', component: ApproveMgrComponent, data: { title: 'Approver approve', active: true } },
  { path: 'approve-final', component: ApproveFinalComponent, data: { title: 'Final approve', active: true } },
  { path: 'center', component: CenterComponent, data: { title: 'Center management', active: true } },
  { path: 'course-score', component: CourseScoreComponent, data: { title: 'Input score', active: true } },
  { path: 'course-confirmation-sheet', component: ConfirmationSheetComponent, data: { title: 'Confirmation sheet', active: true } },
  { path: 'course-master', component: CourseMasterComponent, data: { title: 'Master course', active: true } },
  { path: 'course-master-data', component: CourseMasterDataComponent, data: { title: 'Master course data', active: true } },
  { path: 'course-master-data/:course_no', component: CourseMasterDataComponent, data: { title: 'Master course data', active: true } },
  { path: 'course', component: CourseComponent, data: { title: 'Course', active: true } },
  { path: 'trainer', component: TrainerComponent, data: { title: 'Trainer management', active: true} },
  { path: 'trainer-history/:trainer_no', component: TrainerHistoryComponent, data: { title: 'Trainer history', active: true} },
  { path: 'survey-setting', component: SurveySettingComponent, data: { title: 'Need survey setting', active: true } },
  { path: 'survey', component: SurveyComponent, data: { title: 'Need survey answer', active: true } },
  { path: 'survey-detail/:year/:course_owner', component: SurveyApproveComponent, data: { title: 'Need survey detail', active: true } },
  { path: 'register', component: RegisterComponent, data: { title: 'Committee register ', active: true } },
  { path: 'register-continuous', component: RegisterContinuousComponent, data: { title: 'Register continuous employee no.', active: true } },
  { path: 'stakeholder', component: StakeholderComponent, data: { title: 'Stakeholder management', active: true } },
  { path: 'assessment-file', component: AssessmentFileComponent, data: { title: 'Assessment file', active: true } },
  { path: 'register-data/:course_no', component: RegisterDataComponent, data: { title: 'Register data', active: true } },
]
@NgModule({
  declarations: [
    TrainingComponent,
    CourseMasterComponent,
    CourseComponent,
    TrainerComponent,
    SurveySettingComponent,
    SurveyComponent,
    RegisterComponent,
    ApproveMgrComponent,
    ApproveFinalComponent,
    ConfirmationSheetComponent,
    RegisterContinuousComponent,
    CourseScoreComponent,
    StakeholderComponent,
    TrainerHistoryComponent,
    CenterComponent,
    AssessmentFileComponent,
    SurveyApproveComponent,
    RegisterDataComponent,
    CourseMasterDataComponent,
  ],
  imports: [
    CommonModule,
    DataTablesModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    NgbModule,
    NgSelectModule,
    ColorPickerModule,
    TinymceModule,
    FormsModule,
    CustomFormsModule,
    FormWizardModule,
    HttpClientModule,
    ChartsModule
  ],schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ]
})
export class TrainingModule { }
