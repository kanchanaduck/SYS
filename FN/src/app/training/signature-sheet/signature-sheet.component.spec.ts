import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignatureSheetComponent } from './signature-sheet.component';

describe('SignatureSheetComponent', () => {
  let component: SignatureSheetComponent;
  let fixture: ComponentFixture<SignatureSheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignatureSheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignatureSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
