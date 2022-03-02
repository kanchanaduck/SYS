import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseAndScoreComponent } from './course-and-score.component';

describe('CourseAndScoreComponent', () => {
  let component: CourseAndScoreComponent;
  let fixture: ComponentFixture<CourseAndScoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseAndScoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseAndScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
