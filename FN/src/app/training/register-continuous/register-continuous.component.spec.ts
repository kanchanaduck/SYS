import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterContinuousComponent } from './register-continuous.component';

describe('RegisterContinuousComponent', () => {
  let component: RegisterContinuousComponent;
  let fixture: ComponentFixture<RegisterContinuousComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterContinuousComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterContinuousComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
