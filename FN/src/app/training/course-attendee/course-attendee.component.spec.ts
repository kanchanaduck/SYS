import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseAttendeeComponent } from './course-attendee.component';

describe('CourseAttendeeComponent', () => {
  let component: CourseAttendeeComponent;
  let fixture: ComponentFixture<CourseAttendeeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseAttendeeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseAttendeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
