import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerHistoryComponent } from './trainer-history.component';

describe('TrainerHistoryComponent', () => {
  let component: TrainerHistoryComponent;
  let fixture: ComponentFixture<TrainerHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrainerHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainerHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
