import {
  Component,
  ChangeDetectorRef
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  BusService
} from '../core/services/bus';


@Component({

  selector: 'app-index',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './index.html',

  styleUrl: './index.css'

})
export class IndexComponent {


  // ============================================
  // SEARCH
  // ============================================

  source = '';

  destination = '';

  travelDate = '';

  today = '';


  // ============================================
  // CITIES
  // ============================================

  cities: string[] = [];

  filteredFromCities: string[] = [];

  filteredToCities: string[] = [];

  showFromDropdown = false;

  showToDropdown = false;


  // ============================================
  // BUS RESULTS
  // ============================================

  buses: any[] = [];

  loading = false;

  errorMessage = '';

  searchPerformed = false;


  // ============================================
  // CONSTRUCTOR
  // ============================================

  constructor(

    private busService: BusService,

    private router: Router,

    private cdr: ChangeDetectorRef

  ) {}


  // ============================================
  // INIT
  // ============================================

  ngOnInit(): void {

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


    // Load cities

    this.loadCities();

  }


  // ============================================
  // LOAD CITIES
  // ============================================

  loadCities(): void {

    this.busService
      .getCities()
      .subscribe({

        next: (data: any[]) => {

          this.cities =
            data.map(
              city => city.name
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


  // ============================================
  // FROM INPUT
  // ============================================

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


  // ============================================
  // SELECT FROM CITY
  // ============================================

  selectFromCity(
    city: string
  ): void {

    this.source = city;

    this.filteredFromCities = [];

    this.showFromDropdown = false;

  }


  // ============================================
  // TO INPUT
  // ============================================

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


  // ============================================
  // SELECT TO CITY
  // ============================================

  selectToCity(
    city: string
  ): void {

    this.destination = city;

    this.filteredToCities = [];

    this.showToDropdown = false;

  }


  // ============================================
  // SEARCH BUSES
  // ============================================

  searchBuses(): void {

    console.log(
      'INDEX SEARCH CLICKED'
    );


    this.errorMessage = '';

    this.searchPerformed = false;

    this.showFromDropdown = false;

    this.showToDropdown = false;


    // ==========================================
    // VALIDATION
    // ==========================================

    if (
      !this.source.trim() ||
      !this.destination.trim() ||
      !this.travelDate
    ) {

      this.errorMessage =
        'Please select From, To and Travel Date.';

      return;

    }


    // ==========================================
    // SAME LOCATION
    // ==========================================

    if (
      this.source
        .trim()
        .toLowerCase()
      ===
      this.destination
        .trim()
        .toLowerCase()
    ) {

      this.errorMessage =
        'From and To locations cannot be the same.';

      return;

    }


    // ==========================================
    // START LOADING
    // ==========================================

    this.loading = true;


    // ==========================================
    // API CALL
    // ==========================================

    this.busService
      .searchBuses(

        this.source.trim(),

        this.destination.trim(),

        this.travelDate

      )
      .subscribe({

        // ======================================
        // SUCCESS
        // ======================================

        next: (response: any) => {

          console.log(
            'INDEX SEARCH RESPONSE:',
            response
          );


          this.loading = false;

          this.searchPerformed = true;


          // Backend returns an array

          if (Array.isArray(response)) {

            this.buses = response;

          }

          // Safety if backend returns {results: []}

          else if (
            response &&
            Array.isArray(response.results)
          ) {

            this.buses =
              response.results;

          }

          // Safety if backend returns {buses: []}

          else if (
            response &&
            Array.isArray(response.buses)
          ) {

            this.buses =
              response.buses;

          }

          else {

            this.buses = [];

          }


          console.log(
            'BUSES TO DISPLAY:',
            this.buses
          );


          this.cdr.detectChanges();


          // IMPORTANT:
          // Do NOT navigate to /home.
          //
          // Results stay on Index page.

        },


        // ======================================
        // ERROR
        // ======================================

        error: (error) => {

          console.error(
            'INDEX SEARCH ERROR:',
            error
          );


          this.loading = false;

          this.searchPerformed = true;

          this.buses = [];


          this.errorMessage =
            'Unable to search buses. Please try again.';


          this.cdr.detectChanges();

        }

      });

  }


  // ============================================
  // SELECT BUS / VIEW SEATS
  // ============================================

  selectBus(
    bus: any
  ): void {

    console.log(
      'SELECTED BUS:',
      bus
    );


    /*
      IMPORTANT:

      We are NOT checking login here.

      The user is allowed to open
      the seat layout without login.
    */


    this.router.navigate(
      ['/login'],
      {
        queryParams: {

          bus_id:
            bus.id,

          schedule_id:
            bus.schedule_id,

          from_stop:
            bus.source_stop_id,

          to_stop:
            bus.destination_stop_id,

          travel_date:
            bus.travel_date,

          fare:
            bus.fare

        }

      }

    );

  }

}