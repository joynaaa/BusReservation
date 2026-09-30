import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-routes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './routes.html',
  styleUrl: './routes.css'
})
export class RoutesComponent implements OnInit {

  // =========================================================
  // DATA
  // =========================================================

  routes: any[] = [];

  cities: any[] = [];

  stops: any[] = [];


  // =========================================================
  // LOADING / SAVING
  // =========================================================

  loading = true;

  loadingCities = false;

  loadingStops = false;

  saving = false;

  savingStop = false;


  // =========================================================
  // ROUTE FORM STATE
  // =========================================================

  showForm = false;

  editing = false;

  editingRouteId: number | null = null;


  // =========================================================
  // ROUTE FORM
  // =========================================================

  routeForm = {

    source: '',

    destination: '',

    distance: 0,

    duration: ''

  };


  // =========================================================
  // STOP FORM
  // =========================================================

  stopForm = {

    stop_name: '',

    stop_order: 1,

    arrival_time: '',

    departure_time: '',

    is_boarding_point: true,

    is_dropping_point: true

  };


  // =========================================================
  // ROUTE VALIDATION ERRORS
  // =========================================================

  sourceError = '';

  destinationError = '';

  distanceError = '';

  durationError = '';


  // =========================================================
  // STOP VALIDATION ERRORS
  // =========================================================

  stopNameError = '';

  stopOrderError = '';

  stopTimeError = '';


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
     private router: Router
  ) {}


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.loadRoutes();

    this.loadCities();

  }
