import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { BusService } from '../../core/services/bus';

@Component({
  selector: 'app-passenger-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './passenger-details.html',
  styleUrl: './passenger-details.css'
})
export class PassengerDetailsComponent implements OnInit {

  // ==========================================
  // BOOKING INFORMATION
  // ==========================================

  scheduleId: number = 0;
  fromStopId: number = 0;
  toStopId: number = 0;
  busId: number = 0;
fromStopName: string = '';
toStopName: string = '';
fare: number = 0;
travelDate: string = '';
  selectedSeatIds: number[] = [];

  passengers: any[] = [];

  contactNumber = '';

  // ==========================================
  // VALIDATION ERRORS
  // ==========================================

  contactError = '';

  passengerErrors: any[] = [];


  constructor(
    private route: ActivatedRoute,
    private busService: BusService,
    private router: Router
  ) {}


  // ==========================================
  // INITIALIZE
  // ==========================================

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      console.log(
        '========================================'
      );

      console.log(
        'PASSENGER DETAILS QUERY PARAMETERS:',
        params
      );


      // ==========================================
      // GET SCHEDULE
      // ==========================================

      this.scheduleId = Number(
        params['schedule']
      );
  this.travelDate =
    params['travel_date'] || '';

  console.log('Travel Date:', this.travelDate);

      // ==========================================
      // GET BUS
      // ==========================================

      this.busId = Number(
        params['bus']
      );


      // ==========================================
      // GET FROM STOP
      // ==========================================

      this.fromStopId = Number(
        params['from_stop']
      );


      // ==========================================
      // GET TO STOP
      // ==========================================

      this.toStopId = Number(
        params['to_stop']
      );

this.fromStopName =
  params['from_stop_name'] || '';

this.toStopName =
  params['to_stop_name'] || '';

this.fare =
  Number(params['fare']) || 0;
      // ==========================================
      // GET SELECTED SEATS
      // ==========================================

      const seats = params['seats'];


      if (seats) {

        this.selectedSeatIds = seats
          .split(',')
          .map((id: string) => Number(id))
          .filter((id: number) => !Number.isNaN(id));

      }


      // ==========================================
      // DEBUG
      // ==========================================

      console.log(
        'Schedule ID:',
        this.scheduleId
      );

      console.log(
        'Bus ID:',
        this.busId
      );

      console.log(
        'From Stop ID:',
        this.fromStopId
      );

      console.log(
        'To Stop ID:',
        this.toStopId
      );

      console.log(
        'Selected Seat IDs:',
        this.selectedSeatIds
      );


      // ==========================================
      // VALIDATE SCHEDULE
      // ==========================================

      if (
        !this.scheduleId ||
        Number.isNaN(this.scheduleId)
      ) {

        alert(
          'Schedule information is missing.'
        );

        this.router.navigate(['/home']);

        return;

      }


      // ==========================================
      // VALIDATE BUS
      // ==========================================

      if (
        !this.busId ||
        Number.isNaN(this.busId)
      ) {

        alert(
          'Bus information is missing.'
        );

        this.router.navigate(['/home']);

        return;

      }


      // ==========================================
      // VALIDATE FROM STOP
      // ==========================================

      if (
        !this.fromStopId ||
        Number.isNaN(this.fromStopId)
      ) {

        console.error(
          'FROM STOP ID IS MISSING!'
        );

        alert(
          'From stop information is missing.'
        );

        return;

      }


      // ==========================================
      // VALIDATE TO STOP
      // ==========================================

      if (
        !this.toStopId ||
        Number.isNaN(this.toStopId)
      ) {

        console.error(
          'TO STOP ID IS MISSING!'
        );

        alert(
          'To stop information is missing.'
        );

        return;

      }


      // ==========================================
      // VALIDATE SEATS
      // ==========================================

      if (
        this.selectedSeatIds.length === 0
      ) {

        alert(
          'No seats selected.'
        );

        this.router.navigate([
          '/seat-selection',
          this.scheduleId,
          this.busId
        ]);

        return;

      }


      // ==========================================
      // LOAD SEATS
      // ==========================================

