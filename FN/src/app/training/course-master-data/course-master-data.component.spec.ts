import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseMasterDataComponent } from './course-master-data.component';

describe('CourseMasterDataComponent', () => {
  let component: CourseMasterDataComponent;
  let fixture: ComponentFixture<CourseMasterDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseMasterDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseMasterDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
