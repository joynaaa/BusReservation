import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { BusService } from '../../core/services/bus';


@Component({
  selector: 'app-route-stops',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './route-stops.html',

  styleUrl: './route-stops.css'
})


export class RouteStopsComponent implements OnInit {

  // =========================================================
  // ROUTE ID
  // =========================================================

  routeId: number = 0;


  // =========================================================
  // STOPS
  // =========================================================

  stops: any[] = [];


  // =========================================================
  // LOADING
  // =========================================================

  loading: boolean = true;


  // =========================================================
  // ERROR
  // =========================================================

  errorMessage: string = '';


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private route: ActivatedRoute,
    private busService: BusService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    console.log('================================');
    console.log('ROUTE STOPS COMPONENT STARTED');
    console.log('================================');

    console.log(
      'CURRENT URL:',
      window.location.href
    );


    // Get routeId from URL

    const id =
      this.route.snapshot.paramMap.get('routeId');


    console.log(
      'ROUTE ID FROM URL:',
      id
    );


    // =======================================================
    // CHECK ROUTE ID
    // =======================================================

    if (!id) {

      console.error(
        'NO ROUTE ID'
      );

      this.loading = false;

      this.errorMessage =
        'Route ID not found.';

      return;
    }


    // Convert route ID to number

    this.routeId = Number(id);


    console.log(
      'CONVERTED ROUTE ID:',
      this.routeId
    );


    // =======================================================
    // VALIDATE ROUTE ID
    // =======================================================

    if (
      isNaN(this.routeId) ||
      this.routeId <= 0
    ) {

      console.error(
        'INVALID ROUTE ID:',
        this.routeId
      );

      this.loading = false;

      this.errorMessage =
        'Invalid route ID.';

      return;
    }


    // =======================================================
    // LOAD STOPS
    // =======================================================

    this.loadRouteStops();
  }


  // =========================================================
  // LOAD ROUTE STOPS
  // =========================================================

  loadRouteStops(): void {

    console.log('================================');
    console.log('LOADING ROUTE STOPS');
    console.log(
      'ROUTE ID:',
      this.routeId
    );
    console.log('================================');


    this.loading = true;

    this.errorMessage = '';


    this.busService
      .getRouteStops(this.routeId)

      .subscribe({

        // ===================================================
        // SUCCESS
        // ===================================================

        next: (response: any) => {

          console.log(
            'API RESPONSE:',
            response
          );


          console.log(
            'IS ARRAY:',
            Array.isArray(response)
          );


          // =================================================
          // HANDLE API RESPONSE
          // =================================================

          if (Array.isArray(response)) {

            this.stops = response;

          }

          else if (
            response &&
            Array.isArray(response.results)
          ) {

            this.stops = response.results;

          }

          else {

            console.warn(
              'Unexpected API response:',
              response
            );

            this.stops = [];
          }


          // =================================================
          // SORT STOPS BY STOP ORDER
          // =================================================

          this.stops.sort(
            (a: any, b: any) =>
              Number(a.stop_order || 0) -
              Number(b.stop_order || 0)
          );


          // =================================================
          // FINISH LOADING
          // =================================================

          this.loading = false;


          console.log(
            'STOPS AFTER ASSIGNMENT:',
            this.stops
          );


          console.log(
            'STOP COUNT:',
            this.stops.length
          );


          // Force Angular UI update

          this.cdr.detectChanges();
        },


        // ===================================================
        // ERROR
        // ===================================================

        error: (error: any) => {

          console.error(
            'ROUTE STOPS API ERROR:',
            error
          );


          this.loading = false;

          this.stops = [];


          this.errorMessage =
            error?.error?.error ||
            error?.error?.detail ||
            'Unable to load route stops.';


          // Force Angular UI update

          this.cdr.detectChanges();
        }

      });
  }


  // =========================================================
  // BACK
  // =========================================================

  goBack(): void {

    this.router.navigate([
      '/home'
    ]);

  }


  // =========================================================
  // HOME
  // =========================================================

  goHome(): void {

    console.log(
      'Navigating to Home'
    );

    this.router.navigate([
      '/home'
    ]);

  }


  // =========================================================
  // MY BOOKINGS
  // =========================================================

  goToBookings(): void {

    console.log(
      'Navigating to My Bookings'
    );

    this.router.navigate([
      '/my-bookings'
    ]);

  }

}