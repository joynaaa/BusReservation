from django.contrib.auth.models import User

from rest_framework import serializers

from .models import UserProfile

from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer
)


# =========================================================
# USER PROFILE SERIALIZER
# =========================================================
# =========================================================
# USER PROFILE SERIALIZER
# =========================================================

class UserProfileSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source='user.username',
        read_only=True
    )

    email = serializers.EmailField(
        source='user.email',
        read_only=True
    )

    class Meta:

        model = UserProfile

        fields = [
            # ACCOUNT
            'username',
            'email',

            # PERSONAL
            'full_name',
            'phone',
            'address',

            # OPERATOR / BUSINESS
            'company_name',
            'operator_type',
            'business_phone',
            'business_email',

            # BUSINESS ADDRESS
            'city',
            'state',
            'pin_code',

            # OPERATOR INFORMATION
            'number_of_buses',
            'years_of_experience',

            # STATUS
            'role',
            'status',
        ]

        read_only_fields = [
            'username',
            'email',
            'role',
            'status',
            'number_of_buses',
        ]
# =========================================================
# NORMAL USER REGISTRATION
# =========================================================

class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True
    )

    password2 = serializers.CharField(
        write_only=True
    )

    class Meta:

        model = User

        fields = [
            'username',
            'email',
            'password',
            'password2'
        ]


    # =====================================================
    # VALIDATION
    # =====================================================

    def validate(self, data):

        if data['password'] != data['password2']:

            raise serializers.ValidationError({
                'password':
                'Passwords do not match.'
            })


        if User.objects.filter(
            username=data['username']
        ).exists():

            raise serializers.ValidationError({
                'username':
                'Username already exists.'
            })


        if User.objects.filter(
            email=data['email']
        ).exists():

            raise serializers.ValidationError({
                'email':
                'Email already exists.'
            })


        return data


    # =====================================================
    # CREATE USER
    # =====================================================

    def create(self, validated_data):

        validated_data.pop(
            'password2'
        )

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )

        UserProfile.objects.get_or_create(
            user=user,
            defaults={
                'role': 'USER',
                'status': 'APPROVED'
            }
        )

        return user


# =========================================================
# JWT LOGIN
# =========================================================

class CustomTokenObtainPairSerializer(
    TokenObtainPairSerializer
):

    def validate(self, attrs):

        data = super().validate(attrs)

        profile, created = UserProfile.objects.get_or_create(
            user=self.user,
            defaults={
                'role': 'USER',
                'status': 'APPROVED'
            }
        )


        # =================================================
        # DJANGO ADMIN / SUPERUSER
        # =================================================

        if self.user.is_superuser or self.user.is_staff:

            if profile.role != 'ADMIN':

                profile.role = 'ADMIN'

                profile.status = 'APPROVED'

                profile.save()


        data['role'] = profile.role

        data['username'] = self.user.username

        return data


# =========================================================
# BUS OPERATOR REGISTRATION
# =========================================================

class OperatorRegisterSerializer(serializers.Serializer):


    # =====================================================
    # ACCOUNT DETAILS
    # =====================================================

    username = serializers.CharField(
        max_length=30
    )

    email = serializers.EmailField()

    password = serializers.CharField(
        write_only=True
    )

    password2 = serializers.CharField(
        write_only=True
    )


    # =====================================================
    # OPERATOR DETAILS
    # =====================================================

    full_name = serializers.CharField(
        max_length=100
    )

    phone = serializers.CharField(
        max_length=15
    )

    company_name = serializers.CharField(
        max_length=150
    )

    operator_type = serializers.CharField(
        max_length=20
    )

    business_phone = serializers.CharField(
        max_length=15
    )

    business_email = serializers.EmailField(
        required=False,
        allow_blank=True
    )


    # =====================================================
    # BUSINESS ADDRESS
    # =====================================================

    address = serializers.CharField()

    city = serializers.CharField(
        max_length=100
    )

    state = serializers.CharField(
        max_length=100
    )

    pin_code = serializers.CharField(
        max_length=10
    )


    # =====================================================
    # OPERATOR INFORMATION
    # =====================================================

    number_of_buses = serializers.IntegerField(
        min_value=1
    )

    years_of_experience = serializers.IntegerField(
        min_value=0
    )


    # =====================================================
    # OPERATOR VERIFICATION DOCUMENTS
    # =====================================================

    government_id = serializers.FileField(
        required=True
    )

    business_registration = serializers.FileField(
        required=True
    )

    transport_permit = serializers.FileField(
        required=True
    )


    # =====================================================
    # VALIDATION
    # =====================================================

    def validate(self, data):

        # Password confirmation

        if data['password'] != data['password2']:

            raise serializers.ValidationError({
                'password':
                'Passwords do not match.'
            })


        # Username uniqueness

        if User.objects.filter(
            username=data['username']
        ).exists():

            raise serializers.ValidationError({
                'username':
                'Username already exists.'
            })


        # Email uniqueness

        if User.objects.filter(
            email=data['email']
        ).exists():

            raise serializers.ValidationError({
                'email':
                'Email already exists.'
            })


        return data


    # =====================================================
    # CREATE OPERATOR
    # =====================================================

    def create(self, validated_data):


        # =================================================
        # ACCOUNT DETAILS
        # =================================================

        password = validated_data.pop(
            'password'
        )

        validated_data.pop(
            'password2'
        )

        username = validated_data.pop(
            'username'
        )

        email = validated_data.pop(
            'email'
        )


        # =================================================
        # CREATE USER
        # =================================================

        user = User.objects.create_user(

            username=username,

            email=email,

            password=password
        )


        # =================================================
        # GET OR CREATE PROFILE
        # =================================================

        profile, created = UserProfile.objects.get_or_create(
            user=user
        )


        # =================================================
        # BASIC OPERATOR DETAILS
        # =================================================

        profile.full_name = validated_data.pop(
            'full_name'
        )

        profile.phone = validated_data.pop(
            'phone'
        )


        # =================================================
        # BUSINESS DETAILS
        # =================================================

        profile.company_name = validated_data.pop(
            'company_name'
        )

        profile.operator_type = validated_data.pop(
            'operator_type'
        )

        profile.business_phone = validated_data.pop(
            'business_phone'
        )

        profile.business_email = validated_data.pop(
            'business_email',
            ''
        )


        # =================================================
        # BUSINESS ADDRESS
        # =================================================

        profile.address = validated_data.pop(
            'address'
        )

        profile.city = validated_data.pop(
            'city'
        )

        profile.state = validated_data.pop(
            'state'
        )

        profile.pin_code = validated_data.pop(
            'pin_code'
        )


        # =================================================
        # OPERATOR INFORMATION
        # =================================================

        profile.number_of_buses = validated_data.pop(
            'number_of_buses'
        )

        profile.years_of_experience = validated_data.pop(
            'years_of_experience'
        )


        # =================================================
        # OPERATOR VERIFICATION DOCUMENTS
        # =================================================

        profile.government_id = validated_data.pop(
            'government_id'
        )

        profile.business_registration = validated_data.pop(
            'business_registration'
        )

        profile.transport_permit = validated_data.pop(
            'transport_permit'
        )


        # =================================================
        # ROLE + APPROVAL STATUS
        # =================================================

        profile.role = 'OPERATOR'

        profile.status = 'PENDING'


        # =================================================
        # SAVE PROFILE
        # =================================================

        profile.save()


        return user