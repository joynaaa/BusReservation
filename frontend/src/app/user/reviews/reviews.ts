import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { ReviewService } from '../../core/services/review';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './reviews.html',
  styleUrl: './reviews.css'
})
export class ReviewsComponent implements OnInit {

  bookingId!: number;

  rating = 0;
  comment = '';

  loading = false;

  errorMessage = '';
  successMessage = '';

  submittedReview: any = null;

  stars = [1, 2, 3, 4, 5];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reviewService: ReviewService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      this.bookingId = Number(params['booking']);

      console.log('Review Booking ID:', this.bookingId);

    });

  }

  selectRating(star: number): void {

    this.rating = star;

    console.log('Selected Rating:', this.rating);

  }

  submitReview(): void {

    console.log('==============================');
    console.log('SUBMIT REVIEW CLICKED');
    console.log('==============================');

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.bookingId) {

      this.errorMessage =
        'Booking information is missing.';

      return;
    }

    if (this.rating === 0) {

      this.errorMessage =
        'Please select a rating.';

      return;
    }

    if (!this.comment.trim()) {

      this.errorMessage =
        'Please enter your comment.';

      return;
    }

    const reviewData = {

      booking: this.bookingId,

      rating: this.rating,

      comment: this.comment.trim()

    };

    console.log('REVIEW DATA:', reviewData);

    this.loading = true;

    console.log('LOADING BEFORE API:', this.loading);

    this.reviewService
      .createReview(reviewData)
      .pipe(

        // THIS ALWAYS RUNS
        finalize(() => {

          console.log('FINALIZE RUNNING');

          this.loading = false;

          console.log(
            'LOADING AFTER FINALIZE:',
            this.loading
          );

          this.cdr.detectChanges();

        })

      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'REVIEW SUCCESS RESPONSE:',
            response
          );

          this.submittedReview = response;

          this.successMessage =
            'Review submitted successfully!';

          console.log(
            'SUBMITTED REVIEW:',
            this.submittedReview
          );

        },

        error: (error) => {

          console.error(
            'REVIEW API ERROR:',
            error
          );

          this.errorMessage =
            error.error?.error ||
            'Unable to submit review. Please try again.';

          this.cdr.detectChanges();

        },

        complete: () => {

          console.log(
            'REVIEW OBSERVABLE COMPLETED'
          );

        }

      });

  }

  goToBookings(): void {

    this.router.navigate([
      '/my-bookings'
    ]);

  }

  goHome(): void {

    this.router.navigate([
      '/home'
    ]);

  }

}