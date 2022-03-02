import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDeptDataComponent } from './employee-dept-data.component';

describe('EmployeeDeptDataComponent', () => {
  let component: EmployeeDeptDataComponent;
  let fixture: ComponentFixture<EmployeeDeptDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeDeptDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeDeptDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
