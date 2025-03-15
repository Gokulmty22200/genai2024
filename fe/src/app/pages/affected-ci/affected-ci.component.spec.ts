import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AffectedCiComponent } from './affected-ci.component';

describe('AffectedCiComponent', () => {
  let component: AffectedCiComponent;
  let fixture: ComponentFixture<AffectedCiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AffectedCiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AffectedCiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
