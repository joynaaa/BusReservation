import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ReviewService } from '../../core/services/review';


@Component({
  selector: 'app-bus-reviews',
  standalone: true,
  imports: [
    CommonModule
  ],
  styleUrl: './bus-reviews.css',
  templateUrl: './bus-reviews.html',
})
export class BusReviewsComponent
  implements OnInit {

  busId!: number;

  reviews: any[] = [];

  loading = true;

  errorMessage = '';

  busName = '';

  busNumber = '';

  stars = [1, 2, 3, 4, 5];


  constructor(
    private route: ActivatedRoute,

    private router: Router,

    private reviewService: ReviewService,

    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      this.busId = Number(
        params.get('busId')
      );

      console.log(
        'BUS ID:',
        this.busId
      );

      this.loadReviews();

    });

  }


  loadReviews(): void {

    this.loading = true;

    this.errorMessage = '';

    this.reviewService
      .getBusReviews(this.busId)
      .subscribe({

        next: (response: any[]) => {

          console.log(
            'BUS REVIEWS:',
            response
          );

          this.reviews = response;

          if (this.reviews.length > 0) {

            this.busName =
              this.reviews[0].bus_name;

            this.busNumber =
              this.reviews[0].bus_number;

          }

          this.loading = false;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'BUS REVIEW ERROR:',
            error
          );

          this.loading = false;

          this.errorMessage =
            'Unable to load bus reviews.';

          this.cdr.detectChanges();

        }

      });

  }


  getAverageRating(): number {

    if (this.reviews.length === 0) {
      return 0;
    }

    const total =
      this.reviews.reduce(
        (sum, review) =>
          sum + Number(review.rating),
        0
      );

    return total / this.reviews.length;

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