goToDashboard(): void {
  this.router.navigate(['/admin/dashboard']);
}

  // =========================================================
  // LOAD ROUTES
  // =========================================================

  loadRoutes(): void {

    this.loading = true;

    this.authService.getAdminRoutes().subscribe({

      next: (response: any[]) => {

        console.log(
          'ADMIN ROUTES:',
          response
        );

        this.routes = response;

        this.loading = false;

        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error(
          'ROUTE LOAD ERROR:',
          error
        );

        this.loading = false;

        this.cdr.detectChanges();

        alert(
          error?.error?.detail ||
          error?.error?.error ||
          'Unable to load routes.'
        );

      }

    });

  }


  // =========================================================
  // LOAD CITIES
  // =========================================================

  loadCities(): void {

    this.loadingCities = true;

    this.http
      .get<any[]>(
        'http://127.0.0.1:8000/api/buses/cities/'
      )
      .subscribe({

        next: (response: any[]) => {

          console.log(
            'CITIES:',
            response
          );

          this.cities = response;

          this.loadingCities = false;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'CITY LOAD ERROR:',
            error
          );

          this.loadingCities = false;

          alert(
            'Unable to load cities.'
          );

        }

      });

  }


  // =========================================================
  // ADD ROUTE
  // =========================================================

  addRoute(): void {

    this.editing = false;

    this.editingRouteId = null;

    this.saving = false;

    this.stops = [];

    this.clearValidation();

    this.clearStopValidation();

    this.resetRouteForm();

    this.resetStopForm();

    this.showForm = true;

  }


  // =========================================================
  // EDIT ROUTE
  // =========================================================

  editRoute(route: any): void {

    this.editing = true;

    this.editingRouteId = route.id;

    this.saving = false;

    this.clearValidation();

    this.clearStopValidation();

    this.routeForm = {

      source: route.source || '',

      destination: route.destination || '',

      distance: Number(route.distance) || 0,

      duration: route.duration || ''

    };

    this.resetStopForm();

    this.showForm = true;

    this.loadStops(route.id);

  }


  // =========================================================
  // SOURCE VALIDATION
  // =========================================================

  validateSource(): boolean {

    const source =
      this.routeForm.source.trim();


    if (!source) {

      this.sourceError =
        'Please select a source city.';

      return false;

    }


    this.sourceError = '';

    this.validateSameCities();

    return true;

  }


  // =========================================================
  // DESTINATION VALIDATION
  // =========================================================

  validateDestination(): boolean {

    const destination =
      this.routeForm.destination.trim();


    if (!destination) {

      this.destinationError =
        'Please select a destination city.';

      return false;

    }


    this.destinationError = '';

    this.validateSameCities();

    return true;

  }


  // =========================================================
  // SOURCE / DESTINATION SAME VALIDATION
  // =========================================================

  validateSameCities(): boolean {

    const source =
      this.routeForm.source
        .trim()
        .toLowerCase();

    const destination =
      this.routeForm.destination
        .trim()
        .toLowerCase();


    if (
      source &&
      destination &&
      source === destination
    ) {

      this.destinationError =
        'Source and destination cannot be the same.';

      return false;

    }


    if (
      this.destinationError ===
      'Source and destination cannot be the same.'
    ) {

      this.destinationError = '';

    }


    return true;

  }


  // =========================================================
  // DISTANCE VALIDATION
  // =========================================================

  validateDistance(): boolean {

    const distance =
      Number(this.routeForm.distance);


    if (
      this.routeForm.distance === null ||
      this.routeForm.distance === undefined ||
      Number.isNaN(distance)
    ) {

      this.distanceError =
        'Distance is required.';

      return false;

    }


    if (!Number.isFinite(distance)) {

      this.distanceError =
        'Please enter a valid distance.';

      return false;

    }


    if (distance <= 0) {

      this.distanceError =
        'Distance must be greater than 0 KM.';

      return false;

    }


    if (distance > 5000) {

      this.distanceError =
        'Distance cannot exceed 5000 KM.';

      return false;

    }


    this.routeForm.distance = distance;

    this.distanceError = '';

    return true;

  }


  // =========================================================
  // DURATION VALIDATION
  // =========================================================

  validateDuration(): boolean {

    const duration =
      this.routeForm.duration.trim();


    this.routeForm.duration =
      duration;


    if (!duration) {

      this.durationError =
        'Duration is required.';

      return false;

    }


    if (duration.length < 2) {

      this.durationError =
        'Please enter a valid duration.';

      return false;

    }


    if (duration.length > 50) {

      this.durationError =
        'Duration cannot exceed 50 characters.';

      return false;

    }


    const durationPattern =
      /^(?=.*\d)(?=.*(?:hour|hours|hr|hrs|h|minute|minutes|min|mins|m))[\d\s]+(?:hours?|hrs?|h|minutes?|mins?|m)(?:\s*[\d]+(?:minutes?|mins?|m))?$/i;


    if (!durationPattern.test(duration)) {

      this.durationError =
        'Enter duration like 2 hours, 2h 30m, or 45 minutes.';

      return false;

    }


    this.durationError = '';

    return true;

  }


  // =========================================================
  // COMPLETE ROUTE VALIDATION
  // =========================================================

  validateForm(): boolean {

    const sourceValid =
      this.validateSource();


    const destinationValid =
      this.validateDestination();


    const sameCityValid =
      this.validateSameCities();


    const distanceValid =
      this.validateDistance();


    const durationValid =
      this.validateDuration();


    return (

      sourceValid &&

      destinationValid &&

      sameCityValid &&

      distanceValid &&

      durationValid

    );

  }


  // =========================================================
  // CHECK WHETHER FORM IS VALID
  // =========================================================

  isFormValid(): boolean {

    const source =
      this.routeForm.source.trim();


    const destination =
      this.routeForm.destination.trim();


    const distance =
      Number(this.routeForm.distance);


    const duration =
      this.routeForm.duration.trim();


    if (!source) {

      return false;

    }


    if (!destination) {

      return false;

    }


    if (
      source.toLowerCase() ===
      destination.toLowerCase()
    ) {

      return false;

    }


    if (
      !Number.isFinite(distance) ||
      distance <= 0 ||
      distance > 5000
    ) {

      return false;

    }


    if (
      duration.length < 2 ||
      duration.length > 50
    ) {

      return false;

    }


    return true;

  }


  // =========================================================
  // SAVE ROUTE
  // =========================================================

  saveRoute(): void {

    if (this.saving) {

      return;

    }


    const valid =
      this.validateForm();


    if (!valid) {

      return;

    }


    this.routeForm.source =
      this.routeForm.source.trim();


    this.routeForm.destination =
      this.routeForm.destination.trim();


    this.routeForm.duration =
      this.routeForm.duration.trim();


    this.routeForm.distance =
      Number(this.routeForm.distance);


    this.saving = true;


    // =======================================================
    // UPDATE ROUTE
    // =======================================================

    if (
      this.editing &&
      this.editingRouteId !== null
    ) {

      const routeId =
        this.editingRouteId;


      this.authService
        .updateAdminRoute(
          routeId,
          this.routeForm
        )
        .subscribe({

          next: () => {

            alert(
              'Route updated successfully.'
            );

            this.saving = false;

            this.loadRoutes();

            this.loadStops(
              routeId
            );

            this.cdr.detectChanges();

          },

          error: (error) => {

            console.error(
              'UPDATE ROUTE ERROR:',
              error
            );

            this.saving = false;

            this.handleRouteBackendError(
              error,
              'Unable to update route.'
            );

            this.cdr.detectChanges();

          }

        });

      return;

    }


    // =======================================================
    // ADD ROUTE
    // =======================================================

    this.authService
      .addAdminRoute(
        this.routeForm
      )
      .subscribe({

        next: (response: any) => {

          alert(
            'Route added successfully.'
          );

          this.saving = false;


          /*
           * If backend returns the created route,
           * open stop management immediately.
           */

          if (response?.id) {

            this.editing = true;

            this.editingRouteId =
              response.id;

            this.stops = [];

            this.resetStopForm();

            this.loadStops(
              response.id
            );

          }


          this.loadRoutes();

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'ADD ROUTE ERROR:',
            error
          );

          this.saving = false;

          this.handleRouteBackendError(
            error,
            'Unable to add route.'
          );

          this.cdr.detectChanges();

        }

      });

  }


  // =========================================================
  // ROUTE BACKEND ERROR
  // =========================================================

  private handleRouteBackendError(
    error: any,
    defaultMessage: string
  ): void {

    const backendError =
      error?.error;


    if (backendError?.source) {

      this.sourceError =
        Array.isArray(
          backendError.source
        )
          ? backendError.source[0]
          : backendError.source;

      return;

    }


    if (backendError?.destination) {

      this.destinationError =
        Array.isArray(
          backendError.destination
        )
          ? backendError.destination[0]
          : backendError.destination;

      return;

    }


    if (backendError?.distance) {

      this.distanceError =
        Array.isArray(
          backendError.distance
        )
          ? backendError.distance[0]
          : backendError.distance;

      return;

    }


    if (backendError?.duration) {

      this.durationError =
        Array.isArray(
          backendError.duration
        )
          ? backendError.duration[0]
          : backendError.duration;

      return;

    }


    alert(

      backendError?.error ||

      backendError?.detail ||

      backendError?.message ||

      defaultMessage

    );

  }


  // =========================================================
  // LOAD ROUTE STOPS
  // =========================================================

  loadStops(routeId: number): void {

    this.loadingStops = true;

    this.stops = [];


    this.http
      .get<any[]>(
        `http://127.0.0.1:8000/api/buses/routes/${routeId}/stops/`
      )
      .subscribe({

        next: (response: any[]) => {

          console.log(
            'ROUTE STOPS:',
            response
          );

          this.stops = response;

          this.loadingStops = false;


          // Next stop order
          this.stopForm.stop_order =
            this.getNextStopOrder();


          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'STOP LOAD ERROR:',
            error
          );

          this.loadingStops = false;

          this.stops = [];

          this.stopForm.stop_order = 1;

          this.cdr.detectChanges();

        }

      });

  }


  // =========================================================
  // GET NEXT STOP ORDER
  // =========================================================

  getNextStopOrder(): number {

    if (!this.stops.length) {

      return 1;

    }


    const orders =
      this.stops
        .map(
          stop =>
            Number(stop.stop_order)
        )
        .filter(
          order =>
            Number.isInteger(order)
        );


    if (!orders.length) {

      return 1;

    }


    return Math.max(...orders) + 1;

  }


  // =========================================================
  // RESET STOP FORM
  // =========================================================

  resetStopForm(): void {

    this.stopForm = {

      stop_name: '',

      stop_order:
        this.getNextStopOrder(),

      arrival_time: '',

      departure_time: '',

      is_boarding_point: true,

      is_dropping_point: true

    };


    this.clearStopValidation();

  }


  // =========================================================
  // STOP NAME VALIDATION
  // =========================================================

  validateStopName(): boolean {

    const value =
      this.stopForm.stop_name.trim();


    this.stopForm.stop_name =
      value;


    if (!value) {

      this.stopNameError =
        'Stop name is required.';

      return false;

    }


    if (value.length < 2) {

      this.stopNameError =
        'Stop name must contain at least 2 characters.';

      return false;

    }


    if (value.length > 100) {

      this.stopNameError =
        'Stop name cannot exceed 100 characters.';

      return false;

    }


    this.stopNameError = '';

    return true;

  }


  // =========================================================
  // STOP ORDER VALIDATION
  // =========================================================

  validateStopOrder(): boolean {

    const order =
      Number(this.stopForm.stop_order);


    if (
      !Number.isInteger(order) ||
      order < 1
    ) {

      this.stopOrderError =
        'Stop order must be a whole number starting from 1.';

      return false;

    }


    // Prevent duplicate stop order
    const duplicate =
      this.stops.some(
        stop =>
          Number(stop.stop_order) === order
      );


    if (duplicate) {

      this.stopOrderError =
        `Stop order ${order} is already used.`;

      return false;

    }


    this.stopOrderError = '';

    return true;

  }


  // =========================================================
  // STOP TIME VALIDATION
  // =========================================================

  validateStopTimes(): boolean {

    this.stopTimeError = '';


    if (
      this.stopForm.arrival_time &&
      this.stopForm.departure_time
    ) {

      if (
        this.stopForm.departure_time <
        this.stopForm.arrival_time
      ) {

        this.stopTimeError =
          'Departure time cannot be earlier than arrival time.';

        return false;

      }

    }


    return true;

  }


  // =========================================================
  // ADD STOP
  // =========================================================

  addStop(): void {

    if (
      this.editingRouteId === null
    ) {

      alert(
        'Please save the route before adding stops.'
      );

      return;

    }


    const nameValid =
      this.validateStopName();


    const orderValid =
      this.validateStopOrder();


    const timeValid =
      this.validateStopTimes();


    if (
      !nameValid ||
      !orderValid ||
      !timeValid
    ) {

      return;

    }


    if (this.savingStop) {

      return;

    }


    this.savingStop = true;


    const data = {

      route:
        this.editingRouteId,

      stop_name:
        this.stopForm.stop_name.trim(),

      stop_order:
        Number(this.stopForm.stop_order),

      arrival_time:
        this.stopForm.arrival_time || null,

      departure_time:
        this.stopForm.departure_time || null,

      is_boarding_point:
        this.stopForm.is_boarding_point,

      is_dropping_point:
        this.stopForm.is_dropping_point

    };


    this.http
      .post(
        'http://127.0.0.1:8000/api/route-stops/',
        data
      )
      .subscribe({

        next: () => {

          alert(
            'Stop added successfully.'
          );

          this.savingStop = false;


          this.loadStops(
            this.editingRouteId!
          );


          this.resetStopForm();

        },

        error: (error) => {

          console.error(
            'ADD STOP ERROR:',
            error
          );

          this.savingStop = false;


          const backendError =
            error?.error;


          alert(

            backendError?.stop_order?.[0] ||

            backendError?.stop_name?.[0] ||

            backendError?.detail ||

            backendError?.error ||

            'Unable to add stop.'

          );


          this.cdr.detectChanges();

        }

      });

  }


  // =========================================================
  // DELETE STOP
  // =========================================================

  deleteStop(stop: any): void {

    if (!stop?.id) {

      alert(
        'Invalid stop selected.'
      );

      return;

    }


    if (
      !confirm(
        `Delete stop "${stop.stop_name}"?`
      )
    ) {

      return;

    }


    this.http
      .delete(
        `http://127.0.0.1:8000/api/route-stops/${stop.id}/`
      )
      .subscribe({

        next: () => {

          alert(
            'Stop deleted successfully.'
          );


          if (
            this.editingRouteId !== null
          ) {

            this.loadStops(
              this.editingRouteId
            );

          }

        },

        error: (error) => {

          console.error(
            'DELETE STOP ERROR:',
            error
          );


          alert(

            error?.error?.detail ||

            error?.error?.error ||

            error?.error?.message ||

            'Unable to delete stop.'

          );


          this.cdr.detectChanges();

        }

      });

  }


  // =========================================================
  // CLEAR ROUTE VALIDATION
  // =========================================================

  clearValidation(): void {

    this.sourceError = '';

    this.destinationError = '';

    this.distanceError = '';

    this.durationError = '';

  }


  // =========================================================
  // CLEAR STOP VALIDATION
  // =========================================================

  clearStopValidation(): void {

    this.stopNameError = '';

    this.stopOrderError = '';

    this.stopTimeError = '';

  }


  // =========================================================
  // RESET ROUTE FORM
  // =========================================================

  resetRouteForm(): void {

    this.routeForm = {

      source: '',

      destination: '',

      distance: 0,

      duration: ''

    };

  }


  // =========================================================
  // CANCEL FORM
  // =========================================================

  cancelForm(): void {

    this.showForm = false;

    this.editing = false;

    this.editingRouteId = null;

    this.saving = false;

    this.savingStop = false;

    this.stops = [];

    this.clearValidation();

    this.clearStopValidation();

    this.resetRouteForm();

    this.resetStopForm();

  }


  // =========================================================
  // DELETE ROUTE
  // =========================================================

  deleteRoute(route: any): void {

    if (
      !confirm(
        `Delete ${route.source} → ${route.destination}?`
      )
    ) {

      return;

    }


    this.authService
      .deleteAdminRoute(
        route.id
      )
      .subscribe({

        next: () => {

          alert(
            'Route deleted successfully.'
          );

          this.loadRoutes();

        },

        error: (error) => {

          console.error(
            'DELETE ROUTE ERROR:',
            error
          );


          alert(

            error?.error?.error ||

            error?.error?.detail ||

            error?.error?.message ||

            'Unable to delete route.'

          );

        }

      });

  }

}