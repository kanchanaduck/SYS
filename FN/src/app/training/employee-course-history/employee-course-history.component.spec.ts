import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeCourseHistoryComponent } from './employee-course-history.component';

describe('EmployeeCourseHistoryComponent', () => {
  let component: EmployeeCourseHistoryComponent;
  let fixture: ComponentFixture<EmployeeCourseHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeCourseHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeCourseHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
