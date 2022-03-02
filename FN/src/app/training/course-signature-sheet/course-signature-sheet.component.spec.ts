import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseSignatureSheetComponent } from './course-signature-sheet.component';

describe('CourseSignatureSheetComponent', () => {
  let component: CourseSignatureSheetComponent;
  let fixture: ComponentFixture<CourseSignatureSheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseSignatureSheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseSignatureSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
