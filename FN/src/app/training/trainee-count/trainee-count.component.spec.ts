import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TraineeCountComponent } from './trainee-count.component';

describe('TraineeCountComponent', () => {
  let component: TraineeCountComponent;
  let fixture: ComponentFixture<TraineeCountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TraineeCountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TraineeCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
