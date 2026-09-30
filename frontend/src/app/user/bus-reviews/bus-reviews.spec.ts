import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BusReviewsComponent } from './bus-reviews';

describe('BusReviews', () => {
  let component: BusReviewsComponent;
  let fixture: ComponentFixture<BusReviewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusReviewsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BusReviewsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
