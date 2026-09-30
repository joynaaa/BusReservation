from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Bus,City, RouteStop, Schedule, Seat, Route,ScheduleOperatingDay,StopFare
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import BusSerializer, RouteStopSerializer, SeatSerializer, ScheduleSerializer
from users.permissions import IsOperator
from django.db.models import Avg
from bookings.models import BookedSeat
from notifications.utils import create_notification
from django.contrib.auth.models import User

@api_view(['GET'])
def bus_list(request):

    buses = Bus.objects.all()

    serializer = BusSerializer(
        buses,
        many=True,
            context={'request': request}
    )

    return Response(serializer.data)
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Bus, Schedule, RouteStop, Seat
from bookings.models import BookedSeat, SeatHold
@api_view(['GET'])
def seat_list(request, bus_id):

    # ==========================================
    # GET PARAMETERS
    # ==========================================

    schedule_id = request.GET.get('schedule_id')
    from_stop_id = request.GET.get('from_stop')
    to_stop_id = request.GET.get('to_stop')
    travel_date = request.GET.get('travel_date')

    # ==========================================
    # VALIDATION
    # ==========================================

    if not schedule_id:
        return Response(
            {
                'error': 'schedule_id is required'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    if not from_stop_id or not to_stop_id:
        return Response(
            {
                'error': 'from_stop and to_stop are required'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    if not travel_date:
        return Response(
            {
                'error': 'travel_date is required'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ==========================================
    # VALIDATE TRAVEL DATE
    # ==========================================

    from datetime import datetime

    try:
        travel_date_obj = datetime.strptime(
            travel_date,
            '%Y-%m-%d'
        ).date()

    except ValueError:
        return Response(
            {
                'error': 'Invalid travel_date. Use YYYY-MM-DD.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ==========================================
    # GET BUS
    # ==========================================

    try:
        bus = Bus.objects.get(
            id=bus_id
        )

    except Bus.DoesNotExist:
        return Response(
            {
                'error': 'Bus not found'
            },
            status=status.HTTP_404_NOT_FOUND
        )

    # ==========================================
    # GET SCHEDULE
    # ==========================================

    try:
        schedule = Schedule.objects.select_related(
            'route',
            'bus'
        ).get(
            id=schedule_id,
            bus=bus
        )

    except Schedule.DoesNotExist:
        return Response(
            {
                'error': 'Schedule not found for this bus'
            },
            status=status.HTTP_404_NOT_FOUND
        )

    # ==========================================
    # GET FROM STOP
    # ==========================================

    try:
        from_stop = RouteStop.objects.get(
            id=from_stop_id,
            route=schedule.route
        )

    except RouteStop.DoesNotExist:
        return Response(
            {
                'error': 'From stop does not belong to this route'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ==========================================
    # GET TO STOP
    # ==========================================

    try:
        to_stop = RouteStop.objects.get(
            id=to_stop_id,
            route=schedule.route
        )

    except RouteStop.DoesNotExist:
        return Response(
            {
                'error': 'To stop does not belong to this route'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ==========================================
    # VALIDATE STOP ORDER
    # ==========================================

    if from_stop.stop_order >= to_stop.stop_order:
        return Response(
            {
                'error': 'From stop must be before destination stop'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ==========================================
    # GET ALL BUS SEATS
    # ==========================================

    seats = Seat.objects.filter(
        bus=bus
    ).order_by('seat_number')

    # ==========================================
    # REMOVE EXPIRED HOLDS
    # ==========================================

    SeatHold.objects.filter(
        expires_at__lt=timezone.now()
    ).delete()

    # ==========================================
    # REQUESTED SEGMENT
    # ==========================================

    requested_from = from_stop.stop_order
    requested_to = to_stop.stop_order

    # ==========================================
    # FIND BOOKED SEATS
    # FOR THIS DATE + SEGMENT
    # ==========================================

    booked_seat_ids = set()

    booked_seats = BookedSeat.objects.filter(
        schedule=schedule,
        booking__status='CONFIRMED',
        booking__travel_date=travel_date_obj
    ).select_related(
        'from_stop',
        'to_stop'
    )

    for booked in booked_seats:

        # ======================================
        # OLD BOOKING WITHOUT SEGMENT
        # ======================================

        if (
            booked.from_stop is None
            or
            booked.to_stop is None
        ):
            booked_seat_ids.add(
                booked.seat_id
            )
            continue

        # ======================================
        # EXISTING BOOKING SEGMENT
        # ======================================

        existing_from = booked.from_stop.stop_order
        existing_to = booked.to_stop.stop_order

        # ======================================
        # CHECK SEGMENT OVERLAP
        # ======================================

        if (
            existing_from < requested_to
            and
            existing_to > requested_from
        ):
            booked_seat_ids.add(
                booked.seat_id
            )

    # ==========================================
    # FIND HELD SEATS
    # FOR THIS DATE + SEGMENT
    # ==========================================

    held_seat_ids = set()

    active_holds = SeatHold.objects.filter(
        schedule=schedule,
        travel_date=travel_date_obj,
        expires_at__gt=timezone.now()
    ).select_related(
        'from_stop',
        'to_stop'
    )

    for hold in active_holds:

        # ======================================
        # OLD HOLD WITHOUT SEGMENT
        # ======================================

        if (
            hold.from_stop is None
            or
            hold.to_stop is None
        ):
            held_seat_ids.add(
                hold.seat_id
            )
            continue

        # ======================================
        # EXISTING HOLD SEGMENT
        # ======================================

        existing_from = hold.from_stop.stop_order
        existing_to = hold.to_stop.stop_order

        # ======================================
        # CHECK SEGMENT OVERLAP
        # ======================================

        if (
            existing_from < requested_to
            and
            existing_to > requested_from
        ):
            held_seat_ids.add(
                hold.seat_id
            )

    # ==========================================
    # BUILD RESPONSE
    # ==========================================

    seat_data = []

    for seat in seats:

        if seat.id in booked_seat_ids:

            seat_status = 'BOOKED'

        elif seat.id in held_seat_ids:

            seat_status = 'HELD'

        else:

            seat_status = 'AVAILABLE'

        seat_data.append(
            {
                'id': seat.id,
                'seat_number': seat.seat_number,
                'seat_type': seat.seat_type,
                'status': seat_status
            }
        )

    # ==========================================
    # RESPONSE
    # ==========================================

    return Response(
        seat_data,
        status=status.HTTP_200_OK
    )


from datetime import datetime

from django.http import JsonResponse

from .models import (
    Schedule,
    RouteStop,
    StopFare,
)


def search_buses(request):

    source = request.GET.get('source', '').strip()
    destination = request.GET.get('destination', '').strip()
    travel_date = request.GET.get('date', '').strip()

    print("\n========================================")
    print("          BUS SEARCH START")
    print("========================================")

    print("Source:", source)
    print("Destination:", destination)
    print("Travel Date:", travel_date)

    # =====================================================
    # VALIDATION
    # =====================================================

    if not source or not destination or not travel_date:

        return JsonResponse(
            {
                'error': 'Source, destination and date are required.'
            },
            status=400
        )

    if source.lower() == destination.lower():

        return JsonResponse(
            {
                'error': 'Source and destination cannot be same.'
            },
            status=400
        )

    # =====================================================
    # CONVERT DATE TO WEEKDAY
    # =====================================================

    try:

        date_object = datetime.strptime(
            travel_date,
            '%Y-%m-%d'
        ).date()

    except ValueError:

        return JsonResponse(
            {
                'error': 'Invalid date format. Use YYYY-MM-DD.'
            },
            status=400
        )

    day_name = date_object.strftime('%A')

    print("Selected weekday:", day_name)

    # =====================================================
    # GET ACTIVE SCHEDULES
    # =====================================================

    schedules = (
        Schedule.objects
        .filter(
            is_active=True,
            bus__is_active=True,
            bus__status='APPROVED',
            operating_days__day__iexact=day_name
        )
        .select_related(
            'bus',
            'route'
        )
        .prefetch_related(
            'operating_days'
        )
        .distinct()
        .order_by('id')
    )

    print(
        "Schedules operating on",
        day_name,
        ":",
        schedules.count()
    )

    results = []

    # =====================================================
    # PROCESS EACH SCHEDULE
    # =====================================================

    for schedule in schedules:

        bus = schedule.bus
        route = schedule.route

        print("\n----------------------------------------")
        print("Schedule:", schedule.id)
        print("Bus:", bus.bus_name)
        print("Bus Number:", bus.bus_number)

        print(
            "Route:",
            route.source,
            "→",
            route.destination
        )

        # =================================================
        # GET ROUTE STOPS
        # =================================================

        route_stops = list(
            RouteStop.objects
            .filter(route=route)
            .order_by('stop_order')
        )

        print("Route stops:")

        for stop in route_stops:

            print(
                stop.stop_order,
                stop.stop_name,
                "| Arrival:",
                stop.arrival_time,
                "| Departure:",
                stop.departure_time
            )

        # =================================================
        # FIND SOURCE STOP
        # =================================================

        source_stop = None

        for stop in route_stops:

            if (
                stop.stop_name.strip().lower()
                == source.lower()
            ):

                source_stop = stop
                break

        # =================================================
        # FIND DESTINATION STOP
        # =================================================

        destination_stop = None

        for stop in route_stops:

            if (
                stop.stop_name.strip().lower()
                == destination.lower()
            ):

                destination_stop = stop
                break

        # =================================================
        # SOURCE NOT FOUND
        # =================================================

        if not source_stop:

            print(
                "SKIPPED: Source stop not found:",
                source
            )

            continue

        # =================================================
        # DESTINATION NOT FOUND
        # =================================================

        if not destination_stop:

            print(
                "SKIPPED: Destination stop not found:",
                destination
            )

            continue

        print(
            "Source stop:",
            source_stop.stop_name,
            "ID:",
            source_stop.id,
            "Order:",
            source_stop.stop_order
        )

        print(
            "Destination stop:",
            destination_stop.stop_name,
            "ID:",
            destination_stop.id,
            "Order:",
            destination_stop.stop_order
        )

        # =================================================
        # CHECK STOP ORDER
        # =================================================

        if (
            source_stop.stop_order
            >= destination_stop.stop_order
        ):

            print(
                "SKIPPED: Destination comes before source"
            )

            continue

        # =================================================
        # GET TIMINGS
        # =================================================

        departure_time = (
            source_stop.departure_time
        )

        arrival_time = (
            destination_stop.arrival_time
        )

        # =================================================
        # CALCULATE TOTAL FARE
        #
        # Example:
        #
        # Kochi → Angamaly = ₹20
        # Angamaly → Thrissur = ₹20
        #
        # Kochi → Thrissur = ₹40
        # =================================================

        total_fare = 0

        fare_calculation_success = True

        # Stops between source and destination
        journey_stops = [
            stop
            for stop in route_stops
            if (
                stop.stop_order >= source_stop.stop_order
                and
                stop.stop_order <= destination_stop.stop_order
            )
        ]

        print(
            "Journey stops:",
            [
                stop.stop_name
                for stop in journey_stops
            ]
        )

        # =================================================
        # CALCULATE EACH CONSECUTIVE SEGMENT
        # =================================================

        for index in range(
            len(journey_stops) - 1
        ):

            from_stop = journey_stops[index]
            to_stop = journey_stops[index + 1]

            print(
                "Checking fare:",
                from_stop.stop_name,
                "→",
                to_stop.stop_name
            )

            segment_fare = (
                StopFare.objects.filter(
                    schedule=schedule,
                    from_stop=from_stop,
                    to_stop=to_stop
                )
                .first()
            )

            # ---------------------------------------------
            # SEGMENT FARE NOT FOUND
            # ---------------------------------------------

            if not segment_fare:

                print(
                    "SKIPPED: Segment fare not found:",
                    from_stop.stop_name,
                    "→",
                    to_stop.stop_name
                )

                fare_calculation_success = False

                break

            # ---------------------------------------------
            # ADD SEGMENT FARE
            # ---------------------------------------------

            total_fare += segment_fare.fare

            print(
                "Segment fare:",
                segment_fare.fare
            )

            print(
                "Current total:",
                total_fare
            )

        # =================================================
        # IF ANY SEGMENT FARE IS MISSING
        # =================================================

        if not fare_calculation_success:

            print(
                "SKIPPED: Complete fare could not be calculated."
            )

            continue

        # =================================================
        # OPERATING DAYS
        # =================================================

        operating_days = list(
            schedule.operating_days.values_list(
                'day',
                flat=True
            )
        )

        # =================================================
        # CREATE RESULT
        # =================================================

        bus_data = {

            # ---------------------------------------------
            # Schedule
            # ---------------------------------------------

            'id': schedule.id,

            'schedule_id': schedule.id,

            # ---------------------------------------------
            # Bus
            # ---------------------------------------------

            'bus': bus.id,

            'bus_name': bus.bus_name,

            'bus_number': bus.bus_number,

            'bus_type': bus.bus_type,

            # ---------------------------------------------
            # Route
            # ---------------------------------------------

            'route': route.id,

            'route_source': route.source,

            'route_destination': route.destination,

            # ---------------------------------------------
            # Requested journey
            # ---------------------------------------------

            'source': source,

            'destination': destination,

            # ---------------------------------------------
            # Stop IDs
            # ---------------------------------------------

            'source_stop_id': source_stop.id,

            'destination_stop_id': destination_stop.id,

            # ---------------------------------------------
            # Travel date
            # ---------------------------------------------

            'travel_date': travel_date,

            'weekday': day_name,

            # ---------------------------------------------
            # Time
            # ---------------------------------------------

            'departure_time': (
                departure_time.strftime('%H:%M')
                if departure_time
                else None
            ),

            'arrival_time': (
                arrival_time.strftime('%H:%M')
                if arrival_time
                else None
            ),

            # ---------------------------------------------
            # CALCULATED FARE
            # ---------------------------------------------

            'fare': float(total_fare),

            # ---------------------------------------------
            # Operating days
            # ---------------------------------------------

            'operating_days': operating_days,

            # ---------------------------------------------
            # Status
            # ---------------------------------------------

            'is_active': schedule.is_active,

            # ---------------------------------------------
            # Rating
            # ---------------------------------------------

            'average_rating': 0
        }

        # =================================================
        # PRINT BUS FOUND
        # =================================================

        print("\nBUS FOUND:")

        print(
            "Schedule ID:",
            bus_data['schedule_id']
        )

        print(
            "Bus ID:",
            bus_data['bus']
        )

        print(
            "From Stop:",
            bus_data['source_stop_id']
        )

        print(
            "To Stop:",
            bus_data['destination_stop_id']
        )

        print(
            "Calculated Fare:",
            bus_data['fare']
        )

        print("----------------------------------------")

        results.append(bus_data)

    # =====================================================
    # FINAL RESULT
    # =====================================================

    print("\n========================================")
    print("FINAL BUS SEARCH RESULT")

    print(
        "Number of buses:",
        len(results)
    )

    print("Results:")

    for result in results:

        print(
            "Schedule:",
            result['schedule_id'],
            "| Bus:",
            result['bus'],
            "| From Stop:",
            result['source_stop_id'],
            "| To Stop:",
            result['destination_stop_id'],
            "| Fare:",
            result['fare']
        )

    print("========================================\n")

    return JsonResponse(
        results,
        safe=False
    )
# =========================================================
# OPERATOR - MANAGE BUSES
# =========================================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, IsOperator])
@parser_classes([MultiPartParser, FormParser])
def operator_buses(request):

    # =====================================================
    # GET - SHOW ONLY LOGGED-IN OPERATOR'S BUSES
    # =====================================================

    if request.method == 'GET':

        buses = Bus.objects.filter(
            operator=request.user
        ).order_by('-id')

        serializer = BusSerializer(
            buses,
            many=True,
            context={'request': request}
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


    # =====================================================
    # POST - ADD NEW BUS
    # =====================================================

    if request.method == 'POST':

        serializer = BusSerializer(
            data=request.data
        )

        # =================================================
        # VALIDATE BUS
        # =================================================

        if serializer.is_valid():

            # ---------------------------------------------
            # SAVE BUS
            # ---------------------------------------------

            bus = serializer.save(
                operator=request.user,
                status='PENDING',
                is_active=False
            )


            # ---------------------------------------------
            # GET SEAT LAYOUT
            # ---------------------------------------------

            seats_per_row = int(
                bus.seats_per_row
            )

            total_seats = bus.total_seats

            seats = []


            # ---------------------------------------------
            # GENERATE SEATS AUTOMATICALLY
            # ---------------------------------------------

            for i in range(
                1,
                total_seats + 1
            ):

                # Calculate row number
                row = (
                    (i - 1) // seats_per_row
                ) + 1

                # Position in row
                position = (
                    (i - 1) % seats_per_row
                )


                # -----------------------------------------
                # Convert position to A, B, C, D, E...
                # -----------------------------------------

                letter = chr(
                    65 + position
                )

                seat_number = (
                    f"{row}{letter}"
                )


                # -----------------------------------------
                # DETERMINE SEAT TYPE
                # -----------------------------------------

                if seats_per_row == 3:

                    # A = Window
                    # B = Aisle
                    # C = Window

                    if position == 0:

                        seat_type = 'WINDOW'

                    elif position == 1:

                        seat_type = 'AISLE'

                    else:

                        seat_type = 'WINDOW'


                elif seats_per_row == 4:

                    # A = Window
                    # B = Aisle
                    # C = Aisle
                    # D = Window

                    if position == 0:

                        seat_type = 'WINDOW'

                    elif position == 3:

                        seat_type = 'WINDOW'

                    else:

                        seat_type = 'AISLE'


                elif seats_per_row == 5:

                    # A = Window
                    # B = Aisle
                    # C = Middle
                    # D = Aisle
                    # E = Window

                    if position == 0:

                        seat_type = 'WINDOW'

                    elif position == 4:

                        seat_type = 'WINDOW'

                    elif position == 2:

                        seat_type = 'MIDDLE'

                    else:

                        seat_type = 'AISLE'


                else:

                    seat_type = 'AISLE'


                # -----------------------------------------
                # CREATE SEAT OBJECT
                # -----------------------------------------

                seats.append(
                    Seat(
                        bus=bus,
                        seat_number=seat_number,
                        seat_type=seat_type
                    )
                )


            # ---------------------------------------------
            # INSERT ALL SEATS AT ONCE
            # ---------------------------------------------

            Seat.objects.bulk_create(
                seats
            )


            # =================================================
            # CREATE ADMIN NOTIFICATION
            # =================================================
            #
            # The bus is already created and seats are
            # already generated.
            #
            # Notification errors should NOT make the
            # bus creation fail.
            # =================================================

            try:

                admins = User.objects.filter(
                    is_staff=True
                )

                for admin in admins:

                    create_notification(
                        user=admin,
                        title='New Bus Submitted',
                        message=(
                            f'Operator {request.user.username} '
                            f'submitted bus '
                            f'{bus.bus_name} '
                            f'({bus.bus_number}) '
                            f'for admin approval.'
                        ),
                        notification_type='BUS_SUBMITTED'
                    )

            except Exception as notification_error:

                print(
                    'ADMIN BUS NOTIFICATION ERROR:',
                    notification_error
                )


            # ---------------------------------------------
            # RESPONSE
            # ---------------------------------------------

            return Response(
                {
                    'message':
                        'Bus added successfully.',

                    'bus':
                        BusSerializer(
                            bus,
                            context={'request': request}
                        ).data,

                    'seats_created':
                        len(seats)
                },

                status=status.HTTP_201_CREATED
            )


        # ---------------------------------------------
        # VALIDATION ERROR
        # ---------------------------------------------

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

# =========================================================
# OPERATOR - UPDATE / DELETE BUS
# =========================================================

@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated, IsOperator])
@parser_classes([MultiPartParser, FormParser])
def operator_bus_detail(
    request,
    bus_id
):

    # =====================================================
    # FIND BUS
    # Only the owner/operator can access it
    # =====================================================

    try:

        bus = Bus.objects.get(
            id=bus_id,
            operator=request.user
        )

    except Bus.DoesNotExist:

        return Response(
            {
                'error':
                    'Bus not found or does not belong to you.'
            },

            status=status.HTTP_404_NOT_FOUND
        )


    # =====================================================
    # UPDATE BUS
    # =====================================================

    if request.method == 'PUT':

        serializer = BusSerializer(
            bus,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            old_total_seats = bus.total_seats
            old_seats_per_row = bus.seats_per_row

            # Any operator edit sends the bus back for admin approval.
            updated_bus = serializer.save(
                status='PENDING',
                rejection_reason=''
            )

            new_total_seats = updated_bus.total_seats
            new_seats_per_row = updated_bus.seats_per_row


            # ------------------------------------------------
            # If seat configuration changed,
            # regenerate seats.
            # ------------------------------------------------

            if (
                old_total_seats != new_total_seats
                or
                old_seats_per_row != new_seats_per_row
            ):

                # IMPORTANT:
                # Don't regenerate if seats are already booked.
                #
                # Check whether any seat belonging to this bus
                # is being used by a booking.
                # We handle this safely below.

                from bookings.models import BookedSeat

                booked_seats_exist = BookedSeat.objects.filter(
                    seat__bus=bus
                ).exists()


                if booked_seats_exist:

                    return Response(
                        {
                            'error':
                                'Cannot change total seats or seat layout because seats from this bus have already been booked.'
                        },

                        status=status.HTTP_400_BAD_REQUEST
                    )


                # Delete old seats

                Seat.objects.filter(
                    bus=bus
                ).delete()


                # Generate new seats

                seats_per_row = int(
                    updated_bus.seats_per_row
                )

                seats = []

                for i in range(
                    1,
                    updated_bus.total_seats + 1
                ):

                    row = (
                        (i - 1)
                        // seats_per_row
                    ) + 1

                    position = (
                        (i - 1)
                        % seats_per_row
                    )

                    letter = chr(
                        65 + position
                    )

                    seat_number = (
                        f"{row}{letter}"
                    )


                    # Seat type

                    if seats_per_row == 3:

                        if position == 0:
                            seat_type = 'WINDOW'

                        elif position == 1:
                            seat_type = 'AISLE'

                        else:
                            seat_type = 'WINDOW'


                    elif seats_per_row == 4:

                        if (
                            position == 0
                            or
                            position == 3
                        ):
                            seat_type = 'WINDOW'

                        else:
                            seat_type = 'AISLE'


                    elif seats_per_row == 5:

                        if (
                            position == 0
                            or
                            position == 4
                        ):
                            seat_type = 'WINDOW'

                        elif position == 2:
                            seat_type = 'MIDDLE'

                        else:
                            seat_type = 'AISLE'


                    else:

                        seat_type = 'AISLE'


                    seats.append(
                        Seat(
                            bus=updated_bus,
                            seat_number=seat_number,
                            seat_type=seat_type
                        )
                    )


                Seat.objects.bulk_create(
                    seats
                )


            return Response(
                {
                    'message':
                        'Bus updated successfully.',

                    'bus':
                        BusSerializer(
                            updated_bus,
            context={'request': request}
                        ).data
                },

                status=status.HTTP_200_OK
            )


        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


    # =====================================================
    # DELETE BUS
    # =====================================================

    if request.method == 'DELETE':

        bus.delete()

        return Response(
            {
                'message':
                    'Bus deleted successfully.'
            },

            status=status.HTTP_200_OK
        )



# =========================================================
# PUBLIC - GET ROUTE STOPS
# =========================================================

@api_view(['GET'])
def route_stops(request, route_id):

    print("\n========================================")
    print("          ROUTE STOPS API")
    print("========================================")
    print("Route ID:", route_id)

    # ==========================================
    # GET ROUTE
    # ==========================================

    try:

        route = Route.objects.get(
            id=route_id
        )

        print(
            "Route found:",
            route.id
        )

        print(
            "Route:",
            route.source,
            "→",
            route.destination
        )

    except Route.DoesNotExist:

        print(
            "ERROR: Route not found:",
            route_id
        )

        return Response(
            {
                'error': 'Route not found.'
            },
            status=status.HTTP_404_NOT_FOUND
        )


    # ==========================================
    # GET STOPS
    # ==========================================

    stops = (
        RouteStop.objects
        .filter(
            route=route
        )
        .order_by(
            'stop_order'
        )
    )


    print(
        "Number of stops:",
        stops.count()
    )


    # ==========================================
    # PRINT STOPS
    # ==========================================

    for stop in stops:

        print(
            "Stop:",
            stop.id,
            "|",
            stop.stop_order,
            "|",
            stop.stop_name,
            "| Arrival:",
            stop.arrival_time,
            "| Departure:",
            stop.departure_time
        )


    # ==========================================
    # SERIALIZE
    # ==========================================

    serializer = RouteStopSerializer(
        stops,
        many=True
    )


    # ==========================================
    # FINAL DATA
    # ==========================================

    data = serializer.data


    print(
        "Serialized stops:",
        data
    )


    print(
        "========================================\n"
    )


    # ==========================================
    # RESPONSE
    # ==========================================

    return Response(
        data,
        status=status.HTTP_200_OK
    )
@api_view(['GET'])
def city_list(request):

    cities = City.objects.all().order_by('name')

    data = [
        {
            'id': city.id,
            'name': city.name
        }
        for city in cities
    ]

    return Response(
        data,
        status=status.HTTP_200_OK
    )