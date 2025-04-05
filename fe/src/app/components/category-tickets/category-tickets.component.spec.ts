import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryTicketsComponent } from './category-tickets.component';

describe('CategoryTicketsComponent', () => {
  let component: CategoryTicketsComponent;
  let fixture: ComponentFixture<CategoryTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryTicketsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
