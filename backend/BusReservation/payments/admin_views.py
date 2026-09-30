from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Payment
from .serializers import PaymentSerializer
from users.permissions import IsAdmin


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_payments(request):

    payments = Payment.objects.select_related(
        'booking',
        'booking__user'
    ).all().order_by('-id')

    serializer = PaymentSerializer(
        payments,
        many=True
    )

    return Response(serializer.data)