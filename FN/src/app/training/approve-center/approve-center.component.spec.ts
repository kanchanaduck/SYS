import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveCenterComponent } from './approve-center.component';

describe('ApproveCenterComponent', () => {
  let component: ApproveCenterComponent;
  let fixture: ComponentFixture<ApproveCenterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApproveCenterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
