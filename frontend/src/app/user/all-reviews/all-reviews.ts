import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ReviewService } from '../../core/services/review';


@Component({
  selector: 'app-all-reviews',
  standalone: true,

  imports: [
    CommonModule
  ],
  styleUrl: './all-reviews.css',
  templateUrl: './all-reviews.html',
})
export class AllReviewsComponent
  implements OnInit {

  reviews: any[] = [];

  loading = true;

  errorMessage = '';

  stars = [1, 2, 3, 4, 5];


  constructor(
    private reviewService: ReviewService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {

    console.log(
      'ALL REVIEWS COMPONENT LOADED'
    );

    this.loadReviews();

  }


  loadReviews(): void {

    this.loading = true;

    this.errorMessage = '';


    this.reviewService
      .getReviews()
      .subscribe({

        next: (response: any[]) => {

          console.log(
            'ALL REVIEWS RESPONSE:',
            response
          );

          this.reviews = response;

          this.loading = false;

          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'REVIEWS ERROR:',
            error
          );

          this.loading = false;

          this.errorMessage =
            'Unable to load reviews.';

          this.cdr.detectChanges();

        }

      });

  }


  writeReview(): void {

    this.router.navigate([
      '/my-bookings'
    ]);

  }


  goHome(): void {

    this.router.navigate([
      '/home'
    ]);

  }


  goToBookings(): void {

    this.router.navigate([
      '/my-bookings'
    ]);

  }

}