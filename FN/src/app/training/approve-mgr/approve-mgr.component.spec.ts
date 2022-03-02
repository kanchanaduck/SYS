import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveMgrComponent } from './approve-mgr.component';

describe('ApproveMgrComponent', () => {
  let component: ApproveMgrComponent;
  let fixture: ComponentFixture<ApproveMgrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApproveMgrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveMgrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
