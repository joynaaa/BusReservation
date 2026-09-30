import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../core/services/auth';
import { BusService } from '../../core/services/bus';

@Component({
  selector: 'app-manage-stops',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './manage-stops.html',

  styleUrl: './manage-stops.css'
})
export class ManageStopsComponent implements OnInit {

  // =====================================================
  // ROUTE
  // =====================================================

  routeId!: number;

  routeName: string = '';


  // =====================================================
  // STOPS
  // =====================================================

  stops: any[] = [];


  // =====================================================
  // ADMIN CITIES
  // =====================================================

  cities: any[] = [];


  // =====================================================
  // FORM
  // =====================================================

  showForm: boolean = false;

  editingStopId: number | null = null;

  loading: boolean = false;

  loadingCities: boolean = false;

  saving: boolean = false;


  // =====================================================
  // ERROR
  // =====================================================

  errorMessage: string = '';


  // =====================================================
  // STOP FORM
  // =====================================================

  stop = {

    stop_name: '',

    stop_order: 1,

    arrival_time: '',

    departure_time: '',

    is_boarding_point: true,

    is_dropping_point: true

  };


  constructor(
    private authService: AuthService,
      private busService: BusService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.routeId = Number(
      this.route.snapshot.paramMap.get('routeId')
    );


    if (!this.routeId) {

      alert('Invalid route.');

      this.router.navigate([
        '/operator/routes'
      ]);

      return;

    }


    // Load both cities and stops

    this.loadCities();

    this.loadStops();

  }


  // =====================================================
  // LOAD ADMIN CITIES
  // =====================================================
loadCities(): void {
  this.loadingCities = true;

  this.busService.getCities().subscribe({
    next: (data: any[]) => {
      this.cities = Array.isArray(data) ? [...data] : [];
      this.loadingCities = false;
      this.cdr.detectChanges();

      console.log('Cities loaded:', this.cities);
    },

    error: (error) => {
      console.error('Unable to load cities:', error);

      this.cities = [];
      this.loadingCities = false;
      this.errorMessage =
        error.error?.error ||
        error.error?.detail ||
        'Unable to load cities.';

      this.cdr.detectChanges();
    }
  });
}
  // =====================================================
  // LOAD STOPS
  // =====================================================

