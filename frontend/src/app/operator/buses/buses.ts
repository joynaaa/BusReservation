import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { BusService } from '../../core/services/bus';


@Component({
  selector: 'app-buses',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './buses.html',

  styleUrl: './buses.css'
})


export class BusesComponent implements OnInit {


  // =====================================================
  // VARIABLES
  // =====================================================

  buses: any[] = [];


  showForm = false;

  editMode = false;

  editingBusId: number | null = null;


  saving = false;


  // =====================================================
  // VALIDATION ERRORS
  // =====================================================

  busNumberError = '';

  busNameError = '';

  busTypeError = '';

  totalSeatsError = '';

  seatsPerRowError = '';

  formError = '';


  // =====================================================
  // VEHICLE DOCUMENTS
  // =====================================================

  vehicle_rc: File | null = null;

  insurance_certificate: File | null = null;

  fitness_certificate: File | null = null;

  existingVehicleRc: string | null = null;

  existingInsuranceCertificate: string | null = null;

  existingFitnessCertificate: string | null = null;

  vehicleRcError = '';

  insuranceError = '';

  fitnessError = '';


  // =====================================================
  // BUS OBJECT
  // =====================================================

  bus: {
    bus_number: string;
    bus_name: string;
    bus_type: string;
    total_seats: number;
    seats_per_row: string;
    vehicle_rc: File | null;
    insurance_certificate: File | null;
    fitness_certificate: File | null;
  } = {

    bus_number: '',

    bus_name: '',

    bus_type: 'AC',

    total_seats: 40,

    seats_per_row: '4',

    vehicle_rc: null,

    insurance_certificate: null,

    fitness_certificate: null

  };


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

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


  // =====================================================
  // LOAD BUSES
  // =====================================================

