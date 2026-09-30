import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllReviewsComponent } from './all-reviews';

describe('AllReviews', () => {
  let component: AllReviewsComponent;
  let fixture: ComponentFixture<AllReviewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllReviewsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AllReviewsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
