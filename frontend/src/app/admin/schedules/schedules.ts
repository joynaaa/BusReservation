import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth';


@Component({
  selector: 'app-schedules',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './schedules.html',

  styleUrl: './schedules.css'
})
export class SchedulesComponent
  implements OnInit {


  // =====================================================
  // DATA
  // =====================================================

  schedules: any[] = [];

  buses: any[] = [];

  routes: any[] = [];


  // =====================================================
  // STATE
  // =====================================================

  loading = true;

  showForm = false;

  editing = false;

  editingScheduleId:
    number | null = null;


  // =====================================================
  // DAYS
  // =====================================================

  availableDays: string[] = [

    'Monday',

    'Tuesday',

    'Wednesday',

    'Thursday',

    'Friday',

    'Saturday',

    'Sunday'

  ];


  selectedDays: string[] = [];


  // =====================================================
  // FORM
  // =====================================================

  scheduleForm = {

    bus: null as number | null,

    route: null as number | null,

    is_active: true

  };


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private authService: AuthService,

    private router: Router,

    private cdr: ChangeDetectorRef

  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.loadSchedules();

    this.loadBuses();

    this.loadRoutes();

  }

goToDashboard(): void {
  this.router.navigate(['/admin/dashboard']);
}
  // =====================================================
  // LOAD SCHEDULES
  // =====================================================

  loadSchedules(): void {

    this.loading = true;


    this.authService
      .getAdminSchedules()
      .subscribe({

        next: (response: any) => {

          console.log(
            'ADMIN SCHEDULES:',
            response
          );


          this.schedules =
            Array.isArray(response)
              ? response
              : [];


          this.loading = false;


          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'SCHEDULE LOAD ERROR:',
            error
          );


          this.loading = false;


          alert(
            error?.error?.error ||
            'Unable to load schedules.'
          );


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // LOAD BUSES
  // =====================================================

  loadBuses(): void {

    this.authService
      .getAllBuses()
      .subscribe({

        next: (response: any) => {

          console.log(
            'BUSES:',
            response
          );


          this.buses =
            Array.isArray(response)
              ? response
              : [];


          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'BUS LOAD ERROR:',
            error
          );

        }

      });

  }


  // =====================================================
  // LOAD ROUTES
  // =====================================================

  loadRoutes(): void {

    this.authService
      .getAllRoutes()
      .subscribe({

        next: (response: any) => {

          console.log(
            'ROUTES:',
            response
          );


          this.routes =
            Array.isArray(response)
              ? response
              : [];


          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'ROUTE LOAD ERROR:',
            error
          );

        }

      });

  }


  // =====================================================
  // ADD
  // =====================================================

  addSchedule(): void {

    this.editing = false;

    this.editingScheduleId = null;


    this.scheduleForm = {

      bus: null,

      route: null,

      is_active: true

    };


    this.selectedDays = [];


    this.showForm = true;


    this.cdr.detectChanges();

  }


  // =====================================================
  // EDIT
  // =====================================================

  editSchedule(schedule: any): void {

  console.log('EDIT SCHEDULE:', schedule);

  this.editing = true;

  this.editingScheduleId = schedule.id;


  // =====================================================
  // GET BUS ID
  // =====================================================

  let busId: number | null = null;

  if (schedule.bus_id !== undefined && schedule.bus_id !== null) {

    busId = Number(schedule.bus_id);

  }
  else if (
    schedule.bus &&
    typeof schedule.bus === 'object' &&
    schedule.bus.id !== undefined
  ) {

    busId = Number(schedule.bus.id);

  }
  else if (
    schedule.bus !== undefined &&
    schedule.bus !== null
  ) {

    busId = Number(schedule.bus);

  }


  // =====================================================
  // GET ROUTE ID
  // =====================================================

  let routeId: number | null = null;

  if (
    schedule.route_id !== undefined &&
    schedule.route_id !== null
  ) {

    routeId = Number(schedule.route_id);

  }
  else if (
    schedule.route &&
    typeof schedule.route === 'object' &&
    schedule.route.id !== undefined
  ) {

    routeId = Number(schedule.route.id);

  }
  else if (
    schedule.route !== undefined &&
    schedule.route !== null
  ) {

    routeId = Number(schedule.route);

  }


  console.log('EDIT BUS ID:', busId);

  console.log('EDIT ROUTE ID:', routeId);


  // =====================================================
  // SET FORM
  // =====================================================

  this.scheduleForm = {

    bus: busId,

    route: routeId,

    is_active:
      schedule.is_active !== false

  };


  // =====================================================
  // OPERATING DAYS
  // =====================================================

  this.selectedDays =
    this.extractDays(
      schedule.operating_days
    );


  // =====================================================
  // SHOW FORM
  // =====================================================

  this.showForm = true;


  this.cdr.detectChanges();

}

  // =====================================================
  // EXTRACT DAYS
  // =====================================================

  private extractDays(
    days: any[]
  ): string[] {

    if (!Array.isArray(days)) {

      return [];

    }


    return days

      .map((item: any) => {

        if (
          typeof item === 'string'
        ) {

          return item;

        }

        return item?.day;

      })

      .filter(
        (day: string | undefined):
          day is string =>
            !!day
      );

  }


  // =====================================================
  // CHECK DAY
  // =====================================================

  isDaySelected(
    day: string
  ): boolean {

    return this.selectedDays
      .includes(day);

  }


  // =====================================================
  // TOGGLE DAY
  // =====================================================

  toggleDay(
    day: string
  ): void {

    const index =
      this.selectedDays
        .indexOf(day);


    if (index === -1) {

      this.selectedDays.push(day);

    }

    else {

      this.selectedDays
        .splice(index, 1);

    }

  }


  // =====================================================
  // SAVE
  // =====================================================

  saveSchedule(): void {

    // ---------------------------------------------------
    // BUS
    // ---------------------------------------------------

    if (!this.scheduleForm.bus) {

      alert(
        'Please select a bus.'
      );

      return;

    }


    // ---------------------------------------------------
    // ROUTE
    // ---------------------------------------------------

    if (!this.scheduleForm.route) {

      alert(
        'Please select a route.'
      );

      return;

    }


    // ---------------------------------------------------
    // DAYS
    // ---------------------------------------------------

    if (
      this.selectedDays.length === 0
    ) {

      alert(
        'Please select at least one operating day.'
      );

      return;

    }


    const data = {

      bus:
        this.scheduleForm.bus,

      route:
        this.scheduleForm.route,

      is_active:
        this.scheduleForm.is_active

    };


    console.log(
      'ADMIN SCHEDULE DATA:',
      data
    );


    // ===================================================
    // UPDATE
    // ===================================================

    if (
      this.editing &&
      this.editingScheduleId !== null
    ) {

      this.authService
        .updateAdminSchedule(

          this.editingScheduleId,

          data

        )
        .subscribe({

          next: (
            response
          ) => {

            console.log(
              'UPDATED:',
              response
            );


            this.saveOperatingDays(
              this.editingScheduleId!
            );

          },


          error: (error) => {

            console.error(
              'UPDATE ERROR:',
              error
            );


            alert(
              error?.error?.error ||
              'Unable to update schedule.'
            );

          }

        });

    }


    // ===================================================
    // ADD
    // ===================================================

    else {

      this.authService
        .addAdminSchedule(
          data
        )
        .subscribe({

          next: (
            response: any
          ) => {

            console.log(
              'CREATED:',
              response
            );


            const scheduleId =
              response?.id;


            if (!scheduleId) {

              alert(
                'Schedule created, but ID was not returned.'
              );

              this.cancelForm();

              this.loadSchedules();

              return;

            }


            this.saveOperatingDays(
              scheduleId
            );

          },


          error: (error) => {

            console.error(
              'ADD ERROR:',
              error
            );


            alert(
              error?.error?.error ||
              'Unable to add schedule.'
            );

          }

        });

    }

  }


  // =====================================================
  // SAVE DAYS
  // =====================================================

  private saveOperatingDays(
    scheduleId: number
  ): void {

    console.log(
      'ADMIN OPERATING DAYS:',
      this.selectedDays
    );


    this.authService
      .updateAdminScheduleDays(

        scheduleId,

        this.selectedDays

      )
      .subscribe({

        next: () => {

          alert(
            this.editing
              ? 'Schedule updated successfully.'
              : 'Schedule added successfully.'
          );


          this.cancelForm();

          this.loadSchedules();

        },


        error: (error) => {

          console.error(
            'DAY UPDATE ERROR:',
            error
          );


          alert(
            error?.error?.error ||
            'Schedule saved, but operating days could not be saved.'
          );


          this.cancelForm();

          this.loadSchedules();

        }

      });

  }


  // =====================================================
  // CANCEL
  // =====================================================

  cancelForm(): void {

    this.showForm = false;

    this.editing = false;

    this.editingScheduleId = null;

    this.selectedDays = [];


    this.scheduleForm = {

      bus: null,

      route: null,

      is_active: true

    };


    this.cdr.detectChanges();

  }


  // =====================================================
  // DELETE
  // =====================================================

  deleteSchedule(
    schedule: any
  ): void {

    const source =
      schedule.source ||
      'Source';


    const destination =
      schedule.destination ||
      'Destination';


    if (
      !confirm(
        `Delete ${source} → ${destination} schedule?`
      )
    ) {

      return;

    }


    this.authService
      .deleteAdminSchedule(
        schedule.id
      )
      .subscribe({

        next: () => {

          alert(
            'Schedule deleted successfully.'
          );


          this.loadSchedules();

        },


        error: (error) => {

          console.error(
            'DELETE ERROR:',
            error
          );


          alert(
            error?.error?.error ||
            'Unable to delete schedule.'
          );

        }

      });

  }


  // =====================================================
  // MANAGE FARES
  // =====================================================

  manageFares(
    schedule: any
  ): void {

    this.router.navigate([
      '/admin/schedules',
      schedule.id,
      'fares'
    ]);

  }

}