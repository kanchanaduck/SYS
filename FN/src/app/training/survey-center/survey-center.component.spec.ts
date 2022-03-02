import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyCenterComponent } from './survey-center.component';

describe('SurveyCenterComponent', () => {
  let component: SurveyCenterComponent;
  let fixture: ComponentFixture<SurveyCenterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveyCenterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
