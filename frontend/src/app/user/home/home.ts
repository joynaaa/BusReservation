import {
  Component,
  ChangeDetectorRef
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import {
  Router,
  RouterLink
} from '@angular/router';

import { BusService } from '../../core/services/bus';

import {
  NotificationService
} from '../../core/services/notifications';


@Component({
  selector: 'app-home',

  standalone: true,

  imports: [
    FormsModule,
    CommonModule,
    RouterLink
  ],

  templateUrl: './home.html',

  styleUrl: './home.css'
})
export class HomeComponent {


  // =====================================================
  // SEARCH
  // =====================================================

  source = '';

  destination = '';

  travelDate = '';

  // Prevent selecting a past travel date
  today = '';


  // Buses currently displayed on screen

  buses: any[] = [];


  // Original buses returned from normal search

  allBuses: any[] = [];


  loading = false;

  errorMessage = '';


  // Shows "No matching buses found" only
  // after Apply Filters is clicked

  filterApplied = false;



  // =====================================================
  // FILTERS
  // =====================================================

  // AC / Non-AC / Sleeper / Seater

  selectedBusType = '';


  // Price

  minPrice: number | null = null;

  maxPrice: number | null = null;


  // Departure time

  departureTime = '';


  // Arrival time

  arrivalTime = '';



  // =====================================================
  // CITY LIST
  // =====================================================

  cities: string[] = [];


  // Dropdown lists

  filteredFromCities: string[] = [];

  filteredToCities: string[] = [];


  showFromDropdown = false;

  showToDropdown = false;



  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  unreadCount = 0;



  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private busService: BusService,

    private notificationService:
      NotificationService,

    private router: Router,

    private cdr: ChangeDetectorRef

  ) {}



  // =====================================================
  // ON INIT
  // =====================================================

  ngOnInit(): void {

    // Always start with empty search fields after refresh/navigation
    this.source = '';
    this.destination = '';
    this.travelDate = '';

    // Set today's date for the date picker minimum
    const now = new Date();

    const year =
      now.getFullYear();

    const month =
      String(
        now.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        now.getDate()
      ).padStart(2, '0');

    this.today =
      `${year}-${month}-${day}`;

    this.loadCities();

    this.loadUnreadCount();

  }



  // =====================================================
  // LOAD NOTIFICATION COUNT
  // =====================================================

  loadUnreadCount(): void {

    this.notificationService
      .getUnreadCount()
      .subscribe({

        next: (response: any) => {

          this.unreadCount =
            response.unread_count || 0;

          console.log(
            'Unread notifications:',
            this.unreadCount
          );

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Error loading notification count:',
            error
          );

          this.unreadCount = 0;

        }

      });

  }



  // =====================================================
  // GO TO NOTIFICATIONS
  // =====================================================

  goToNotifications(): void {

    this.router.navigate([
      '/notifications'
    ]);

  }



  // =====================================================
  // LOAD CITIES FROM DATABASE
  // =====================================================

  loadCities(): void {

    this.busService
      .getCities()
      .subscribe({

        next: (data) => {

          this.cities =
            data.map(
              city => city.name
            );

          console.log(
            'Cities loaded from database:',
            this.cities
          );

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Error loading cities:',
            error
          );

        }

      });

  }



  // =====================================================
  // FROM AUTOCOMPLETE
  // =====================================================

  onFromInput(): void {

    const value =
      this.source
        .trim()
        .toLowerCase();


    if (!value) {

      this.filteredFromCities = [];

      this.showFromDropdown = false;

      return;

    }


    this.filteredFromCities =
      this.cities.filter(
        city =>
          city
            .toLowerCase()
            .startsWith(value)
      );


    this.showFromDropdown =
      this.filteredFromCities.length > 0;

  }



  // =====================================================
  // SELECT FROM CITY
  // =====================================================

  selectFromCity(
    city: string
  ): void {

    this.source = city;

    this.filteredFromCities = [];

    this.showFromDropdown = false;

  }



  // =====================================================
  // TO AUTOCOMPLETE
  // =====================================================

  onToInput(): void {

    const value =
      this.destination
        .trim()
        .toLowerCase();


    if (!value) {

      this.filteredToCities = [];

      this.showToDropdown = false;

      return;

    }


    this.filteredToCities =
      this.cities.filter(
        city =>
          city
            .toLowerCase()
            .startsWith(value)
      );


    this.showToDropdown =
      this.filteredToCities.length > 0;

  }



  // =====================================================
  // SELECT TO CITY
  // =====================================================

  selectToCity(
    city: string
  ): void {

    this.destination = city;

    this.filteredToCities = [];

    this.showToDropdown = false;

  }



  // =====================================================
  // DEPARTURE TIME RANGE
  // =====================================================

  getDepartureTimeRange(): any {

    switch (
      this.departureTime
    ) {

      case 'early':

        return {
          from: '00:00',
          to: '06:00'
        };


      case 'morning':

        return {
          from: '06:00',
          to: '12:00'
        };


      case 'afternoon':

        return {
          from: '12:00',
          to: '18:00'
        };


      case 'evening':

        return {
          from: '18:00',
          to: '23:59'
        };


      default:

        return {
          from: '',
          to: ''
        };

    }

  }



  // =====================================================
  // ARRIVAL TIME RANGE
  // =====================================================

  getArrivalTimeRange(): any {

    switch (
      this.arrivalTime
    ) {

      case 'early':

        return {
          from: '00:00',
          to: '06:00'
        };


      case 'morning':

        return {
          from: '06:00',
          to: '12:00'
        };


      case 'afternoon':

        return {
          from: '12:00',
          to: '18:00'
        };


      case 'evening':

        return {
          from: '18:00',
          to: '23:59'
        };


      default:

        return {
          from: '',
          to: ''
        };

    }

  }



  // =====================================================
  // NORMAL SEARCH BUS
  // =====================================================

  searchBuses(): void {

    console.log(
      'SEARCH BUTTON CLICKED'
    );


    // Reset error

    this.errorMessage = '';


    // This is a normal search,
    // so filter message should disappear

    this.filterApplied = false;


    // Hide city dropdowns

    this.showFromDropdown = false;

    this.showToDropdown = false;



    // ===================================================
    // VALIDATION
    // ===================================================

    if (
      !this.source.trim() ||
      !this.destination.trim() ||
      !this.travelDate
    ) {

      this.buses = [];

      this.allBuses = [];

      this.errorMessage =
        'Please select From, To and Travel Date.';

      return;

    }



    // ===================================================
    // SAME LOCATION CHECK
    // ===================================================

    if (
      this.source
        .trim()
        .toLowerCase() ===

      this.destination
        .trim()
        .toLowerCase()
    ) {

      this.buses = [];

      this.allBuses = [];

      this.errorMessage =
        'From and To locations cannot be the same.';

      return;

    }



    // ===================================================
    // START LOADING
    // ===================================================

    this.loading = true;



    // ===================================================
    // CALL BACKEND
    // ===================================================

    this.busService
      .searchBuses(

        this.source,

        this.destination,

        this.travelDate

      )
      .subscribe({

        // =================================================
        // SUCCESS
        // =================================================

        next: (response: any) => {

          console.log(
            'API RESPONSE:',
            response
          );


          // -------------------------------------------------
          // SUPPORT ARRAY OR PAGINATED RESPONSE
          // -------------------------------------------------

          const result =
            Array.isArray(response)

              ? response

              : Array.isArray(
                  response?.results
                )

                ? response.results

                : [];


          // Store original search results

          this.allBuses =
            [...result];


          // Display search results

          this.buses =
            [...result];


          this.loading = false;


          console.log(
            'Buses assigned:',
            this.buses
          );


          this.cdr.detectChanges();

        },


        // =================================================
        // ERROR
        // =================================================

        error: (error) => {

          console.error(
            'API ERROR:',
            error
          );


          this.loading = false;


          this.buses = [];

          this.allBuses = [];


          this.errorMessage =
            'Unable to search buses. Please try again.';


          this.cdr.detectChanges();

        },


        // =================================================
        // COMPLETE
        // =================================================

        complete: () => {

          console.log(
            'API REQUEST COMPLETED'
          );

        }

      });

  }



  // =====================================================
  // APPLY FILTERS
  // =====================================================

  applyFilters(): void {

    console.log(
      'APPLY FILTERS CLICKED'
    );


    // Mark that user has actually applied filters

    this.filterApplied = true;


    // Start from original search results

    let filtered =
      [...this.allBuses];



    // =====================================================
    // BUS TYPE FILTER
    // =====================================================

    if (this.selectedBusType) {

      filtered =
        filtered.filter(
          bus => {

            const busType =
              String(
                bus.bus_type || ''
              )
                .trim()
                .toUpperCase();


            const selectedType =
              String(
                this.selectedBusType
              )
                .trim()
                .toUpperCase();


            return (
              busType ===
              selectedType
            );

          }
        );

    }



    // =====================================================
    // MINIMUM PRICE FILTER
    // =====================================================

    if (
      this.minPrice !== null &&
      this.minPrice !== undefined
    ) {

      filtered =
        filtered.filter(
          bus => {

            const fare =
              Number(
                bus.fare
              );


            return (

              !isNaN(fare) &&

              fare >=
              Number(
                this.minPrice
              )

            );

          }
        );

    }



    // =====================================================
    // MAXIMUM PRICE FILTER
    // =====================================================

    if (
      this.maxPrice !== null &&
      this.maxPrice !== undefined
    ) {

      filtered =
        filtered.filter(
          bus => {

            const fare =
              Number(
                bus.fare
              );


            return (

              !isNaN(fare) &&

              fare <=
              Number(
                this.maxPrice
              )

            );

          }
        );

    }



    // =====================================================
    // DEPARTURE TIME FILTER
    // =====================================================

    const departureRange =
      this.getDepartureTimeRange();


    if (
      departureRange.from &&
      departureRange.to
    ) {

      filtered =
        filtered.filter(
          bus => {

            return this.isTimeInRange(

              bus.departure_time,

              departureRange.from,

              departureRange.to

            );

          }
        );

    }



    // =====================================================
    // ARRIVAL TIME FILTER
    // =====================================================

    const arrivalRange =
      this.getArrivalTimeRange();


    if (
      arrivalRange.from &&
      arrivalRange.to
    ) {

      filtered =
        filtered.filter(
          bus => {

            return this.isTimeInRange(

              bus.arrival_time,

              arrivalRange.from,

              arrivalRange.to

            );

          }
        );

    }



    // =====================================================
    // DISPLAY FILTERED RESULTS
    // =====================================================

    this.buses = filtered;


    console.log(
      'Filtered buses:',
      this.buses
    );



    // =====================================================
    // NO MATCHING BUS MESSAGE
    // =====================================================

    if (
      this.buses.length === 0
    ) {

      console.log(
        'No buses match selected filters.'
      );

    }


    this.cdr.detectChanges();

  }



  // =====================================================
  // CHECK TIME RANGE
  // =====================================================

  isTimeInRange(

    time: string,

    from: string,

    to: string

  ): boolean {

    if (!time) {

      return false;

    }


    const busMinutes =
      this.timeToMinutes(
        time
      );


    const fromMinutes =
      this.timeToMinutes(
        from
      );


    const toMinutes =
      this.timeToMinutes(
        to
      );


    if (
      busMinutes < 0 ||
      fromMinutes < 0 ||
      toMinutes < 0
    ) {

      return false;

    }


    return (

      busMinutes >=
      fromMinutes &&

      busMinutes <
      toMinutes

    );

  }



  // =====================================================
  // CONVERT TIME TO MINUTES
  // =====================================================

  timeToMinutes(

    time: string

  ): number {

    if (!time) {

      return -1;

    }


    /*
      Handles:

      06:30
      06:30:00
      18:45
      18:45:00
    */

    const parts =
      time.split(':');


    if (
      parts.length < 2
    ) {

      return -1;

    }


    const hours =
      Number(
        parts[0]
      );


    const minutes =
      Number(
        parts[1]
      );


    if (
      isNaN(hours) ||
      isNaN(minutes)
    ) {

      return -1;

    }


    return (

      hours * 60 +

      minutes

    );

  }



  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  clearFilters(): void {

    console.log(
      'CLEAR FILTERS'
    );


    // Reset bus type

    this.selectedBusType = '';


    // Reset price

    this.minPrice = null;

    this.maxPrice = null;


    // Reset departure

    this.departureTime = '';


    // Reset arrival

    this.arrivalTime = '';


    // Hide "No matching buses found"

    this.filterApplied = false;


    // Restore original search results

    this.buses = [

      ...this.allBuses

    ];


    this.cdr.detectChanges();

  }



  // =====================================================
  // LOGOUT
  // =====================================================

  logout(): void {

    localStorage.removeItem(
      'access'
    );


    localStorage.removeItem(
      'refresh'
    );


    this.router.navigate([
      '/'
    ]);

  }



  // =====================================================
  // VIEW ROUTE STOPS
  // =====================================================

  viewStops(
    routeId: number
  ): void {

    if (!routeId) {

      alert(
        'Route information is not available.'
      );

      return;

    }


    this.router.navigate([

      '/route-stops',

      routeId

    ]);

  }


}