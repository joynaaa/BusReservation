import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { BusService } from '../../core/services/bus';


@Component({
  selector: 'app-manage-fares',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './manage-fares.html',
  styleUrls: ['./manage-fares.css']
})
export class ManageFaresComponent implements OnInit {

  // ==========================================
  // SCHEDULE
  // ==========================================

  scheduleId!: number;

  schedule: any = null;


  // ==========================================
  // STOPS
  // ==========================================

  stops: any[] = [];

  stopsLoading = false;


  // ==========================================
  // FARES
  // ==========================================

  fares: any[] = [];


  // ==========================================
  // FORM
  // ==========================================

  fromStop: number | null = null;

  toStop: number | null = null;

  fare: number | null = null;


  // ==========================================
  // STATUS
  // ==========================================

  loading = false;

  saving = false;

  errorMessage = '';

  successMessage = '';


  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    private route: ActivatedRoute,
    private busService: BusService,
    private cdr: ChangeDetectorRef,  private router: Router
  ) {}


  // ==========================================
  // INITIALIZE
  // ==========================================

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('scheduleId');

    if (!id) {

      this.errorMessage =
        'Schedule ID not found.';

      return;
    }

    this.scheduleId = Number(id);

    console.log(
      'Manage Fares - Schedule ID:',
      this.scheduleId
    );

    this.loadSchedule();
  }

