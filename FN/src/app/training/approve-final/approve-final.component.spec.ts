import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveFinalComponent } from './approve-final.component';

describe('ApproveFinalComponent', () => {
  let component: ApproveFinalComponent;
  let fixture: ComponentFixture<ApproveFinalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApproveFinalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveFinalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
