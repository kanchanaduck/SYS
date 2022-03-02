import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseScoreComponent } from './course-score.component';

describe('CourseScoreComponent', () => {
  let component: CourseScoreComponent;
  let fixture: ComponentFixture<CourseScoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseScoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});