      this.loadSelectedSeats();

    });

  }


  // ==========================================
  // LOAD SELECTED SEATS
  // ==========================================

  loadSelectedSeats(): void {

    this.busService
      .getSeats(
        this.busId,
        this.scheduleId,
  this.fromStopId,
  this.toStopId,
  this.travelDate
      )
      .subscribe({

        next: (data: any[]) => {

          console.log(
            'SEAT API RESPONSE:',
            data
          );


          const selectedSeats =
            data.filter(seat =>
              this.selectedSeatIds.includes(
                Number(seat.id)
              )
            );


          // ========================================
          // CHECK SELECTED SEATS
          // ========================================

          if (
            selectedSeats.length === 0
          ) {

            alert(
              'Selected seats are no longer available.'
            );

            this.router.navigate([
              '/seat-selection',
              this.scheduleId,
              this.busId
            ]);

            return;

          }


          // ========================================
          // CREATE PASSENGER OBJECTS
          // ========================================

          this.passengers =
            selectedSeats.map(seat => ({

              seatId:
                seat.id,

              seatNumber:
                seat.seat_number,

              passengerName:
                '',

              age:
                null,

              gender:
                ''

            }));


          // ========================================
          // CREATE VALIDATION OBJECTS
          // ========================================

          this.passengerErrors =
            this.passengers.map(() => ({

              name: '',
              age: '',
              gender: ''

            }));


          console.log(
            'Passenger forms:',
            this.passengers
          );

        },


        error: (error) => {

          console.error(
            'Error loading seats:',
            error
          );

          alert(
            'Unable to load selected seats. Please try again.'
          );

        }

      });

  }


  // ==========================================
  // PASSENGER NAME VALIDATION
  // ==========================================

  validateName(index: number): void {

    if (!this.passengerErrors[index]) {

      this.passengerErrors[index] = {

        name: '',
        age: '',
        gender: ''

      };

    }


    const name =
      this.passengers[index]
        .passengerName
        ?.trim();


    this.passengerErrors[index].name = '';


    if (!name) {

      this.passengerErrors[index].name =
        'Passenger name is required.';

      return;

    }


    if (name.length < 3) {

      this.passengerErrors[index].name =
        'Name must contain at least 3 characters.';

      return;

    }


    const namePattern =
      /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/;


    if (!namePattern.test(name)) {

      this.passengerErrors[index].name =
        'Name can contain letters and spaces only.';

    }

  }


  // ==========================================
  // AGE VALIDATION
  // ==========================================

  validateAge(index: number): void {

    if (!this.passengerErrors[index]) {

      this.passengerErrors[index] = {

        name: '',
        age: '',
        gender: ''

      };

    }


    const age =
      this.passengers[index].age;


    this.passengerErrors[index].age = '';


    if (
      age === null ||
      age === undefined ||
      age === ''
    ) {

      this.passengerErrors[index].age =
        'Age is required.';

      return;

    }


    const numericAge =
      Number(age);


    if (!Number.isInteger(numericAge)) {

      this.passengerErrors[index].age =
        'Age must be a whole number.';

      return;

    }


    if (
      numericAge < 1 ||
      numericAge > 100
    ) {

      this.passengerErrors[index].age =
        'Age must be between 1 and 100.';

    }

  }


  // ==========================================
  // GENDER VALIDATION
  // ==========================================

  validateGender(index: number): void {

    if (!this.passengerErrors[index]) {

      this.passengerErrors[index] = {

        name: '',
        age: '',
        gender: ''

      };

    }


    this.passengerErrors[index].gender = '';


    if (!this.passengers[index].gender) {

      this.passengerErrors[index].gender =
        'Please select gender.';

    }

  }


  // ==========================================
  // CONTACT NUMBER VALIDATION
  // ==========================================

  validateContact(): void {

    this.contactError = '';


    const phone =
      this.contactNumber?.trim();


    if (!phone) {

      this.contactError =
        'Contact number is required.';

      return;

    }


    const phonePattern =
      /^[6-9][0-9]{9}$/;


    if (!phonePattern.test(phone)) {

      this.contactError =
        'Enter a valid 10-digit mobile number.';

    }

  }


  // ==========================================
  // OLD VALIDATION METHODS
  // ==========================================

  isValidPassengerName(
    name: string
  ): boolean {

    if (!name) {
      return false;
    }


    const trimmedName =
      name.trim();


    if (trimmedName.length < 3) {
      return false;
    }


    const namePattern =
      /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/;


    return namePattern.test(
      trimmedName
    );

  }


  isValidAge(
    age: any
  ): boolean {

    if (
      age === null ||
      age === undefined ||
      age === ''
    ) {

      return false;

    }


    const numericAge =
      Number(age);


    return (
      Number.isInteger(numericAge) &&
      numericAge >= 1 &&
      numericAge <= 100
    );

  }


  isValidContactNumber(): boolean {

    if (!this.contactNumber) {
      return false;
    }


    const phonePattern =
      /^[6-9][0-9]{9}$/;


    return phonePattern.test(
      this.contactNumber.trim()
    );

  }


  // ==========================================
  // CONTINUE TO BOOKING
  // ==========================================

  continueToPayment(): void {

    // ==========================================
    // CLEAR OLD ERRORS
    // ==========================================

    this.contactError = '';

    this.passengerErrors =
      this.passengers.map(() => ({

        name: '',
        age: '',
        gender: ''

      }));


    // ==========================================
    // VALIDATE CONTACT
    // ==========================================

    this.validateContact();


    // ==========================================
    // VALIDATE PASSENGERS
    // ==========================================

    this.passengers.forEach(
      (_, index) => {

        this.validateName(index);

        this.validateAge(index);

        this.validateGender(index);

      }
    );


    // ==========================================
    // CHECK PASSENGER ERRORS
    // ==========================================

    const hasPassengerErrors =
      this.passengerErrors.some(
        error =>
          error.name ||
          error.age ||
          error.gender
      );


    if (
      this.contactError ||
      hasPassengerErrors
    ) {

      return;

    }


    // ==========================================
    // CHECK PASSENGERS
    // ==========================================

    if (
      this.passengers.length === 0
    ) {

      alert(
        'No passenger details found.'
      );

      return;

    }


    // ==========================================
    // CHECK SEATS
    // ==========================================

    for (
      const passenger of this.passengers
    ) {

      if (!passenger.seatId) {

        alert(
          `Seat information is missing for passenger ${passenger.seatNumber}.`
        );

        return;

      }

    }


    // ==========================================
    // CHECK STOP INFORMATION AGAIN
    // ==========================================

    if (
      !this.fromStopId ||
      Number.isNaN(this.fromStopId)
    ) {

      alert(
        'From stop information is missing.'
      );

      console.error(
        'Cannot continue. fromStopId:',
        this.fromStopId
      );

      return;

    }


    if (
      !this.toStopId ||
      Number.isNaN(this.toStopId)
    ) {

      alert(
        'To stop information is missing.'
      );

      console.error(
        'Cannot continue. toStopId:',
        this.toStopId
      );

      return;

    }


    // ==========================================
    // ALL VALIDATIONS PASSED
    // ==========================================

    console.log(
      '========================================'
    );

    console.log(
      'PASSENGER DETAILS:',
      this.passengers
    );

    console.log(
      'CONTACT NUMBER:',
      this.contactNumber
    );

    console.log(
      'SCHEDULE ID:',
      this.scheduleId
    );

    console.log(
      'FROM STOP ID:',
      this.fromStopId
    );

    console.log(
      'TO STOP ID:',
      this.toStopId
    );

    console.log(
      'BUS ID:',
      this.busId
    );

    console.log(
      '========================================'
    );


    // ==========================================
    // STORE PASSENGER DETAILS
    // ==========================================

    sessionStorage.setItem(
      'passengerDetails',
      JSON.stringify(
        this.passengers
      )
    );


    // ==========================================
    // STORE CONTACT NUMBER
    // ==========================================

    sessionStorage.setItem(
      'contactNumber',
      this.contactNumber.trim()
    );


    // ==========================================
    // STORE STOP INFORMATION
    // ==========================================

    sessionStorage.setItem(
      'bookingStops',
      JSON.stringify({

        schedule:
          this.scheduleId,

        from_stop:
          this.fromStopId,

        to_stop:
          this.toStopId,
          
    travel_date: this.travelDate

      })
    );


    // ==========================================
    // GO TO BOOKING CONFIRMATION
    // ==========================================

    console.log(
      'Navigating to booking with:',
      {
        schedule: this.scheduleId,
        from_stop: this.fromStopId,
        to_stop: this.toStopId,
        from_stop_name: this.fromStopName,
    to_stop_name: this.toStopName,
    travel_date: this.travelDate,
    fare: this.fare
  }
    );


    this.router.navigate(
      ['/booking'],
      {
        queryParams: {

          schedule:
            this.scheduleId,

          from_stop:
            this.fromStopId,

          to_stop:
            this.toStopId,

             from_stop_name:
        this.fromStopName,

      to_stop_name:
        this.toStopName,
        travel_date: this.travelDate,

      fare:
        this.fare


        }

      }
    );

  }


  // ==========================================
  // GO BACK
  // ==========================================

  goBack(): void {

    this.router.navigate(
      [
        '/seat-selection',
        this.scheduleId,
        this.busId
      ],
      {
        queryParams: {

          from_stop:
            this.fromStopId,

          to_stop:
            this.toStopId

        }

      }
    );

  }

}