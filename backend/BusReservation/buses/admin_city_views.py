from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from users.permissions import IsAdmin

from .models import City


# ==========================================
# GET ALL CITIES
# ==========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_city_list(request):

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


# ==========================================
# ADD CITY
# ==========================================

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_city_add(request):

    name = request.data.get('name', '').strip()

    if not name:

        return Response(
            {
                'error': 'City name is required.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )


    # Check duplicate

    if City.objects.filter(
        name__iexact=name
    ).exists():

        return Response(
            {
                'error': 'City already exists.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )


    city = City.objects.create(
        name=name
    )


    return Response(
        {
            'id': city.id,
            'name': city.name
        },
        status=status.HTTP_201_CREATED
    )


# ==========================================
# UPDATE CITY
# ==========================================

@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_city_update(request, city_id):

    try:

        city = City.objects.get(
            id=city_id
        )

    except City.DoesNotExist:

        return Response(
            {
                'error': 'City not found.'
            },
            status=status.HTTP_404_NOT_FOUND
        )


    name = request.data.get(
        'name',
        ''
    ).strip()


    if not name:

        return Response(
            {
                'error': 'City name is required.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )


    # Check duplicate excluding current city

    if City.objects.filter(
        name__iexact=name
    ).exclude(
        id=city.id
    ).exists():

        return Response(
            {
                'error': 'Another city with this name already exists.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )


    city.name = name

    city.save()


    return Response(
        {
            'id': city.id,
            'name': city.name
        },
        status=status.HTTP_200_OK
    )


# ==========================================
# DELETE CITY
# ==========================================

@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_city_delete(request, city_id):

    try:

        city = City.objects.get(
            id=city_id
        )

    except City.DoesNotExist:

        return Response(
            {
                'error': 'City not found.'
            },
            status=status.HTTP_404_NOT_FOUND
        )


    city.delete()


    return Response(
        {
            'message': 'City deleted successfully.'
        },
        status=status.HTTP_200_OK
    )