from datetime import datetime

from django.utils import timezone

from buses.models import (
    Schedule,
    RouteStop,
    StopFare,
    Seat,
)

from bookings.models import (
    Booking,
    BookedSeat,
    SeatHold,
)


# ==========================================================
# HELPER
# ==========================================================

def parse_travel_date(travel_date):
    """
    Convert YYYY-MM-DD string into Python date.
    """

    if not travel_date:
        return None

    if hasattr(travel_date, "year"):
        return travel_date

    try:
        return datetime.strptime(
            str(travel_date),
            "%Y-%m-%d"
        ).date()

    except (ValueError, TypeError):
        return None


# ==========================================================
# SEARCH BUSES
# ==========================================================

def search_available_buses(
    bus_name=None,
    source=None,
    destination=None,
    travel_date=None
):
    """
    Search buses using the real database.

    Required:
        bus_name
        source
        destination
        travel_date

    Returns actual buses from the database.
    """

    # ======================================================
    # VALIDATE BUS NAME
    # ======================================================

    if not bus_name:
        return {
            "success": False,
            "message": "Bus name is required."
        }

    # ======================================================
    # VALIDATE SOURCE
    # ======================================================

    if not source:
        return {
            "success": False,
            "message": "Source is required."
        }

    # ======================================================
    # VALIDATE DESTINATION
    # ======================================================

    if not destination:
        return {
            "success": False,
            "message": "Destination is required."
        }

    # ======================================================
    # VALIDATE DATE
    # ======================================================

    if not travel_date:
        return {
            "success": False,
            "message": "Travel date is required."
        }

    # ======================================================
    # PARSE DATE
    # ======================================================

    travel_date_obj = parse_travel_date(
        travel_date
    )

    if not travel_date_obj:

        return {
            "success": False,
            "message": (
                "Invalid date format. "
                "Use YYYY-MM-DD."
            )
        }

    # ======================================================
    # CHECK PAST DATE
    # ======================================================

    today = timezone.localdate()

    if travel_date_obj < today:

        return {
            "success": False,
            "message": (
                "Travel date cannot be in the past."
            )
        }

    # ======================================================
    # GET WEEKDAY
    # ======================================================

    day_name = travel_date_obj.strftime("%A")

    # ======================================================
    # GET ACTIVE SCHEDULES
    # ======================================================

    schedules = (
        Schedule.objects
        .filter(
            is_active=True,
            operating_days__day__iexact=day_name,
            bus__bus_name__icontains=bus_name
        )
        .select_related(
            "bus",
            "route"
        )
        .prefetch_related(
            "operating_days"
        )
        .distinct()
        .order_by("id")
    )

    results = []

    # ======================================================
    # LOOP THROUGH SCHEDULES
    # ======================================================

    for schedule in schedules:

        route = schedule.route

        # ==================================================
        # GET ROUTE STOPS
        # ==================================================

        stops = list(
            RouteStop.objects
            .filter(
                route=route
            )
            .order_by(
                "stop_order"
            )
        )

        if not stops:
            continue

        # ==================================================
        # FIND SOURCE STOP
        # ==================================================

        from_stop = next(
            (
                stop
                for stop in stops
                if stop.stop_name.strip().lower()
                == source.strip().lower()
            ),
            None
        )

        # ==================================================
        # FIND DESTINATION STOP
        # ==================================================

        to_stop = next(
            (
                stop
                for stop in stops
                if stop.stop_name.strip().lower()
                == destination.strip().lower()
            ),
            None
        )

        # ==================================================
        # STOP NOT FOUND
        # ==================================================

        if not from_stop or not to_stop:
            continue

        # ==================================================
        # INVALID JOURNEY
        # ==================================================

        if (
            from_stop.stop_order
            >=
            to_stop.stop_order
        ):
            continue

        # ==================================================
        # CALCULATE FARE
        # ==================================================

        total_fare = 0
        fare_available = True

        for stop_order in range(
            from_stop.stop_order,
            to_stop.stop_order
        ):

            current_stop = next(
                (
                    stop
                    for stop in stops
                    if stop.stop_order == stop_order
                ),
                None
            )

            next_stop = next(
                (
                    stop
                    for stop in stops
                    if stop.stop_order
                    == stop_order + 1
                ),
                None
            )

            if (
                not current_stop
                or
                not next_stop
            ):
                fare_available = False
                break

            segment_fare = (
                StopFare.objects
                .filter(
                    schedule=schedule,
                    from_stop=current_stop,
                    to_stop=next_stop
                )
                .first()
            )

            if not segment_fare:
                fare_available = False
                break

            total_fare += segment_fare.fare

        # ==================================================
        # SKIP IF FARE NOT CONFIGURED
        # ==================================================

        if not fare_available:
            continue

        # ==================================================
        # OPERATING DAYS
        # ==================================================

        operating_days = list(
            schedule.operating_days.values_list(
                "day",
                flat=True
            )
        )

        # ==================================================
        # ROUTE STOP LIST
        # ==================================================

        route_stops = []

        for stop in stops:

            route_stops.append({

                "id": stop.id,

                "name": stop.stop_name,

                "order": stop.stop_order,

                "arrival_time": (
                    stop.arrival_time.strftime("%H:%M")
                    if stop.arrival_time
                    else None
                ),

                "departure_time": (
                    stop.departure_time.strftime("%H:%M")
                    if stop.departure_time
                    else None
                ),

                "boarding": stop.is_boarding_point,

                "dropping": stop.is_dropping_point
            })

        # ==================================================
        # RESULT
        # ==================================================

        results.append({

            "schedule_id": schedule.id,

            "bus_id": schedule.bus.id,

            "bus_name": schedule.bus.bus_name,

            "bus_number": schedule.bus.bus_number,

            "bus_type": schedule.bus.bus_type,

            "total_seats": schedule.bus.total_seats,

            "seats_per_row": schedule.bus.seats_per_row,

            "route_id": route.id,

            "route_source": route.source,

            "route_destination": route.destination,

            "source": from_stop.stop_name,

            "source_stop_id": from_stop.id,

            "destination": to_stop.stop_name,

            "destination_stop_id": to_stop.id,

            "departure_time": (
                from_stop.departure_time.strftime("%H:%M")
                if from_stop.departure_time
                else None
            ),

            "arrival_time": (
                to_stop.arrival_time.strftime("%H:%M")
                if to_stop.arrival_time
                else None
            ),

            "fare": float(total_fare),

            "travel_date": str(travel_date_obj),

            "weekday": day_name,

            "operating_days": operating_days,

            "route_stops": route_stops
        })

    # ======================================================
    # RETURN
    # ======================================================

    return {

        "success": True,

        "bus_name": bus_name,

        "source": source,

        "destination": destination,

        "travel_date": str(travel_date_obj),

        "weekday": day_name,

        "count": len(results),

        "buses": results
    }


