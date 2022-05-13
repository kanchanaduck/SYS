import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseCourseComponent } from './close-course.component';

describe('CloseCourseComponent', () => {
  let component: CloseCourseComponent;
  let fixture: ComponentFixture<CloseCourseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CloseCourseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
