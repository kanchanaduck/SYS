import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseOpenComponent } from './course-open.component';

describe('CourseOpenComponent', () => {
  let component: CourseOpenComponent;
  let fixture: ComponentFixture<CourseOpenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseOpenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseOpenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