goToDashboard(): void {
  this.router.navigate(['/operator/dashboard']);
}
  // ==========================================
  // LOAD SCHEDULE
  // ==========================================

  loadSchedule(): void {

    this.loading = true;

    this.errorMessage = '';

    this.busService
      .getSchedule(this.scheduleId)
      .subscribe({

        next: (schedule: any) => {

          console.log(
            'Schedule response:',
            schedule
          );

          this.schedule = schedule;

          const routeId =
            Number(schedule.route);

          console.log(
            'Route ID:',
            routeId
          );

          if (!routeId) {

            this.errorMessage =
              'Route ID is missing from this schedule.';

            this.loading = false;

            return;
          }

          this.loadStops(routeId);
        },

        error: (error) => {

          console.error(
            'Schedule loading error:',
            error
          );

          this.errorMessage =
            error?.error?.error ||
            error?.error?.detail ||
            'Unable to load schedule.';

          this.loading = false;
        }

      });
  }


  // ==========================================
  // LOAD ROUTE STOPS
  // ==========================================

  loadStops(routeId: number): void {

    this.stopsLoading = true;

    this.errorMessage = '';

    console.log(
      'Loading route stops:',
      routeId
    );

    this.busService
      .getRouteStops(routeId)
      .subscribe({

        next: (response: any) => {

          console.log(
            'Route stops response:',
            response
          );


          // ==================================
          // NORMAL ARRAY RESPONSE
          // ==================================

          if (Array.isArray(response)) {

            this.stops = response;

          }


          // ==================================
          // PAGINATED RESPONSE
          // ==================================

          else if (
            response &&
            Array.isArray(response.results)
          ) {

            this.stops = response.results;

          }


          // ==================================
          // INVALID RESPONSE
          // ==================================

          else {

            this.stops = [];

          }


          // ==================================
          // NORMALIZE STOP DATA
          // ==================================

          this.stops = this.stops.map(
            (stop: any) => ({
              ...stop,
              id: Number(stop.id),
              stop_order: Number(stop.stop_order)
            })
          );


          // ==================================
          // SORT STOPS
          // ==================================

          this.stops.sort(
            (a: any, b: any) =>
              a.stop_order - b.stop_order
          );


          console.log(
            'Stops loaded:',
            this.stops
          );


          // ==================================
          // STOP LOADING COMPLETE
          // ==================================

          this.stopsLoading = false;


          // ==================================
          // FORCE ANGULAR UI UPDATE
          // ==================================

          this.cdr.detectChanges();


          // ==================================
          // CHECK STOPS
          // ==================================

          if (this.stops.length === 0) {

            this.errorMessage =
              'No stops found for this route.';

            this.loading = false;

            this.cdr.detectChanges();

            return;
          }


          // ==================================
          // LOAD EXISTING FARES
          // ==================================

          this.loadFares();

        },

        error: (error) => {

          console.error(
            'Route stops loading error:',
            error
          );

          this.stops = [];

          this.stopsLoading = false;

          this.loading = false;

          this.errorMessage =
            error?.error?.error ||
            error?.error?.detail ||
            'Unable to load route stops.';

          this.cdr.detectChanges();
        }

      });
  }


  // ==========================================
  // LOAD EXISTING FARES
  // ==========================================

  loadFares(): void {

    console.log(
      'Loading fares for schedule:',
      this.scheduleId
    );

    this.busService
      .getScheduleFares(this.scheduleId)
      .subscribe({

        next: (response: any) => {

          console.log(
            'Fares response:',
            response
          );


          // ==================================
          // NORMAL ARRAY
          // ==================================

          if (Array.isArray(response)) {

            this.fares = response;

          }


          // ==================================
          // PAGINATED RESPONSE
          // ==================================

          else if (
            response &&
            Array.isArray(response.results)
          ) {

            this.fares = response.results;

          }


          // ==================================
          // INVALID RESPONSE
          // ==================================

          else {

            this.fares = [];

          }

          this.loading = false;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Fare loading error:',
            error
          );

          this.fares = [];

          this.loading = false;

          this.errorMessage =
            error?.error?.error ||
            error?.error?.detail ||
            'Unable to load fares.';

          this.cdr.detectChanges();
        }

      });
  }


  // ==========================================
  // ADD / UPDATE FARE
  // ==========================================

  addFare(): void {

    console.log('================================');
    console.log('ADD FARE STARTED');
    console.log('Schedule ID:', this.scheduleId);
    console.log('From Stop:', this.fromStop);
    console.log('To Stop:', this.toStop);
    console.log('Fare:', this.fare);
    console.log('================================');


    this.errorMessage = '';

    this.successMessage = '';


    // ==================================
    // FROM STOP
    // ==================================

    if (
      this.fromStop === null ||
      this.fromStop === undefined
    ) {

      this.errorMessage =
        'Please select the From Stop.';

      return;
    }


    // ==================================
    // TO STOP
    // ==================================

    if (
      this.toStop === null ||
      this.toStop === undefined
    ) {

      this.errorMessage =
        'Please select the To Stop.';

      return;
    }


    // ==================================
    // SAME STOP
    // ==================================

    if (
      Number(this.fromStop) ===
      Number(this.toStop)
    ) {

      this.errorMessage =
        'From Stop and To Stop cannot be the same.';

      return;
    }


    // ==================================
    // FARE
    // ==================================

    if (
      this.fare === null ||
      this.fare === undefined ||
      Number(this.fare) <= 0
    ) {

      this.errorMessage =
        'Please enter a valid fare.';

      return;
    }


    // ==================================
    // FIND SELECTED STOPS
    // ==================================

    const from = this.stops.find(
      (stop: any) =>
        Number(stop.id) ===
        Number(this.fromStop)
    );


    const to = this.stops.find(
      (stop: any) =>
        Number(stop.id) ===
        Number(this.toStop)
    );


    console.log(
      'Selected From Stop:',
      from
    );

    console.log(
      'Selected To Stop:',
      to
    );


    if (!from || !to) {

      this.errorMessage =
        'Invalid stop selected.';

      return;
    }


    // ==================================
    // STOP ORDER
    // ==================================

    if (
      Number(from.stop_order) >=
      Number(to.stop_order)
    ) {

      this.errorMessage =
        'From Stop must come before To Stop.';

      return;
    }


    // ==================================
    // REQUEST DATA
    // ==================================

    const data = {

      from_stop: Number(this.fromStop),

      to_stop: Number(this.toStop),

      fare: Number(this.fare)

    };


    console.log(
      'FARE REQUEST DATA:',
      data
    );

    console.log(
      'POST URL:',
      `http://127.0.0.1:8000/api/operator/schedules/${this.scheduleId}/fares/add/`
    );


    // ==================================
    // START SAVING
    // ==================================

    this.saving = true;


    this.busService
      .addScheduleFare(
        this.scheduleId,
        data
      )
      .subscribe({

        // ==============================
        // SUCCESS
        // ==============================

        next: (response: any) => {

          console.log(
            '================================'
          );

          console.log(
            'FARE SAVE SUCCESS'
          );

          console.log(
            'Response:',
            response
          );

          console.log(
            '================================'
          );


          this.saving = false;


          this.successMessage =
            response?.message ||
            'Fare saved successfully.';

          this.errorMessage = '';


          // ==================================
          // CLEAR FORM
          // ==================================

          this.fromStop = null;

          this.toStop = null;

          this.fare = null;


          // ==================================
          // UPDATE UI
          // ==================================

          this.cdr.detectChanges();


          // ==================================
          // RELOAD FARES
          // ==================================

          this.loadFares();

        },


        // ==============================
        // ERROR
        // ==============================

        error: (error: any) => {

          console.error(
            '================================'
          );

          console.error(
            'FARE SAVE ERROR'
          );

          console.error(
            'Status:',
            error?.status
          );

          console.error(
            'Error:',
            error
          );

          console.error(
            'Backend response:',
            error?.error
          );

          console.error(
            '================================'
          );


          this.saving = false;


          this.errorMessage =
            error?.error?.error ||
            error?.error?.detail ||
            error?.message ||
            'Unable to save fare.';

          this.cdr.detectChanges();
        },


        // ==============================
        // COMPLETE
        // ==============================

        complete: () => {

          console.log(
            'FARE REQUEST COMPLETED'
          );

          this.saving = false;

          this.cdr.detectChanges();

        }

      });

  }


  // ==========================================
  // DELETE FARE
  // ==========================================

  deleteFare(
    fareId: number
  ): void {

    if (
      !confirm(
        'Are you sure you want to delete this fare?'
      )
    ) {

      return;
    }


    console.log(
      'Deleting fare:',
      fareId
    );


    this.busService
      .deleteScheduleFare(
        this.scheduleId,
        fareId
      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'Fare deleted:',
            response
          );

          this.successMessage =
            response?.message ||
            'Fare deleted successfully.';

          this.errorMessage = '';

          this.loadFares();

        },

        error: (error) => {

          console.error(
            'Fare delete error:',
            error
          );

          this.errorMessage =
            error?.error?.error ||
            error?.error?.detail ||
            'Unable to delete fare.';

          this.cdr.detectChanges();

        }

      });

  }

}