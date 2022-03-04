import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveySettingComponent } from './survey-setting.component';

describe('SurveySettingComponent', () => {
  let component: SurveySettingComponent;
  let fixture: ComponentFixture<SurveySettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveySettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveySettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