# ==========================================================
# GET AVAILABLE SEATS
# ==========================================================

def get_available_seats(
    schedule_id,
    from_stop_id,
    to_stop_id,
    travel_date
):

    # ======================================================
    # VALIDATE DATE
    # ======================================================

    travel_date_obj = parse_travel_date(
        travel_date
    )

    if not travel_date_obj:

        return {
            "success": False,
            "message": "Invalid travel date."
        }

    # ======================================================
    # GET SCHEDULE
    # ======================================================

    try:

        schedule = (
            Schedule.objects
            .select_related(
                "bus",
                "route"
            )
            .get(
                id=schedule_id
            )
        )

    except Schedule.DoesNotExist:

        return {
            "success": False,
            "message": "Schedule not found."
        }

    # ======================================================
    # GET STOPS
    # ======================================================

    try:

        from_stop = (
            RouteStop.objects
            .get(
                id=from_stop_id,
                route=schedule.route
            )
        )

        to_stop = (
            RouteStop.objects
            .get(
                id=to_stop_id,
                route=schedule.route
            )
        )

    except RouteStop.DoesNotExist:

        return {
            "success": False,
            "message": "Journey stops not found."
        }

    # ======================================================
    # CHECK STOP ORDER
    # ======================================================

    if (
        from_stop.stop_order
        >=
        to_stop.stop_order
    ):

        return {
            "success": False,
            "message": "Invalid journey segment."
        }

    # ======================================================
    # GET BUS SEATS
    # ======================================================

    seats = (
        Seat.objects
        .filter(
            bus=schedule.bus
        )
        .order_by(
            "seat_number"
        )
    )

    available_seats = []
    booked_seats = []
    held_seats = []

    # ======================================================
    # CHECK EACH SEAT
    # ======================================================

    for seat in seats:

        # ==================================================
        # BOOKED
        # ==================================================

        booked = (
            BookedSeat.objects
            .filter(
                schedule=schedule,
                seat=seat,
                booking__travel_date=travel_date_obj
            )
            .filter(
                from_stop__stop_order__lt=
                    to_stop.stop_order,

                to_stop__stop_order__gt=
                    from_stop.stop_order
            )
            .exists()
        )

        # ==================================================
        # HELD
        # ==================================================

        held = (
            SeatHold.objects
            .filter(
                schedule=schedule,
                seat=seat,
                travel_date=travel_date_obj,
                expires_at__gt=timezone.now()
            )
            .filter(
                from_stop__stop_order__lt=
                    to_stop.stop_order,

                to_stop__stop_order__gt=
                    from_stop.stop_order
            )
            .exists()
        )

        # ==================================================
        # AVAILABLE
        # ==================================================

        if not booked and not held:

            available_seats.append({

                "seat_id": seat.id,

                "seat_number": seat.seat_number,

                "seat_type": seat.seat_type,

                "status": "AVAILABLE"
            })

        elif booked:

            booked_seats.append({

                "seat_id": seat.id,

                "seat_number": seat.seat_number,

                "seat_type": seat.seat_type,

                "status": "BOOKED"
            })

        elif held:

            held_seats.append({

                "seat_id": seat.id,

                "seat_number": seat.seat_number,

                "seat_type": seat.seat_type,

                "status": "HELD"
            })

    # ======================================================
    # RETURN
    # ======================================================

    return {

        "success": True,

        "schedule_id": schedule.id,

        "bus_id": schedule.bus.id,

        "bus_name": schedule.bus.bus_name,

        "bus_number": schedule.bus.bus_number,

        "source": from_stop.stop_name,

        "source_stop_id": from_stop.id,

        "destination": to_stop.stop_name,

        "destination_stop_id": to_stop.id,

        "travel_date": str(travel_date_obj),

        "available_seats": available_seats,

        "booked_seats": booked_seats,

        "held_seats": held_seats,

        "available_count": len(
            available_seats
        ),

        "booked_count": len(
            booked_seats
        ),

        "held_count": len(
            held_seats
        )
    }


