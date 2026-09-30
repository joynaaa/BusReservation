from rest_framework.decorators import (
    api_view,
    permission_classes,
    parser_classes
)

from rest_framework.parsers import MultiPartParser, FormParser

from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated
)

from rest_framework.response import Response
from rest_framework import status

from django.contrib.auth.models import User

from .models import UserProfile

from .serializers import (
    RegisterSerializer,
    UserProfileSerializer,
    OperatorRegisterSerializer,
    CustomTokenObtainPairSerializer
)

from rest_framework_simplejwt.views import TokenObtainPairView

from notifications.utils import create_notification


# =========================================================
# USER REGISTRATION
# =========================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):

    serializer = RegisterSerializer(
        data=request.data
    )

    if serializer.is_valid():

        serializer.save()

        return Response(
            {
                'message': 'User registered successfully'
            },
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


# =========================================================
# USER PROFILE
# =========================================================

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile(request):

    profile, created = UserProfile.objects.get_or_create(
        user=request.user
    )

    # =====================================================
    # GET PROFILE
    # =====================================================

    if request.method == 'GET':

        serializer = UserProfileSerializer(
            profile
        )

        return Response(
            serializer.data
        )

    # =====================================================
    # UPDATE PROFILE
    # =====================================================

    if request.method == 'PUT':

        serializer = UserProfileSerializer(
            profile,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                {
                    'message': 'Profile updated successfully',
                    'profile': serializer.data
                }
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# =========================================================
# LOGIN
# =========================================================

class CustomLoginView(TokenObtainPairView):

    serializer_class = CustomTokenObtainPairSerializer

    def post(
        self,
        request,
        *args,
        **kwargs
    ):

        username = request.data.get(
            'username'
        )

        # =================================================
        # CHECK USERNAME
        # =================================================

        try:

            user = User.objects.get(
                username=username
            )

        except User.DoesNotExist:

            return Response(
                {
                    'error':
                    'Invalid username or password.'
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        # =================================================
        # GET USER PROFILE
        # =================================================

        profile, created = UserProfile.objects.get_or_create(
            user=user
        )

        # =================================================
        # OPERATOR APPROVAL CHECK
        # =================================================

        if profile.role == 'OPERATOR':

            # -------------------------------------------------
            # PENDING
            # -------------------------------------------------

            if profile.status == 'PENDING':

                return Response(
                    {
                        'error':
                        'Your operator account is waiting '
                        'for admin approval.'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

            # -------------------------------------------------
            # REJECTED
            # -------------------------------------------------

            if profile.status == 'REJECTED':

                return Response(
                    {
                        'error':
                        'Your operator registration has '
                        'been rejected by admin.'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

            # -------------------------------------------------
            # APPROVED
            # -------------------------------------------------

            # Approved operators continue to normal login.

        # =================================================
        # NORMAL LOGIN
        # =================================================

        return super().post(
            request,
            *args,
            **kwargs
        )

@api_view(['POST'])
@permission_classes([AllowAny])
@parser_classes([
    MultiPartParser,
    FormParser
])
def operator_register(request):

    serializer = OperatorRegisterSerializer(
        data=request.data
    )

    # =====================================================
    # VALIDATE
    # =====================================================

    if serializer.is_valid():

        # -------------------------------------------------
        # CREATE OPERATOR
        # -------------------------------------------------

        operator_profile = serializer.save()


        # =================================================
        # CREATE ADMIN NOTIFICATION
        # =================================================
        #
        # Notification failure should NOT make operator
        # registration fail.
        # =================================================

        try:

            admins = User.objects.filter(
                is_staff=True
            )

            for admin in admins:

                create_notification(
                    user=admin,
                    title='New Operator Registration',
                    message=(
                        'A new bus operator registration '
                        'has been submitted. '
                        'Please review the registration.'
                    ),
                    notification_type='OPERATOR_REGISTRATION'
                )

        except Exception as notification_error:

            print(
                'ADMIN OPERATOR NOTIFICATION ERROR:',
                notification_error
            )


        # =================================================
        # SUCCESS RESPONSE
        # =================================================

        return Response(
            {
                'message':
                    'Bus Operator registration submitted successfully.',

                'status':
                    'PENDING',

                'message_detail':
                    (
                        'Your account is waiting for admin approval. '
                        'You can login only after your account is approved.'
                    )
            },
            status=status.HTTP_201_CREATED
        )


    # =====================================================
    # VALIDATION ERROR
    # =====================================================

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )