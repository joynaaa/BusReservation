from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Route
from .serializers import RouteSerializer

from users.permissions import IsAdmin

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_routes(request):

    routes = Route.objects.all().order_by('-id')

    serializer = RouteSerializer(
        routes,
        many=True
    )

    return Response(serializer.data)




@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_add_route(request):

    serializer = RouteSerializer(
        data=request.data
    )

    if serializer.is_valid():

        serializer.save()

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )




@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_update_route(request, route_id):

    try:

        route = Route.objects.get(
            id=route_id
        )

    except Route.DoesNotExist:

        return Response(
            {'error': 'Route not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

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




@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_delete_route(request, route_id):

    try:

        route = Route.objects.get(
            id=route_id
        )

    except Route.DoesNotExist:

        return Response(
            {'error': 'Route not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    route.delete()

    return Response({
        'message': 'Route deleted successfully.'
    })