# ==========================================================
# GET USER BOOKINGS
# ==========================================================

def get_user_bookings(user):

    bookings = (
        Booking.objects
        .filter(
            user=user
        )
        .select_related(
            "schedule__bus",
            "schedule__route"
        )
        .prefetch_related(
            "booked_seats__seat",
            "booked_seats__from_stop",
            "booked_seats__to_stop"
        )
        .order_by(
            "-booking_date"
        )
    )

    result = []

    for booking in bookings:

        seats = []

        for booked_seat in (
            booking.booked_seats.all()
        ):

            seats.append({

                "seat_id": booked_seat.seat.id,

                "seat": booked_seat.seat.seat_number,

                "seat_type": booked_seat.seat.seat_type,

                "passenger_name":
                    booked_seat.passenger_name,

                "passenger_age":
                    booked_seat.passenger_age,

                "passenger_gender":
                    booked_seat.passenger_gender,

                "from_stop": (
                    booked_seat.from_stop.stop_name
                    if booked_seat.from_stop
                    else None
                ),

                "to_stop": (
                    booked_seat.to_stop.stop_name
                    if booked_seat.to_stop
                    else None
                )
            })

        result.append({

            "booking_id": booking.id,

            "schedule_id": booking.schedule.id,

            "bus_id": booking.schedule.bus.id,

            "bus": booking.schedule.bus.bus_name,

            "bus_number":
                booking.schedule.bus.bus_number,

            "bus_type":
                booking.schedule.bus.bus_type,

            "route_id":
                booking.schedule.route.id,

            "source":
                booking.schedule.route.source,

            "destination":
                booking.schedule.route.destination,

            "travel_date":
                str(booking.travel_date),

            "amount":
                float(booking.total_amount),

            "payment_status":
                booking.payment_status,

            "status":
                booking.status,

            "booking_date":
                booking.booking_date.isoformat(),

            "seats": seats
        })

    return {

        "success": True,

        "count": len(result),

        "bookings": result
    }