  loadStops(): void {

    this.loading = true;

    this.errorMessage = '';


    this.authService
      .getOperatorRouteStops(
        this.routeId
      )
      .subscribe({

        next: (data: any) => {

          console.log(
            'Route stops:',
            data
          );


          if (Array.isArray(data)) {

            this.stops = [...data];

          }

          else if (
            data &&
            Array.isArray(data.results)
          ) {

            this.stops = [
              ...data.results
            ];

          }

          else {

            this.stops = [];

          }


          this.loading = false;

          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'Error loading stops:',
            error
          );


          this.stops = [];

          this.loading = false;


          alert(
            'Failed to load route stops.'
          );

          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // OPEN ADD FORM
  // =====================================================

openAddForm(): void {

  this.editingStopId = null;

  this.stop = {

    stop_name: '',

    stop_order:
      this.stops.length + 1,

    arrival_time: '',

    departure_time: '',

    is_boarding_point: true,

    is_dropping_point: true

  };

  this.errorMessage = '';

  this.showForm = true;

}


  // =====================================================
  // SAVE STOP
  // =====================================================

  // =====================================================
// SAVE / UPDATE STOP
// =====================================================

saveStop(): void {

  // ===================================================
  // STOP NAME
  // ===================================================

  if (!this.stop.stop_name) {

    alert(
      'Please select a stop name.'
    );

    return;

  }


  // ===================================================
  // STOP ORDER
  // ===================================================

  if (
    !this.stop.stop_order ||
    this.stop.stop_order < 1
  ) {

    alert(
      'Please enter a valid stop order.'
    );

    return;

  }


  // ===================================================
  // TIME VALIDATION
  // ===================================================

  if (
    this.stop.arrival_time &&
    this.stop.departure_time &&
    this.stop.departure_time <
    this.stop.arrival_time
  ) {

    alert(
      'Departure time cannot be earlier than arrival time.'
    );

    return;

  }


  // ===================================================
  // CITY CHECK
  // ===================================================

  if (this.cities.length === 0) {

    alert(
      'No cities are available. Please ask the admin to add cities first.'
    );

    return;

  }


  // ===================================================
  // REQUEST DATA
  // ===================================================

  const data = {

    stop_name:
      this.stop.stop_name,

    stop_order:
      Number(this.stop.stop_order),

    arrival_time:
      this.stop.arrival_time || null,

    departure_time:
      this.stop.departure_time || null,

    is_boarding_point:
      this.stop.is_boarding_point,

    is_dropping_point:
      this.stop.is_dropping_point

  };


  console.log(
    'STOP REQUEST:',
    data
  );


  this.saving = true;

  this.errorMessage = '';


  // ===================================================
  // UPDATE EXISTING STOP
  // ===================================================

  if (this.editingStopId !== null) {

    console.log(
      'UPDATING STOP:',
      this.editingStopId
    );


    this.authService
      .updateOperatorRouteStop(
        this.routeId,
        this.editingStopId,
        data
      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'STOP UPDATE SUCCESS:',
            response
          );


          alert(
            response?.message ||
            'Stop updated successfully.'
          );


          this.saving = false;

          this.showForm = false;

          this.editingStopId = null;


          this.loadStops();

        },


        error: (error: any) => {

          console.error(
            'STOP UPDATE ERROR:',
            error
          );


          this.saving = false;


          alert(
            error?.error?.error ||
            error?.error?.detail ||
            'Failed to update stop.'
          );


          this.cdr.detectChanges();

        }

      });

    return;

  }


  // ===================================================
  // ADD NEW STOP
  // ===================================================

  console.log(
    'ADDING NEW STOP'
  );


  this.authService
    .addOperatorRouteStop(
      this.routeId,
      data
    )
    .subscribe({

      next: (response: any) => {

        console.log(
          'STOP ADD SUCCESS:',
          response
        );


        alert(
          response?.message ||
          'Stop added successfully.'
        );


        this.saving = false;

        this.showForm = false;

        this.editingStopId = null;


        this.loadStops();

      },


      error: (error: any) => {

        console.error(
          'STOP ADD ERROR:',
          error
        );


        this.saving = false;


        if (
          error?.error?.stop_order
        ) {

          alert(
            'This stop order already exists.'
          );

        }

        else {

          alert(
            error?.error?.error ||
            error?.error?.detail ||
            'Failed to add stop.'
          );

        }


        this.cdr.detectChanges();

      }

    });

}
// =====================================================
// EDIT STOP
// =====================================================

editStop(item: any): void {

  console.log(
    'Editing stop:',
    item
  );

  this.editingStopId =
    Number(item.id);

  this.stop = {

    stop_name:
      item.stop_name || '',

    stop_order:
      Number(item.stop_order) || 1,

    arrival_time:
      item.arrival_time || '',

    departure_time:
      item.departure_time || '',

    is_boarding_point:
      item.is_boarding_point !== false,

    is_dropping_point:
      item.is_dropping_point !== false

  };

  this.errorMessage = '';

  this.showForm = true;

  this.cdr.detectChanges();

}
  // =====================================================
  // DELETE STOP
  // =====================================================

  // =====================================================
// DELETE STOP
// =====================================================

deleteStop(id: number): void {

  const confirmDelete =
    confirm(
      'Are you sure you want to delete this stop?'
    );


  if (!confirmDelete) {

    return;

  }


  console.log(
    'DELETING STOP:',
    id
  );


  this.authService
    .deleteOperatorRouteStop(
      this.routeId,
      Number(id)
    )
    .subscribe({

      next: (response: any) => {

        console.log(
          'STOP DELETE SUCCESS:',
          response
        );


        alert(
          response?.message ||
          'Stop deleted successfully.'
        );


        this.loadStops();

      },


      error: (error: any) => {

        console.error(
          'STOP DELETE ERROR:',
          error
        );


        alert(
          error?.error?.error ||
          error?.error?.detail ||
          'Failed to delete stop.'
        );


        this.cdr.detectChanges();

      }

    });

}

  // =====================================================
  // CANCEL
  // =====================================================

  cancelForm(): void {

    this.showForm = false;
  this.editingStopId = null;
    this.errorMessage = '';

  }


  // =====================================================
  // BACK
  // =====================================================

  goBack(): void {

    this.router.navigate([
      '/operator/routes'
    ]);

  }

}