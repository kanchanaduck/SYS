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
import { CourseOpenComponent } from './course-open/course-open.component';
import { SurveyCenterComponent } from './survey-center/survey-center.component';
import { SurveyComponent } from './survey/survey.component';
import { CourseTargetComponent } from './course-target/course-target.component';
import { RegisterComponent } from './register/register.component';
import { ApproveMgrComponent } from './approve-mgr/approve-mgr.component';
import { ApproveCenterComponent } from './approve-center/approve-center.component';
import { CourseConfirmationSheetComponent } from './course-confirmation-sheet/course-confirmation-sheet.component';
import { RegisterContinuousComponent } from './register-continuous/register-continuous.component';
import { CourseSignatureSheetComponent } from './course-signature-sheet/course-signature-sheet.component';
import { CourseScoreComponent } from './course-score/course-score.component';
import { TraineeCountComponent } from './trainee-count/trainee-count.component';
import { CourseAndScoreComponent } from './course-and-score/course-and-score.component';
import { CourseMapComponent } from './course-map/course-map.component';
import { EmployeeCourseHistoryComponent } from './employee-course-history/employee-course-history.component';
import { CourseHistoryComponent } from './course-history/course-history.component';
import { StakeholderComponent } from './stakeholder/stakeholder.component';
import { CenterComponent } from './center/center.component';
import { DialogCourseComponent } from './dialog-course/dialog-course.component';
import { TrainerComponent } from './trainer/trainer.component';
import { TrainerHistoryComponent } from './trainer-history/trainer-history.component';
import { AssessmentFileComponent } from './assessment-file/assessment-file.component';

const routes: Routes = [
  { path: '', component: TrainingComponent },
  { path: 'training', component: TrainingComponent, data: { title: 'Training', active: true} },
  { path: 'approve-mgr', component: ApproveMgrComponent, data: { title: 'Manager approve trainee', active: true } },
  { path: 'approve-center', component: ApproveCenterComponent, data: { title: 'Center approve trainee', active: true } },
  { path: 'center', component: CenterComponent, data: { title: 'Center management', active: true } },
  { path: 'course-score', component: CourseScoreComponent, data: { title: 'Input score', active: true } },
  { path: 'course-confirmation-sheet', component: CourseConfirmationSheetComponent, data: { title: 'Confirmation sheet', active: true } },
  { path: 'course-master', component: CourseMasterComponent, data: { title: 'Master course control', active: true } },
  { path: 'course-open', component: CourseOpenComponent, data: { title: 'Open course', active: true } },
  { path: 'course-map', component: CourseMapComponent, data: { title: 'Course map', active: true } },
  { path: 'course-signature-sheet', component: CourseSignatureSheetComponent, data: { title: 'Signature sheet', active: true } },
  { path: 'trainer', component: TrainerComponent, data: { title: 'Trainer management', active: true} },
  { path: 'trainer-history/:trainer_no', component: TrainerHistoryComponent, data: { title: 'Trainer history', active: true} },
  { path: 'survey-center', component: SurveyCenterComponent, data: { title: 'Need survey for center', active: true } },
  { path: 'survey', component: SurveyComponent, data: { title: 'Need survey for committee', active: true } },
  { path: 'course-target', component: CourseTargetComponent, data: { title: 'Target group of course', active: true } },
  { path: 'register', component: RegisterComponent, data: { title: 'Committee register trainee ', active: true } },
  { path: 'register-continuous', component: RegisterContinuousComponent, data: { title: 'Register continuous employee no.', active: true } },
  { path: 'trainee-count', component: TraineeCountComponent, data: { title: 'Count trainee of course', active: true } },
  { path: 'course-and-score', component: CourseAndScoreComponent, data: { title: 'Course and trainees score', active: true } },
  { path: 'employee-course-history', component: EmployeeCourseHistoryComponent, data: { title: 'Employee training history', active: true } },
  { path: 'course-history', component: CourseHistoryComponent, data: { title: 'Course attendee', active: true } },
  { path: 'course-history', component: CourseHistoryComponent, data: { title: 'Course attendee', active: true } },
  { path: 'stakeholder', component: StakeholderComponent, data: { title: 'Stakeholder management', active: true } },
  { path: 'accessment-file', component: AssessmentFileComponent, data: { title: 'Assessment file', active: true } },
]
@NgModule({
  declarations: [
    TrainingComponent,
    CourseMasterComponent,
    CourseOpenComponent,
    TrainerComponent,
    SurveyCenterComponent,
    SurveyComponent,
    CourseTargetComponent,
    RegisterComponent,
    ApproveMgrComponent,
    ApproveCenterComponent,
    CourseConfirmationSheetComponent,
    RegisterContinuousComponent,
    CourseSignatureSheetComponent,
    CourseScoreComponent,
    TraineeCountComponent,
    CourseAndScoreComponent,
    CourseMapComponent,
    EmployeeCourseHistoryComponent,
    CourseHistoryComponent,
    StakeholderComponent,
    DialogCourseComponent,
    TrainerHistoryComponent,
    CenterComponent,
    AssessmentFileComponent
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
