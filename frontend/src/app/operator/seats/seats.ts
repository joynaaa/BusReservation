import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { BusService } from '../../core/services/bus';


@Component({
  selector: 'app-seats',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './seats.html',
  styleUrl: './seats.css'
})
export class SeatsComponent implements OnInit {

  // =====================================================
  // DATA
  // =====================================================

  buses: any[] = [];

  schedules: any[] = [];

  seats: any[] = [];


  // =====================================================
  // SELECTED VALUES
  // =====================================================

  selectedBus: any = '';

  selectedSchedule: any = '';


  // =====================================================
  // SEAT LAYOUT
  // =====================================================

  seatsPerRow: number = 4;


  // =====================================================
  // LOADING
  // =====================================================

  loadingBuses: boolean = false;

  loadingSchedules: boolean = false;

  loadingSeats: boolean = false;


  // =====================================================
  // ERROR
  // =====================================================

  errorMessage: string = '';


  constructor(
    private authService: AuthService,
    private busService: BusService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.loadBuses();

  }

goToDashboard(): void {
  this.router.navigate(['/operator/dashboard']);
}
  // =====================================================
  // LOAD OPERATOR BUSES
  // =====================================================

  loadBuses(): void {

    this.loadingBuses = true;

    this.errorMessage = '';

    this.busService.getOperatorBuses().subscribe({

      next: (data: any) => {

        console.log(
          'Operator buses received:',
          data
        );


        // Handle normal array response
        if (Array.isArray(data)) {

          this.buses = [...data];

        }

        // Handle paginated response
        else if (
          data &&
          Array.isArray(data.results)
        ) {

          this.buses = [...data.results];

        }

        else {

          this.buses = [];

        }


        console.log(
          'Buses loaded:',
          this.buses
        );


        this.loadingBuses = false;

        // Force Angular UI update
        this.cdr.detectChanges();

      },


      error: (error) => {

        console.error(
          'Error loading buses:',
          error
        );

        this.buses = [];

        this.loadingBuses = false;

        this.errorMessage =
          error?.error?.error ||
          'Unable to load buses.';

        this.cdr.detectChanges();

      }

    });

  }


  // =====================================================
  // LOAD SCHEDULES FOR SELECTED BUS
  // =====================================================

  loadSchedules(): void {

    // Clear previous values

    this.selectedSchedule = '';

    this.schedules = [];

    this.seats = [];

    this.errorMessage = '';


    // No bus selected

    if (!this.selectedBus) {

      return;

    }


    // ===================================================
    // FIND SELECTED BUS
    // ===================================================

    const selectedBusObject = this.buses.find(
      bus =>
        Number(bus.id) ===
        Number(this.selectedBus)
    );


    if (selectedBusObject) {

      this.seatsPerRow =
        Number(
          selectedBusObject.seats_per_row
        ) || 4;

    }


    // ===================================================
    // LOAD SCHEDULES
    // ===================================================

    this.loadingSchedules = true;


    this.authService
      .getOperatorSchedules()
      .subscribe({

        next: (data: any) => {

          console.log(
            'Operator schedules received:',
            data
          );


          let allSchedules: any[] = [];


          if (Array.isArray(data)) {

            allSchedules = data;

          }

          else if (
            data &&
            Array.isArray(data.results)
          ) {

            allSchedules = data.results;

          }


          // Filter schedules belonging
          // to selected bus

          this.schedules = allSchedules.filter(
            schedule =>
              Number(schedule.bus) ===
              Number(this.selectedBus)
          );


          console.log(
            'Schedules for selected bus:',
            this.schedules
          );


          this.loadingSchedules = false;

          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'Error loading schedules:',
            error
          );

          this.schedules = [];

          this.loadingSchedules = false;

          this.errorMessage =
            error?.error?.error ||
            'Unable to load schedules.';

          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // LOAD SEATS
  // =====================================================

  loadSeats(): void {

    this.seats = [];

    this.errorMessage = '';


    if (!this.selectedSchedule) {

      return;

    }


    this.loadingSeats = true;


    console.log(
      'Loading seats for schedule:',
      this.selectedSchedule
    );


    this.authService
      .getOperatorSeats(
        Number(this.selectedSchedule)
      )
      .subscribe({

        next: (data: any) => {

          console.log(
            'Seats received:',
            data
          );


          if (Array.isArray(data)) {

            this.seats = [...data];

          }

          else if (
            data &&
            Array.isArray(data.results)
          ) {

            this.seats = [...data.results];

          }

          else {

            this.seats = [];

          }


          this.loadingSeats = false;

          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'Error loading seats:',
            error
          );

          this.seats = [];

          this.loadingSeats = false;

          this.errorMessage =
            error?.error?.error ||
            'Unable to load seats.';

          this.cdr.detectChanges();

        }

      });

  }

}