import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth';
import { Router } from '@angular/router';
@Component({
  selector: 'app-buses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buses.html',
  styleUrl: './buses.css'
})
export class BusesComponent implements OnInit {

  // =========================================================
  // BUS LIST
  // =========================================================

  buses: any[] = [];

  loading = true;


  // =========================================================
  // FORM STATE
  // =========================================================

  showForm = false;

  editing = false;

  editingBusId: number | null = null;

  saving = false;


  // =========================================================
  // VALIDATION ERRORS
  // =========================================================

  busNumberError = '';

  busNameError = '';

  busTypeError = '';

  totalSeatsError = '';

  seatsPerRowError = '';


  // =========================================================
  // BUS FORM
  // =========================================================

  busForm = {

    bus_number: '',

    bus_name: '',

    bus_type: 'AC',

    total_seats: 40,

    seats_per_row: '4',

    operator: null as number | null

  };


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
     private router: Router
  ) {}


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.loadBuses();

  }

goToDashboard(): void {
  this.router.navigate(['/admin/dashboard']);
}
  // =========================================================
  // LOAD BUSES
  // =========================================================

  loadBuses(): void {

    this.loading = true;

    this.authService.getAdminBuses().subscribe({

      next: (response: any[]) => {

        console.log('ADMIN BUSES:', response);

        this.buses = response;

        this.loading = false;

        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error('BUS LOAD ERROR:', error);

        this.loading = false;

        this.cdr.detectChanges();

        alert(
          error?.error?.detail ||
          error?.error?.error ||
          'Unable to load buses.'
        );

      }

    });

  }


  // =========================================================
  // ADD BUS
  // =========================================================

  addBus(): void {

    this.editing = false;

    this.editingBusId = null;

    this.saving = false;

    this.clearValidation();

    this.busForm = {

      bus_number: '',

      bus_name: '',

      bus_type: 'AC',

      total_seats: 40,

      seats_per_row: '4',

      operator: null

    };

    this.showForm = true;

  }


  // =========================================================
  // EDIT BUS
  // =========================================================

  editBus(bus: any): void {

    this.editing = true;

    this.editingBusId = bus.id;

    this.saving = false;

    this.clearValidation();

    this.busForm = {

      bus_number: bus.bus_number || '',

      bus_name: bus.bus_name || '',

      bus_type: bus.bus_type || 'AC',

      total_seats: Number(bus.total_seats) || 40,

      seats_per_row: String(
        bus.seats_per_row || '4'
      ),

      operator: bus.operator_id ?? null

    };

    this.showForm = true;

  }


  // =========================================================
  // BUS NUMBER VALIDATION
  // =========================================================

  validateBusNumber(): boolean {

    const value =
      this.busForm.bus_number
        .trim()
        .toUpperCase();

    this.busForm.bus_number = value;

    if (!value) {

      this.busNumberError =
        'Bus number is required.';

      return false;

    }

    const pattern =
      /^[A-Z]{2}-[0-9]{1,2}-[A-Z]{1,3}-[0-9]{1,4}$/;

    if (!pattern.test(value)) {

      this.busNumberError =
        'Enter a valid bus number, e.g. KL-08-AB-1234.';

      return false;

    }

    this.busNumberError = '';

    return true;

  }


  // =========================================================
  // BUS NAME VALIDATION
  // =========================================================

  validateBusName(): boolean {

    const value =
      this.busForm.bus_name.trim();

    this.busForm.bus_name = value;

    if (!value) {

      this.busNameError =
        'Bus name is required.';

      return false;

    }

    if (value.length < 3) {

      this.busNameError =
        'Bus name must contain at least 3 characters.';

      return false;

    }

    if (value.length > 100) {

      this.busNameError =
        'Bus name cannot exceed 100 characters.';

      return false;

    }

    if (!/[A-Za-z]/.test(value)) {

      this.busNameError =
        'Bus name must contain at least one letter.';

      return false;

    }

    this.busNameError = '';

    return true;

  }


  // =========================================================
  // BUS TYPE VALIDATION
  // =========================================================

  validateBusType(): boolean {

    const allowedTypes = [
      'AC',
      'NON_AC',
      'SLEEPER',
      'SEATER'
    ];

    if (
      !allowedTypes.includes(
        this.busForm.bus_type
      )
    ) {

      this.busTypeError =
        'Please select a valid bus type.';

      return false;

    }

    this.busTypeError = '';

    return true;

  }


  // =========================================================
  // TOTAL SEATS VALIDATION
  // =========================================================

  validateTotalSeats(): boolean {

    const seats =
      Number(this.busForm.total_seats);


    // Required
    if (
      this.busForm.total_seats === null ||
      this.busForm.total_seats === undefined ||
      Number.isNaN(seats)
    ) {

      this.totalSeatsError =
        'Total seats is required.';

      return false;

    }


    // Must be a valid number
    if (!Number.isFinite(seats)) {

      this.totalSeatsError =
        'Please enter a valid number.';

      return false;

    }


    // Must be integer
    if (!Number.isInteger(seats)) {

      this.totalSeatsError =
        'Total seats must be a whole number.';

      return false;

    }


    // Minimum
    if (seats < 10) {

      this.totalSeatsError =
        'Total seats must be at least 10.';

      return false;

    }


    // Maximum
    if (seats > 100) {

      this.totalSeatsError =
        'Total seats cannot exceed 100.';

      return false;

    }


    // Check seats per row
    const seatsPerRow =
      Number(this.busForm.seats_per_row);


    if (
      seatsPerRow &&
      seats % seatsPerRow !== 0
    ) {

      this.totalSeatsError =
        `For ${seatsPerRow} seats per row, total seats must be divisible by ${seatsPerRow}.`;

      return false;

    }


    this.busForm.total_seats = seats;

    this.totalSeatsError = '';

    return true;

  }


  // =========================================================
  // SEATS PER ROW VALIDATION
  // =========================================================

  validateSeatsPerRow(): boolean {

    const value =
      String(this.busForm.seats_per_row);


    const allowedRows = [
      '3',
      '4',
      '5'
    ];


    if (!allowedRows.includes(value)) {

      this.seatsPerRowError =
        'Please select 3, 4, or 5 seats per row.';

      return false;

    }


    this.seatsPerRowError = '';


    // Revalidate total seats
    this.validateTotalSeats();


    return true;

  }


  // =========================================================
  // COMPLETE FORM VALIDATION
  // =========================================================

  validateForm(): boolean {

    const busNumberValid =
      this.validateBusNumber();


    const busNameValid =
      this.validateBusName();


    const busTypeValid =
      this.validateBusType();


    const seatsPerRowValid =
      this.validateSeatsPerRow();


    const totalSeatsValid =
      this.validateTotalSeats();


    return (

      busNumberValid &&

      busNameValid &&

      busTypeValid &&

      seatsPerRowValid &&

      totalSeatsValid

    );

  }


  // =========================================================
  // CHECK FORM VALID
  // =========================================================

  isFormValid(): boolean {

    const busNumber =
      this.busForm.bus_number
        .trim()
        .toUpperCase();


    const busName =
      this.busForm.bus_name.trim();


    const seats =
      Number(this.busForm.total_seats);


    const seatsPerRow =
      Number(this.busForm.seats_per_row);


    // Bus number
    const busNumberValid =
      /^[A-Z]{2}-[0-9]{1,2}-[A-Z]{1,3}-[0-9]{1,4}$/
        .test(busNumber);


    // Bus name
    const busNameValid =
      busName.length >= 3 &&
      busName.length <= 100 &&
      /[A-Za-z]/.test(busName);


    // Bus type
    const busTypeValid =
      [
        'AC',
        'NON_AC',
        'SLEEPER',
        'SEATER'
      ].includes(
        this.busForm.bus_type
      );


    // Total seats
    const totalSeatsValid =
      Number.isFinite(seats) &&
      Number.isInteger(seats) &&
      seats >= 10 &&
      seats <= 100;


    // Seats per row
    const seatsPerRowValid =
      [3, 4, 5].includes(
        seatsPerRow
      );


    // Layout
    const layoutValid =
      totalSeatsValid &&
      seatsPerRowValid &&
      seats % seatsPerRow === 0;


    return (

      busNumberValid &&

      busNameValid &&

      busTypeValid &&

      totalSeatsValid &&

      seatsPerRowValid &&

      layoutValid

    );

  }


  // =========================================================
  // SAVE BUS
  // =========================================================

  saveBus(): void {

    // Prevent double click
    if (this.saving) {

      return;

    }


    // IMPORTANT:
    // Run validation so errors are displayed
    const valid =
      this.validateForm();


    if (!valid) {

      return;

    }


    // Clean data
    this.busForm.bus_number =
      this.busForm.bus_number
        .trim()
        .toUpperCase();


    this.busForm.bus_name =
      this.busForm.bus_name.trim();


    this.busForm.total_seats =
      Number(
        this.busForm.total_seats
      );


    this.busForm.seats_per_row =
      String(
        this.busForm.seats_per_row
      );


    this.saving = true;


    // =======================================================
    // UPDATE
    // =======================================================

    if (
      this.editing &&
      this.editingBusId !== null
    ) {

      this.authService
        .updateAdminBus(
          this.editingBusId,
          this.busForm
        )
        .subscribe({

          next: () => {

            alert(
              'Bus updated successfully.'
            );

            this.saving = false;

            this.cancelForm();

            this.loadBuses();

          },

          error: (error) => {

            console.error(
              'UPDATE BUS ERROR:',
              error
            );

            this.saving = false;

            this.handleBackendError(
              error,
              'Unable to update bus.'
            );

            this.cdr.detectChanges();

          }

        });

      return;

    }


    // =======================================================
    // ADD
    // =======================================================

    this.authService
      .addAdminBus(
        this.busForm
      )
      .subscribe({

        next: () => {

          alert(
            'Bus added successfully.'
          );

          this.saving = false;

          this.cancelForm();

          this.loadBuses();

        },

        error: (error) => {

          console.error(
            'ADD BUS ERROR:',
            error
          );

          this.saving = false;

          this.handleBackendError(
            error,
            'Unable to add bus.'
          );

          this.cdr.detectChanges();

        }

      });

  }


  // =========================================================
  // BACKEND ERROR HANDLER
  // =========================================================

  private handleBackendError(
    error: any,
    defaultMessage: string
  ): void {

    const backendError =
      error?.error;


    // Bus number
    if (
      backendError?.bus_number
    ) {

      const message =
        Array.isArray(
          backendError.bus_number
        )
          ? backendError.bus_number[0]
          : backendError.bus_number;


      this.busNumberError =
        String(message);


      return;

    }


    // Bus name
    if (
      backendError?.bus_name
    ) {

      const message =
        Array.isArray(
          backendError.bus_name
        )
          ? backendError.bus_name[0]
          : backendError.bus_name;


      this.busNameError =
        String(message);


      return;

    }


    // Bus type
    if (
      backendError?.bus_type
    ) {

      const message =
        Array.isArray(
          backendError.bus_type
        )
          ? backendError.bus_type[0]
          : backendError.bus_type;


      this.busTypeError =
        String(message);


      return;

    }


    // Total seats
    if (
      backendError?.total_seats
    ) {

      const message =
        Array.isArray(
          backendError.total_seats
        )
          ? backendError.total_seats[0]
          : backendError.total_seats;


      this.totalSeatsError =
        String(message);


      return;

    }


    // Seats per row
    if (
      backendError?.seats_per_row
    ) {

      const message =
        Array.isArray(
          backendError.seats_per_row
        )
          ? backendError.seats_per_row[0]
          : backendError.seats_per_row;


      this.seatsPerRowError =
        String(message);


      return;

    }


    // General error
    alert(

      backendError?.error ||

      backendError?.detail ||

      backendError?.message ||

      defaultMessage

    );

  }


  // =========================================================
  // CLEAR VALIDATION
  // =========================================================

  clearValidation(): void {

    this.busNumberError = '';

    this.busNameError = '';

    this.busTypeError = '';

    this.totalSeatsError = '';

    this.seatsPerRowError = '';

  }


  // =========================================================
  // CANCEL FORM
  // =========================================================

  cancelForm(): void {

    this.showForm = false;

    this.editing = false;

    this.editingBusId = null;

    this.saving = false;

    this.clearValidation();


    this.busForm = {

      bus_number: '',

      bus_name: '',

      bus_type: 'AC',

      total_seats: 40,

      seats_per_row: '4',

      operator: null

    };

  }


  // =========================================================
  // DELETE BUS
  // =========================================================

  deleteBus(bus: any): void {

    if (
      !confirm(
        `Delete ${bus.bus_name}?`
      )
    ) {

      return;

    }


    this.authService
      .deleteAdminBus(
        bus.id
      )
      .subscribe({

        next: () => {

          alert(
            'Bus deleted successfully.'
          );

          this.loadBuses();

        },

        error: (error) => {

          console.error(
            'DELETE BUS ERROR:',
            error
          );


          alert(

            error?.error?.error ||

            error?.error?.detail ||

            'Unable to delete bus.'

          );

        }

      });

  }


  // =========================================================
  // TOGGLE STATUS
  // =========================================================

  toggleStatus(bus: any): void {

    this.authService
      .toggleBusStatus(
        bus.id
      )
      .subscribe({

        next: () => {

          alert(

            bus.is_active

              ? 'Bus deactivated successfully.'

              : 'Bus activated successfully.'

          );


          this.loadBuses();

        },

        error: (error) => {

          console.error(
            'STATUS ERROR:',
            error
          );


          alert(

            error?.error?.error ||

            error?.error?.detail ||

            'Unable to change bus status.'

          );

        }

      });

  }



  // =========================================================
  // APPROVE BUS
  // =========================================================

  approveBus(bus: any): void {

    if (!confirm(`Approve ${bus.bus_name}?`)) {
      return;
    }

    this.authService.approveBus(bus.id).subscribe({

      next: () => {
        alert('Bus approved successfully.');
        this.loadBuses();
      },

      error: (error) => {
        console.error('APPROVE BUS ERROR:', error);
        alert(
          error?.error?.error ||
          error?.error?.detail ||
          'Unable to approve bus.'
        );
      }

    });

  }


  // =========================================================
  // REJECT BUS
  // =========================================================

  rejectBus(bus: any): void {

    const reason = prompt(
      'Enter the reason for rejecting this bus:'
    );

    if (reason === null) {
      return;
    }

    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      alert('Rejection reason is required.');
      return;
    }

    this.authService
      .rejectBus(bus.id, trimmedReason)
      .subscribe({

        next: () => {
          alert('Bus rejected successfully.');
          this.loadBuses();
        },

        error: (error) => {
          console.error('REJECT BUS ERROR:', error);
          alert(
            error?.error?.error ||
            error?.error?.detail ||
            'Unable to reject bus.'
          );
        }

      });

  }

}