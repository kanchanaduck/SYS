import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeEducationDataComponent } from './employee-education-data.component';

describe('EmployeeEducationDataComponent', () => {
  let component: EmployeeEducationDataComponent;
  let fixture: ComponentFixture<EmployeeEducationDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeEducationDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeEducationDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
