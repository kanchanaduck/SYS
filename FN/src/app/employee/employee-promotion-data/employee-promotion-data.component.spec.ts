import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeePromotionDataComponent } from './employee-promotion-data.component';

describe('EmployeePromotionDataComponent', () => {
  let component: EmployeePromotionDataComponent;
  let fixture: ComponentFixture<EmployeePromotionDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeePromotionDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeePromotionDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
