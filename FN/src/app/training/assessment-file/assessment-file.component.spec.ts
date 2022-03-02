import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentFileComponent } from './assessment-file.component';

describe('AssessmentFileComponent', () => {
  let component: AssessmentFileComponent;
  let fixture: ComponentFixture<AssessmentFileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssessmentFileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
