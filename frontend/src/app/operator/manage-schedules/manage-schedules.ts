import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Router,
  RouterLink
} from '@angular/router';

import { AuthService } from '../../core/services/auth';
import { BusService } from '../../core/services/bus';


@Component({
  selector: 'app-manage-schedules',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './manage-schedules.html',

  styleUrl: './manage-schedules.css'
})
export class ManageSchedulesComponent
  implements OnInit {


  // =================================================
  // DATA
  // =================================================

  buses: any[] = [];

  routes: any[] = [];

  schedules: any[] = [];


  // =================================================
  // EDITING
  // =================================================

  editingScheduleId: number | null = null;


  // =================================================
  // FORM
  // =================================================

  selectedBus: number | null = null;

  selectedRoute: number | null = null;


  // =================================================
  // OPERATING DAYS
  // =================================================

  days: string[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];


  selectedDays: string[] = [];


  // =================================================
  // ACTIVE STATUS
  // =================================================

  isActive = true;


  // =================================================
  // STATUS
  // =================================================

  loading = false;

  loadingBuses = true;

  saving = false;

  errorMessage = '';

  successMessage = '';


  // =================================================
  // CONSTRUCTOR
  // =================================================

  constructor(
    private authService: AuthService,
    private busService: BusService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}


  // =================================================
  // INIT
  // =================================================

  ngOnInit(): void {

    this.loadSchedules();

    this.loadBuses();

    this.loadRoutes();

  }


  // =================================================
  // BACK TO DASHBOARD
  // =================================================

  goToDashboard(): void {

    this.router.navigate([
      '/operator/dashboard'
    ]);

  }


  // =================================================
  // LOAD SCHEDULES
  // =================================================

  loadSchedules(): void {

    this.loading = true;

    this.authService
      .getOperatorSchedules()
      .subscribe({

        next: (data: any[]) => {

          console.log(
            'OPERATOR SCHEDULES:',
            data
          );


          // =================================================
          // NORMALIZE SCHEDULE DATA
          // =================================================

          this.schedules =
            Array.isArray(data)

              ? data.map(
                  (schedule: any) => ({

                    ...schedule,

                    /*
                     * Convert operating_days from:
                     *
                     * [
                     *   { day: "Monday" },
                     *   { day: "Wednesday" }
                     * ]
                     *
                     * into:
                     *
                     * [
                     *   "Monday",
                     *   "Wednesday"
                     * ]
                     */

                    operating_days:
                      this.normalizeOperatingDays(
                        schedule.operating_days
                      )

                  })
                )

              : [];


          console.log(
            'NORMALIZED SCHEDULES:',
            this.schedules
          );


          this.loading = false;

          this.cdr.detectChanges();

        },


        error: (error: any) => {

          console.error(
            'SCHEDULE LOAD ERROR:',
            error
          );


          this.loading = false;

          this.schedules = [];


          this.errorMessage =
            error?.error?.error ||
            error?.error?.detail ||
            error?.error?.message ||
            'Unable to load schedules.';


          this.cdr.detectChanges();

        }

      });

  }


  // =================================================
  // NORMALIZE OPERATING DAYS
  // =================================================

  private normalizeOperatingDays(
    operatingDays: any
  ): string[] {

    if (!Array.isArray(operatingDays)) {

      return [];

    }


    return operatingDays

      .map((day: any) => {

        // =================================================
        // API RETURNS STRING
        // Example:
        // "Monday"
        // =================================================

        if (typeof day === 'string') {

          return day;

        }


        // =================================================
        // API RETURNS OBJECT
        // Example:
        // { day: "Monday" }
        // =================================================

        if (
          day &&
          typeof day.day === 'string'
        ) {

          return day.day;

        }


        // =================================================
        // API MAY RETURN { name: "Monday" }
        // =================================================

        if (
          day &&
          typeof day.name === 'string'
        ) {

          return day.name;

        }


        return null;

      })


      .filter(
        (
          day: string | null
        ): day is string =>
          day !== null &&
          day.trim() !== ''
      );

  }


  // =================================================
  // LOAD BUSES
  // =================================================

  loadBuses(): void {

    console.log(
      'LOADING OPERATOR BUSES...'
    );


    this.loadingBuses = true;

    this.busService
      .getOperatorBuses()
      .subscribe({

        next: (data: any[]) => {

          console.log(
            'ALL OPERATOR BUSES:',
            data
          );


          // =================================================
          // ONLY APPROVED + ACTIVE BUSES CAN BE USED
          // FOR SCHEDULES
          // =================================================

          this.buses =
            Array.isArray(data)

              ? data.filter(
                  (bus: any) =>
                    bus.status === 'APPROVED' &&
                    bus.is_active === true
                )

              : [];


          console.log(
            'APPROVED BUSES:',
            this.buses
          );


          this.loadingBuses = false;

          this.cdr.detectChanges();

        },


        error: (error: any) => {

          console.error(
            'BUS LOAD ERROR:',
            error
          );


          this.buses = [];

          this.loadingBuses = false;


          this.errorMessage =
            error?.error?.error ||
            error?.error?.detail ||
            error?.error?.message ||
            'Unable to load approved buses.';


          this.cdr.detectChanges();

        }

      });

  }


  // =================================================
  // LOAD ROUTES
  // =================================================

  loadRoutes(): void {

    console.log(
      'LOADING OPERATOR ROUTES...'
    );


    this.authService
      .getOperatorRoutes()
      .subscribe({

        next: (data: any[]) => {

          console.log(
            'OPERATOR ROUTES:',
            data
          );


          this.routes =
            Array.isArray(data)

              ? data

              : [];


          console.log(
            'ROUTE COUNT:',
            this.routes.length
          );


          this.cdr.detectChanges();

        },


        error: (error: any) => {

          console.error(
            'ROUTE LOAD ERROR:',
            error
          );


          this.routes = [];


          this.errorMessage =
            error?.error?.error ||
            error?.error?.detail ||
            error?.error?.message ||
            'Unable to load routes.';


          this.cdr.detectChanges();

        }

      });

  }


  // =================================================
  // TOGGLE OPERATING DAY
  // =================================================

  toggleDay(day: string): void {

    if (
      this.selectedDays.includes(day)
    ) {

      this.selectedDays =
        this.selectedDays.filter(
          selectedDay =>
            selectedDay !== day
        );

    }

    else {

      this.selectedDays = [
        ...this.selectedDays,
        day
      ];

    }

  }


  // =================================================
  // CHECK OPERATING DAY
  // =================================================

  isDaySelected(
    day: string
  ): boolean {

    return this.selectedDays.includes(day);

  }


  // =================================================
  // SAVE SCHEDULE
  // CREATE OR UPDATE
  // =================================================

  saveSchedule(): void {

    // =================================================
    // CLEAR OLD MESSAGES
    // =================================================

    this.successMessage = '';

    this.errorMessage = '';


    // =================================================
    // PREVENT DOUBLE CLICK
    // =================================================

    if (this.saving) {

      return;

    }


    // =================================================
    // VALIDATE BUS
    // =================================================

    if (this.selectedBus === null) {

      this.errorMessage =
        'Please select a bus.';

      return;

    }


    // =================================================
    // VALIDATE BUS APPROVAL
    // =================================================

    const selectedBusObject = this.buses.find(
      (bus: any) =>
        Number(bus.id) === Number(this.selectedBus)
    );


    if (
      !selectedBusObject ||
      selectedBusObject.status !== 'APPROVED' ||
      selectedBusObject.is_active !== true
    ) {

      this.errorMessage =
        'Schedule can be created or updated only for an approved and active bus.';

      return;

    }


    // =================================================
    // VALIDATE ROUTE
    // =================================================

    if (this.selectedRoute === null) {

      this.errorMessage =
        'Please select a route.';

      return;

    }


    // =================================================
    // VALIDATE OPERATING DAYS
    // =================================================

    if (
      this.selectedDays.length === 0
    ) {

      this.errorMessage =
        'Please select at least one operating day.';

      return;

    }


    // =================================================
    // REQUEST DATA
    // =================================================

    const scheduleData = {

      bus:
        Number(this.selectedBus),

      route:
        Number(this.selectedRoute),

      is_active:
        this.isActive,

      operating_days:
        [...this.selectedDays]

    };


    console.log(
      '================================'
    );

    console.log(
      'SCHEDULE REQUEST'
    );

    console.log(
      'EDITING ID:',
      this.editingScheduleId
    );

    console.log(
      'DATA:',
      scheduleData
    );

    console.log(
      '================================'
    );


    this.saving = true;

    this.cdr.detectChanges();


    // =================================================
    // UPDATE EXISTING SCHEDULE
    // =================================================

    if (
      this.editingScheduleId !== null
    ) {

      this.authService
        .updateOperatorSchedule(
          this.editingScheduleId,
          scheduleData
        )
        .subscribe({

          next: (response: any) => {

            console.log(
              'SCHEDULE UPDATED:',
              response
            );


            this.saving = false;

            this.successMessage =
              'Schedule updated successfully.';

            this.errorMessage = '';


            this.resetForm();

            this.loadSchedules();

            this.cdr.detectChanges();

          },


          error: (error: any) => {

            console.error(
              'SCHEDULE UPDATE ERROR:',
              error
            );


            this.saving = false;


            this.errorMessage =
              error?.error?.error ||
              error?.error?.detail ||
              error?.error?.message ||
              'Failed to update schedule.';


            this.cdr.detectChanges();

          }

        });


      return;

    }


    // =================================================
    // CREATE NEW SCHEDULE
    // =================================================

    this.authService
      .addOperatorSchedule(
        scheduleData
      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'SCHEDULE CREATED:',
            response
          );


          this.saving = false;

          this.successMessage =
            'Schedule created successfully.';

          this.errorMessage = '';


          this.resetForm();

          this.loadSchedules();

          this.cdr.detectChanges();

        },


        error: (error: any) => {

          console.error(
            'SCHEDULE CREATE ERROR:',
            error
          );


          this.saving = false;


          this.errorMessage =
            error?.error?.error ||
            error?.error?.detail ||
            error?.error?.message ||
            'Failed to create schedule.';


          this.cdr.detectChanges();

        }

      });

  }


  // =================================================
  // EDIT SCHEDULE
  // =================================================

  editSchedule(
    schedule: any
  ): void {

    console.log(
      '================================'
    );

    console.log(
      'EDIT SCHEDULE'
    );

    console.log(
      'SCHEDULE:',
      schedule
    );

    console.log(
      '================================'
    );


    // =================================================
    // CLEAR MESSAGES
    // =================================================

    this.errorMessage = '';

    this.successMessage = '';


    // =================================================
    // CHECK BUS APPROVAL BEFORE EDIT
    // =================================================

    const scheduleBusId =
      schedule.bus?.id ??
      schedule.bus ??
      schedule.bus_id;


    const approvedBus =
      this.buses.find(
        (bus: any) =>
          Number(bus.id) === Number(scheduleBusId)
      );


    if (
      !approvedBus ||
      approvedBus.status !== 'APPROVED' ||
      approvedBus.is_active !== true
    ) {

      this.errorMessage =
        'This schedule cannot be edited because its bus is not approved or active.';

      return;

    }


    // =================================================
    // SET EDIT ID
    // =================================================

    this.editingScheduleId =
      Number(schedule.id);


    // =================================================
    // SET BUS
    // =================================================

    if (
      schedule.bus !== undefined &&
      schedule.bus !== null
    ) {

      if (
        typeof schedule.bus === 'object' &&
        schedule.bus.id !== undefined
      ) {

        this.selectedBus =
          Number(schedule.bus.id);

      }

      else {

        this.selectedBus =
          Number(schedule.bus);

      }

    }

    else if (
      schedule.bus_id !== undefined &&
      schedule.bus_id !== null
    ) {

      this.selectedBus =
        Number(schedule.bus_id);

    }

    else {

      this.selectedBus = null;

    }


    // =================================================
    // SET ROUTE
    // =================================================

    if (
      schedule.route !== undefined &&
      schedule.route !== null
    ) {

      if (
        typeof schedule.route === 'object' &&
        schedule.route.id !== undefined
      ) {

        this.selectedRoute =
          Number(schedule.route.id);

      }

      else {

        this.selectedRoute =
          Number(schedule.route);

      }

    }

    else if (
      schedule.route_id !== undefined &&
      schedule.route_id !== null
    ) {

      this.selectedRoute =
        Number(schedule.route_id);

    }

    else {

      this.selectedRoute = null;

    }


    // =================================================
    // SET OPERATING DAYS
    // =================================================

    this.selectedDays =
      this.normalizeOperatingDays(
        schedule.operating_days
      );


    // =================================================
    // SET ACTIVE STATUS
    // =================================================

    this.isActive =
      schedule.is_active !== false;


    console.log(
      'EDIT FORM VALUES:',
      {

        editingScheduleId:
          this.editingScheduleId,

        selectedBus:
          this.selectedBus,

        selectedRoute:
          this.selectedRoute,

        selectedDays:
          this.selectedDays,

        isActive:
          this.isActive

      }
    );


    // =================================================
    // SCROLL TO FORM
    // =================================================

    window.scrollTo({

      top: 0,

      behavior: 'smooth'

    });


    this.cdr.detectChanges();

  }


  // =================================================
  // DELETE SCHEDULE
  // =================================================

  deleteSchedule(
    scheduleId: number
  ): void {

    // =================================================
    // CONFIRM
    // =================================================

    const confirmed =
      confirm(
        'Are you sure you want to delete this schedule?'
      );


    if (!confirmed) {

      return;

    }


    // =================================================
    // CLEAR MESSAGES
    // =================================================

    this.errorMessage = '';

    this.successMessage = '';


    // =================================================
    // DELETE API
    // =================================================

    this.authService
      .deleteOperatorSchedule(
        Number(scheduleId)
      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'SCHEDULE DELETED:',
            response
          );


          this.successMessage =
            'Schedule deleted successfully.';


          // =================================================
          // IF CURRENTLY EDITING THIS SCHEDULE
          // =================================================

          if (
            this.editingScheduleId ===
            Number(scheduleId)
          ) {

            this.resetForm();

          }


          // =================================================
          // RELOAD LIST
          // =================================================

          this.loadSchedules();

          this.cdr.detectChanges();

        },


        error: (error: any) => {

          console.error(
            'SCHEDULE DELETE ERROR:',
            error
          );


          this.errorMessage =
            error?.error?.error ||
            error?.error?.detail ||
            error?.error?.message ||
            'Failed to delete schedule.';


          this.cdr.detectChanges();

        }

      });

  }


  // =================================================
  // CANCEL EDIT
  // =================================================

  cancelEdit(): void {

    console.log(
      'CANCEL EDIT'
    );


    this.resetForm();

    this.successMessage = '';

    this.errorMessage = '';

    this.cdr.detectChanges();

  }


  // =================================================
  // RESET FORM
  // =================================================

  resetForm(): void {

    this.editingScheduleId = null;

    this.selectedBus = null;

    this.selectedRoute = null;

    this.selectedDays = [];

    this.isActive = true;

  }

}