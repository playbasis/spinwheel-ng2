import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PbSpinwheelComponent } from './pb-spinwheel.component';

describe('PbSpinwheelComponent', () => {
  let component: PbSpinwheelComponent;
  let fixture: ComponentFixture<PbSpinwheelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PbSpinwheelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PbSpinwheelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
