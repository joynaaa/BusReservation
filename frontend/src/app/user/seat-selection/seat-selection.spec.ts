import { ComponentFixture, TestBed } from '@angular/core/testing';
import {  SeatSelectionComponent } from './seat-selection';

describe('SeatSelectionComponent', () => {
  let component: SeatSelectionComponent;
  let fixture: ComponentFixture<SeatSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeatSelectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SeatSelectionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
