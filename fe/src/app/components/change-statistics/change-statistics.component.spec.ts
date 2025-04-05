import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeStatisticsComponent } from './change-statistics.component';

describe('ChangeStatisticsComponent', () => {
  let component: ChangeStatisticsComponent;
  let fixture: ComponentFixture<ChangeStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeStatisticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
