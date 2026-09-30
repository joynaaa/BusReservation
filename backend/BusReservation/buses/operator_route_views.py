from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Route, RouteStop
from .serializers import RouteSerializer,RouteStopSerializer

from users.permissions import IsOperator


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, IsOperator])
def operator_routes(request):

    # =========================
    # VIEW ROUTES
    # =========================

    if request.method == 'GET':

        routes = Route.objects.filter(
            operator=request.user
        ).order_by('-id')

        serializer = RouteSerializer(
            routes,
            many=True
        )

        return Response(serializer.data)


    # =========================
    # ADD ROUTE
    # =========================

    if request.method == 'POST':

        serializer = RouteSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save(
                operator=request.user
            )

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated, IsOperator])
def operator_route_detail(request, route_id):

    try:

        route = Route.objects.get(
            id=route_id,
            operator=request.user
        )

    except Route.DoesNotExist:

        return Response(
            {
                'error': 'Route not found.'
            },
            status=status.HTTP_404_NOT_FOUND
        )


    # =========================
    # EDIT ROUTE
    # =========================

    if request.method == 'PUT':

        serializer = RouteSerializer(
            route,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


    # =========================
    # DELETE ROUTE
    # =========================

    if request.method == 'DELETE':

        route.delete()

        return Response(
            {
                'message': 'Route deleted successfully.'
            }
        )
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, IsOperator])
def operator_route_stops(request, route_id):

    try:
        route = Route.objects.get(
            id=route_id,
            operator=request.user
        )

    except Route.DoesNotExist:

        return Response(
            {'error': 'Route not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':

        stops = RouteStop.objects.filter(
            route=route
        ).order_by('stop_order')

        serializer = RouteStopSerializer(
            stops,
            many=True
        )

        return Response(serializer.data)

    serializer = RouteStopSerializer(
        data=request.data
    )

    if serializer.is_valid():

        serializer.save(
            route=route
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )



# ==========================================================
# UPDATE / DELETE ROUTE STOP
# ==========================================================

@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated, IsOperator])
def operator_route_stop_detail(request, route_id, stop_id):

    # ======================================================
    # FIND ROUTE
    # ======================================================

    try:

        route = Route.objects.get(
            id=route_id,
            operator=request.user
        )

    except Route.DoesNotExist:

        return Response(
            {
                'error': 'Route not found or does not belong to you.'
            },
            status=status.HTTP_404_NOT_FOUND
        )


    # ======================================================
    # FIND STOP
    # ======================================================

    try:

        stop = RouteStop.objects.get(
            id=stop_id,
            route=route
        )

    except RouteStop.DoesNotExist:

        return Response(
            {
                'error': 'Stop not found.'
            },
            status=status.HTTP_404_NOT_FOUND
        )


    # ======================================================
    # DELETE STOP
    # ======================================================

    if request.method == 'DELETE':

        stop.delete()

        return Response(
            {
                'message': 'Stop deleted successfully.'
            },
            status=status.HTTP_200_OK
        )


    # ======================================================
    # UPDATE STOP
    # ======================================================

    if request.method == 'PUT':

        serializer = RouteStopSerializer(
            stop,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                {
                    'message': 'Stop updated successfully.',
                    'data': serializer.data
                },
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )