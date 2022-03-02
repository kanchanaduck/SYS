import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseConfirmationSheetComponent } from './course-confirmation-sheet.component';

describe('CourseConfirmationSheetComponent', () => {
  let component: CourseConfirmationSheetComponent;
  let fixture: ComponentFixture<CourseConfirmationSheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseConfirmationSheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseConfirmationSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