  loadBuses(): void {

    console.log(
      'Loading operator buses...'
    );


    this.busService
      .getOperatorBuses()
      .subscribe({

        next: (data) => {

          console.log(
            'Operator buses:',
            data
          );


          this.buses = data;


          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'Error loading buses:',
            error
          );

        }

      });

  }


  // =====================================================
  // OPEN ADD FORM
  // =====================================================

  openAddForm(): void {

    this.editMode = false;

    this.editingBusId = null;

    this.saving = false;

    this.resetValidation();

    this.vehicle_rc = null;

    this.insurance_certificate = null;

    this.fitness_certificate = null;

    this.existingVehicleRc = null;

    this.existingInsuranceCertificate = null;

    this.existingFitnessCertificate = null;

    this.bus = {

      bus_number: '',

      bus_name: '',

      bus_type: 'AC',

      total_seats: 40,

      seats_per_row: '4',

      vehicle_rc: null,

      insurance_certificate: null,

      fitness_certificate: null

    };

    this.showForm = true;

  }


  // =====================================================
  // EDIT BUS
  // =====================================================

  editBus(item: any): void {

    this.editMode = true;

    this.editingBusId = item.id;

    this.saving = false;

    this.resetValidation();

    this.vehicle_rc = null;

    this.insurance_certificate = null;

    this.fitness_certificate = null;

    this.existingVehicleRc = item.vehicle_rc || null;

    this.existingInsuranceCertificate =
      item.insurance_certificate || null;

    this.existingFitnessCertificate =
      item.fitness_certificate || null;

    this.bus = {

      bus_number:
        item.bus_number || '',

      bus_name:
        item.bus_name || '',

      bus_type:
        item.bus_type || 'AC',

      total_seats:
        Number(item.total_seats) || 40,

      seats_per_row:
        String(item.seats_per_row || '4'),

      vehicle_rc: null,

      insurance_certificate: null,

      fitness_certificate: null

    };

    this.showForm = true;

  }


  // =====================================================
  // BUS NUMBER INPUT
  // =====================================================

  onBusNumberInput(): void {

    this.bus.bus_number =
      this.bus.bus_number
        .toUpperCase()
        .replace(/\s+/g, '');


    this.validateBusNumber();

  }


  // =====================================================
  // VALIDATE BUS NUMBER
  // =====================================================

  validateBusNumber(): boolean {

    const busNumber =
      this.bus.bus_number
        .trim()
        .toUpperCase();


    this.bus.bus_number =
      busNumber;


    // -------------------------------------------------
    // REQUIRED
    // -------------------------------------------------

    if (!busNumber) {

      this.busNumberError =
        'Bus number is required.';

      return false;

    }


    // -------------------------------------------------
    // FORMAT
    // -------------------------------------------------

    const pattern =
      /^[A-Z]{2}-[0-9]{1,2}-[A-Z]{1,3}-[0-9]{1,4}$/;


    if (!pattern.test(busNumber)) {

      this.busNumberError =
        'Enter a valid bus number. Example: KL-08-AB-1234.';

      return false;

    }


    this.busNumberError = '';

    return true;

  }


  // =====================================================
  // VALIDATE BUS NAME
  // =====================================================

  validateBusName(): boolean {

    const name =
      this.bus.bus_name
        .trim();


    this.bus.bus_name =
      name;


    if (!name) {

      this.busNameError =
        'Bus name is required.';

      return false;

    }


    if (name.length < 3) {

      this.busNameError =
        'Bus name must contain at least 3 characters.';

      return false;

    }


    if (name.length > 100) {

      this.busNameError =
        'Bus name cannot exceed 100 characters.';

      return false;

    }


    // Prevent only numbers/symbols

    if (
      !/[A-Za-z]/.test(name)
    ) {

      this.busNameError =
        'Bus name must contain letters.';

      return false;

    }


    this.busNameError = '';

    return true;

  }


  // =====================================================
  // VALIDATE BUS TYPE
  // =====================================================

  validateBusType(): boolean {

    const allowedTypes = [

      'AC',

      'NON_AC',

      'SLEEPER',

      'SEATER'

    ];


    if (
      !allowedTypes.includes(
        this.bus.bus_type
      )
    ) {

      this.busTypeError =
        'Please select a valid bus type.';

      return false;

    }


    this.busTypeError = '';

    return true;

  }


  // =====================================================
  // VALIDATE TOTAL SEATS
  // =====================================================

  validateTotalSeats(): boolean {

    const seats =
      Number(
        this.bus.total_seats
      );


    // -------------------------------------------------
    // REQUIRED
    // -------------------------------------------------

    if (
  this.bus.total_seats === null ||
  this.bus.total_seats === undefined ||
  Number.isNaN(Number(this.bus.total_seats))
) {

  this.totalSeatsError =
    'Total seats is required.';

  return false;

}


    // -------------------------------------------------
    // INTEGER
    // -------------------------------------------------

    if (
      !Number.isInteger(seats)
    ) {

      this.totalSeatsError =
        'Total seats must be a whole number.';

      return false;

    }


    // -------------------------------------------------
    // RANGE
    // -------------------------------------------------

    if (seats < 10) {

      this.totalSeatsError =
        'Total seats must be at least 10.';

      return false;

    }


    if (seats > 100) {

      this.totalSeatsError =
        'Total seats cannot exceed 100.';

      return false;

    }


    // -------------------------------------------------
    // ROW COMPATIBILITY
    // -------------------------------------------------

    const seatsPerRow =
      Number(
        this.bus.seats_per_row
      );


    if (
      seatsPerRow &&
      seats % seatsPerRow !== 0
    ) {

      this.totalSeatsError =
        `Total seats must be divisible by ${seatsPerRow} seats per row.`;

      return false;

    }


    this.totalSeatsError = '';

    return true;

  }


  // =====================================================
  // VALIDATE SEATS PER ROW
  // =====================================================

  validateSeatsPerRow(): boolean {

    const allowedRows = [

      '3',

      '4',

      '5'

    ];


    if (
      !allowedRows.includes(
        String(this.bus.seats_per_row)
      )
    ) {

      this.seatsPerRowError =
        'Please select seats per row.';

      return false;

    }


    this.seatsPerRowError = '';


    // Re-check total seats

    this.validateTotalSeats();


    return true;

  }


  // =====================================================
  // VALIDATE COMPLETE FORM
  // =====================================================

  isFormValid(): boolean {

    const busNumberValid =
      this.validateBusNumber();

    const busNameValid =
      this.validateBusName();

    const busTypeValid =
      this.validateBusType();

    const seatsValid =
      this.validateTotalSeats();

    const rowsValid =
      this.validateSeatsPerRow();

    const documentsValid =
      this.validateDocuments();

    return (

      busNumberValid &&

      busNameValid &&

      busTypeValid &&

      seatsValid &&

      rowsValid &&

      documentsValid

    );

  }


  // =====================================================
  // VEHICLE DOCUMENT FILE SELECTION
  // =====================================================

  onFileSelected(
    event: Event,
    documentType:
      | 'vehicle_rc'
      | 'insurance_certificate'
      | 'fitness_certificate'
  ): void {

    const input =
      event.target as HTMLInputElement;

    if (
      !input.files ||
      input.files.length === 0
    ) {
      return;
    }

    const file =
      input.files[0];

    console.log(
      'Selected document:',
      documentType,
      file.name,
      file.size,
      file.type
    );

    // Reset related error
    if (documentType === 'vehicle_rc') {
      this.vehicleRcError = '';
    }

    if (documentType === 'insurance_certificate') {
      this.insuranceError = '';
    }

    if (documentType === 'fitness_certificate') {
      this.fitnessError = '';
    }

    // Allowed file types
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];

    if (!allowedTypes.includes(file.type)) {

      const message =
        'Only PDF, JPG, JPEG or PNG files are allowed.';

      if (documentType === 'vehicle_rc') {
        this.vehicleRcError = message;
      }

      if (documentType === 'insurance_certificate') {
        this.insuranceError = message;
      }

      if (documentType === 'fitness_certificate') {
        this.fitnessError = message;
      }

      input.value = '';

      return;
    }

    // Maximum 5 MB
    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {

      const message =
        'File size must not exceed 5 MB.';

      if (documentType === 'vehicle_rc') {
        this.vehicleRcError = message;
      }

      if (documentType === 'insurance_certificate') {
        this.insuranceError = message;
      }

      if (documentType === 'fitness_certificate') {
        this.fitnessError = message;
      }

      input.value = '';

      return;
    }

    // Store selected file
    if (documentType === 'vehicle_rc') {

      this.vehicle_rc = file;

      this.bus.vehicle_rc = file;

    }

    if (documentType === 'insurance_certificate') {

      this.insurance_certificate = file;

      this.bus.insurance_certificate = file;

    }

    if (documentType === 'fitness_certificate') {

      this.fitness_certificate = file;

      this.bus.fitness_certificate = file;

    }

  }


  // =====================================================
  // VALIDATE VEHICLE DOCUMENTS
  // =====================================================

  validateDocuments(): boolean {

    let valid = true;

    // -----------------------------------------------------
    // ADD MODE
    // -----------------------------------------------------

    if (!this.editMode) {

      if (!this.vehicle_rc) {

        this.vehicleRcError =
          'Vehicle RC is required.';

        valid = false;

      }

      if (!this.insurance_certificate) {

        this.insuranceError =
          'Insurance certificate is required.';

        valid = false;

      }

      if (!this.fitness_certificate) {

        this.fitnessError =
          'Fitness certificate is required.';

        valid = false;

      }

    }

    // -----------------------------------------------------
    // EDIT MODE
    // -----------------------------------------------------

    else {

      if (
        !this.vehicle_rc &&
        !this.existingVehicleRc
      ) {

        this.vehicleRcError =
          'Vehicle RC is required.';

        valid = false;

      }

      if (
        !this.insurance_certificate &&
        !this.existingInsuranceCertificate
      ) {

        this.insuranceError =
          'Insurance certificate is required.';

        valid = false;

      }

      if (
        !this.fitness_certificate &&
        !this.existingFitnessCertificate
      ) {

        this.fitnessError =
          'Fitness certificate is required.';

        valid = false;

      }

    }

    return valid;

  }


  // =====================================================
  // SAVE BUS
  // =====================================================

  saveBus(): void {

    // -------------------------------------------------
    // CLEAR GENERAL ERROR
    // -------------------------------------------------

    this.formError = '';


    // -------------------------------------------------
    // VALIDATE EVERYTHING
    // -------------------------------------------------

    if (
      !this.isFormValid()
    ) {

      this.formError =
        'Please correct the highlighted fields before saving.';

      return;

    }


    // -------------------------------------------------
    // PREVENT DOUBLE SUBMISSION
    // -------------------------------------------------

    if (this.saving) {

      return;

    }


    this.saving = true;


    // -------------------------------------------------
    // PREPARE DATA
    // -------------------------------------------------

    this.bus.bus_number =
      this.bus.bus_number
        .trim()
        .toUpperCase();


    this.bus.bus_name =
      this.bus.bus_name
        .trim();


    this.bus.total_seats =
      Number(
        this.bus.total_seats
      );


    this.bus.seats_per_row =
      String(
        this.bus.seats_per_row
      );

    // Keep selected files attached to the object
    // sent to BusService.
    this.bus.vehicle_rc =
      this.vehicle_rc;

    this.bus.insurance_certificate =
      this.insurance_certificate;

    this.bus.fitness_certificate =
      this.fitness_certificate;


    console.log(
      'Saving bus:',
      this.bus
    );


    // =================================================
    // UPDATE
    // =================================================

    if (
      this.editMode &&
      this.editingBusId !== null
    ) {

      console.log(
        'Updating bus:',
        this.editingBusId
      );


      this.busService
        .updateOperatorBus(
          this.editingBusId,
          this.bus
        )
        .subscribe({

          next: (response) => {

            console.log(
              'Bus updated:',
              response
            );


            alert(
              'Bus updated and submitted for admin approval.'
            );


            this.saving = false;

            this.showForm = false;

            this.editMode = false;

            this.editingBusId = null;


            this.loadBuses();

          },


          error: (error) => {

            console.error(
              'Update bus error:',
              error
            );


            this.saving = false;


            const message =
              error?.error?.error ||

              error?.error?.message ||

              error?.error?.bus_number?.[0] ||

              'Failed to update bus.';


            this.formError =
              message;

          }

        });


      return;

    }


    // =================================================
    // ADD
    // =================================================

    console.log(
      'Adding new bus:',
      this.bus
    );


    this.busService
      .addOperatorBus(
        this.bus
      )
      .subscribe({

        next: (response) => {

          console.log(
            'Bus added:',
            response
          );


          alert(
            'Bus submitted for admin approval.'
          );


          this.saving = false;

          this.showForm = false;


          this.loadBuses();

        },


        error: (error) => {

          console.error(
            'Add bus error:',
            error
          );


          this.saving = false;


          // -------------------------------------------
          // BACKEND VALIDATION
          // -------------------------------------------

          if (
            error?.error?.bus_number
          ) {

            this.busNumberError =
              Array.isArray(
                error.error.bus_number
              )
                ? error.error.bus_number[0]
                : error.error.bus_number;

          }


          const message =
            error?.error?.error ||

            error?.error?.message ||

            'Failed to add bus.';


          this.formError =
            message;

        }

      });

  }


  // =====================================================
  // DELETE BUS
  // =====================================================

  deleteBus(
    id: number
  ): void {

    const confirmDelete =
      confirm(
        'Are you sure you want to delete this bus?'
      );


    if (!confirmDelete) {

      return;

    }


    console.log(
      'Deleting bus:',
      id
    );


    this.busService
      .deleteOperatorBus(id)
      .subscribe({

        next: (response) => {

          console.log(
            'Bus deleted:',
            response
          );


          alert(
            'Bus deleted successfully.'
          );


          this.loadBuses();

        },


        error: (error) => {

          console.error(
            'Delete bus error:',
            error
          );


          const message =
            error?.error?.error ||

            error?.error?.message ||

            'Failed to delete bus.';


          alert(message);

        }

      });

  }


  // =====================================================
  // CANCEL
  // =====================================================

  cancelForm(): void {

    if (this.saving) {

      return;

    }


    this.showForm = false;

    this.editMode = false;

    this.editingBusId = null;

    this.saving = false;

    this.vehicle_rc = null;

    this.insurance_certificate = null;

    this.fitness_certificate = null;

    this.existingVehicleRc = null;

    this.existingInsuranceCertificate = null;

    this.existingFitnessCertificate = null;


    this.resetValidation();

  }


  // =====================================================
  // RESET VALIDATION
  // =====================================================

  resetValidation(): void {

    this.busNumberError = '';

    this.busNameError = '';

    this.busTypeError = '';

    this.totalSeatsError = '';

    this.seatsPerRowError = '';

    this.vehicleRcError = '';

    this.insuranceError = '';

    this.fitnessError = '';

    this.formError = '';

  }


  // =====================================================
  // DASHBOARD
  // =====================================================

  goToDashboard(): void {

    this.router.navigate([
      '/operator/dashboard'
    ]);

  }

}