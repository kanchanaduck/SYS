import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeMatchUsersComponent } from './employee-match-users.component';

describe('EmployeeMatchUsersComponent', () => {
  let component: EmployeeMatchUsersComponent;
  let fixture: ComponentFixture<EmployeeMatchUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeMatchUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeMatchUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
