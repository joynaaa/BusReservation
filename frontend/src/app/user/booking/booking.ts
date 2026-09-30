import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  BookingService
} from '../../core/services/booking';


@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule
  ],
  styleUrl: './booking.css',
  templateUrl: './booking.html',
})
export class BookingComponent implements OnInit {


  // ==========================================
  // BOOKING INFORMATION
  // ==========================================

  scheduleId: number = 0;

  fromStopId: number = 0;

  toStopId: number = 0;

  fromStopName: string = '';

  toStopName: string = '';

  travelDate: string = '';

  fare: number = 0;


  // ==========================================
  // PASSENGERS
  // ==========================================

  passengers: any[] = [];


  // ==========================================
  // BOOKING RESPONSE
  // ==========================================

  booking: any = null;


  // ==========================================
  // LOADING
  // ==========================================

  loading: boolean = false;


  // ==========================================
  // ERROR
  // ==========================================

  errorMessage: string = '';


  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService
  ) {}


  // ==========================================
  // INITIALIZE
  // ==========================================

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      console.log(
        '================================='
      );

      console.log(
        'ALL BOOKING QUERY PARAMS:',
        params
      );

      console.log(
        '================================='
      );


      // ==========================================
      // GET SCHEDULE
      // ==========================================

      this.scheduleId = Number(
        params['schedule']
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


      // ==========================================
      // GET STOP NAMES
      // ==========================================

      this.fromStopName =
        params['from_stop_name'] || '';

      this.toStopName =
        params['to_stop_name'] || '';


      // ==========================================
      // GET TRAVEL DATE
      // ==========================================

      this.travelDate =
        params['travel_date'] || '';


      // ==========================================
      // GET FARE
      // ==========================================

      this.fare =
        Number(params['fare']) || 0;


      // ==========================================
      // SESSION STORAGE FALLBACK
      // ==========================================

      const storedStops =
        sessionStorage.getItem(
          'bookingStops'
        );


      if (storedStops) {

        try {

          const bookingStops =
            JSON.parse(
              storedStops
            );


          console.log(
            'BOOKING STOPS FROM SESSION STORAGE:',
            bookingStops
          );


          // ======================================
          // CHECK SCHEDULE
          // ======================================

          if (
            Number(bookingStops.schedule) ===
            this.scheduleId
          ) {


            // ====================================
            // FROM STOP
            // ====================================

            if (
              !this.fromStopId ||
              Number.isNaN(
                this.fromStopId
              )
            ) {

              this.fromStopId =
                Number(
                  bookingStops.from_stop
                );

            }


            // ====================================
            // TO STOP
            // ====================================

            if (
              !this.toStopId ||
              Number.isNaN(
                this.toStopId
              )
            ) {

              this.toStopId =
                Number(
                  bookingStops.to_stop
                );

            }


            // ====================================
            // TRAVEL DATE
            // ====================================

            if (
              !this.travelDate
            ) {

              this.travelDate =
                bookingStops.travel_date ||
                '';

            }

          }

        }

        catch (error) {

          console.error(
            'Unable to read bookingStops:',
            error
          );

        }

      }


      // ==========================================
      // FINAL VALUES
      // ==========================================

      console.log(
        '================================='
      );

      console.log(
        'FINAL BOOKING VALUES'
      );

      console.log(
        'Schedule ID:',
        this.scheduleId
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
        'From Stop Name:',
        this.fromStopName
      );

      console.log(
        'To Stop Name:',
        this.toStopName
      );

      console.log(
        'Travel Date:',
        this.travelDate
      );

      console.log(
        'Fare:',
        this.fare
      );

      console.log(
        '================================='
      );


      // ==========================================
      // LOAD PASSENGERS
      // ==========================================

      this.loadPassengerDetails();

    });

  }


  // ==========================================
  // LOAD PASSENGER DETAILS
  // ==========================================

  loadPassengerDetails(): void {

    const data =
      sessionStorage.getItem(
        'passengerDetails'
      );


    // ==========================================
    // CHECK PASSENGER DATA
    // ==========================================

    if (!data) {

      this.errorMessage =
        'Passenger details not found.';

      console.error(
        'Passenger details not found in sessionStorage.'
      );

      return;

    }


    // ==========================================
    // PARSE PASSENGER DATA
    // ==========================================

    try {

      this.passengers =
        JSON.parse(
          data
        );


      console.log(
        '================================='
      );

      console.log(
        'Passenger Details:',
        this.passengers
      );

      console.log(
        'Passenger Count:',
        this.passengers.length
      );

      console.log(
        '================================='
      );

    }

    catch (error) {

      console.error(
        'Unable to parse passenger details:',
        error
      );

      this.errorMessage =
        'Invalid passenger details.';

    }

  }


  // ==========================================
  // CONFIRM BOOKING
  // ==========================================

  confirmBooking(): void {

    this.errorMessage = '';


    // ==========================================
    // 1. SCHEDULE VALIDATION
    // ==========================================

    if (
      !this.scheduleId ||
      Number.isNaN(
        this.scheduleId
      )
    ) {

      this.errorMessage =
        'Schedule information is missing.';

      console.error(
        'Missing scheduleId:',
        this.scheduleId
      );

      return;

    }


    // ==========================================
    // 2. FROM STOP VALIDATION
    // ==========================================

    if (
      !this.fromStopId ||
      Number.isNaN(
        this.fromStopId
      )
    ) {

      this.errorMessage =
        'From stop information is missing.';

      console.error(
        'Missing fromStopId:',
        this.fromStopId
      );

      return;

    }


    // ==========================================
    // 3. TO STOP VALIDATION
    // ==========================================

    if (
      !this.toStopId ||
      Number.isNaN(
        this.toStopId
      )
    ) {

      this.errorMessage =
        'To stop information is missing.';

      console.error(
        'Missing toStopId:',
        this.toStopId
      );

      return;

    }


    // ==========================================
    // 4. TRAVEL DATE VALIDATION
    // ==========================================

    if (
      !this.travelDate ||
      this.travelDate.trim() === ''
    ) {

      this.errorMessage =
        'Travel date is missing.';

      console.error(
        'Missing travelDate:',
        this.travelDate
      );

      return;

    }


    // ==========================================
    // 5. PASSENGER VALIDATION
    // ==========================================

    if (
      !this.passengers ||
      this.passengers.length === 0
    ) {

      this.errorMessage =
        'No passengers found.';

      console.error(
        'Passenger list is empty.'
      );

      return;

    }


    // ==========================================
    // 6. CHECK PASSENGER SEATS
    // ==========================================

    for (
      const passenger of this.passengers
    ) {

      if (
        !passenger.seatId
      ) {

        this.errorMessage =
          'Seat information is missing.';

        console.error(
          'Passenger without seat:',
          passenger
        );

        return;

      }

    }


    // ==========================================
    // 7. CREATE BOOKING DATA
    // ==========================================

    const bookingData = {

      schedule:
        this.scheduleId,

      from_stop:
        this.fromStopId,

      to_stop:
        this.toStopId,

      travel_date:
        this.travelDate,

      seats:
        this.passengers.map(
          passenger => ({

            seat_id:
              passenger.seatId,

            passenger_name:
              passenger.passengerName,

            passenger_age:
              passenger.age,

            passenger_gender:
              passenger.gender

          })
        )

    };


    // ==========================================
    // 8. DEBUG BOOKING DATA
    // ==========================================

    console.log(
      '================================='
    );

    console.log(
      'BOOKING DATA:',
      bookingData
    );

    console.log(
      'Schedule:',
      bookingData.schedule
    );

    console.log(
      'From Stop:',
      bookingData.from_stop
    );

    console.log(
      'To Stop:',
      bookingData.to_stop
    );

    console.log(
      'Travel Date:',
      bookingData.travel_date
    );

    console.log(
      'Seats:',
      bookingData.seats
    );

    console.log(
      '================================='
    );


    // ==========================================
    // 9. START LOADING
    // ==========================================

    this.loading = true;


    // ==========================================
    // 10. CREATE BOOKING API CALL
    // ==========================================

    this.bookingService
      .createBooking(
        bookingData
      )
      .subscribe({

        // ======================================
        // SUCCESS
        // ======================================

        next: (
          response: any
        ) => {

          console.log(
            '================================='
          );

          console.log(
            'BOOKING SUCCESS'
          );

          console.log(
            'BOOKING RESPONSE:',
            response
          );

          console.log(
            '================================='
          );


          this.loading = false;


          // ====================================
          // CHECK BOOKING ID
          // ====================================

          if (
            !response ||
            !response.id
          ) {

            console.error(
              'Invalid booking response:',
              response
            );

            this.errorMessage =
              'Booking created, but booking ID was not received.';

            return;

          }


          // ====================================
          // STORE BOOKING
          // ====================================

          this.booking =
            response;


          console.log(
            'Booking ID:',
            response.id
          );

          console.log(
            'Amount:',
            response.total_amount
          );


          // ====================================
          // GO TO PAYMENT
          // ====================================

          this.router.navigate(
            ['/payment'],
            {
              queryParams: {

                booking:
                  response.id,

                amount:
                  response.total_amount,

                from_stop:
                  this.fromStopId,

                to_stop:
                  this.toStopId,

                from_stop_name:
                  this.fromStopName,

                to_stop_name:
                  this.toStopName,

                travel_date:
                  this.travelDate,

                fare:
                  this.fare

              }

            }

          ).then(
            success => {

              console.log(
                'Navigation to payment:',
                success
              );

            }

          );

        },


        // ======================================
        // ERROR
        // ======================================

        error: (
          error
        ) => {

          console.error(
            '================================='
          );

          console.error(
            'BOOKING ERROR:',
            error
          );

          console.error(
            'STATUS:',
            error.status
          );

          console.error(
            'ERROR BODY:',
            error.error
          );

          console.error(
            'ERROR BODY JSON:',
            JSON.stringify(
              error.error,
              null,
              2
            )
          );

          console.error(
            'DJANGO ERROR MESSAGE:',
            error.error?.error
          );

          console.error(
            '================================='
          );


          this.loading = false;


          // ====================================
          // DJANGO ERROR
          // ====================================

          if (
            error.error?.error
          ) {

            this.errorMessage =
              error.error.error;

          }

          else if (
            typeof error.error ===
            'string'
          ) {

            this.errorMessage =
              error.error;

          }

          else {

            this.errorMessage =
              'Unable to create booking. Please try again.';

          }

        }

      });

  }


  // ==========================================
  // GO TO PAYMENT
  // ==========================================

  goToPayment(): void {

    if (
      !this.booking
    ) {

      console.error(
        'Booking object is missing'
      );

      return;

    }


    this.router.navigate(
      ['/payment'],
      {
        queryParams: {

          booking:
            this.booking.id,

          amount:
            this.booking.total_amount,

          from_stop:
            this.fromStopId,

          to_stop:
            this.toStopId,

          from_stop_name:
            this.fromStopName,

          to_stop_name:
            this.toStopName,

          travel_date:
            this.travelDate,

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
        '/passenger-details'
      ],
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

          travel_date:
            this.travelDate,

          fare:
            this.fare

        }

      }
    );

  }

}