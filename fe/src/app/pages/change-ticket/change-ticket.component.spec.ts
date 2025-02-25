import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeTicketComponent } from './change-ticket.component';

describe('ChangeTicketComponent', () => {
  let component: ChangeTicketComponent;
  let fixture: ComponentFixture<ChangeTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeTicketComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
