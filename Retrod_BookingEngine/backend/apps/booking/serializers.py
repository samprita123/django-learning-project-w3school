from rest_framework import serializers
from .models import Hotel, HotelImage, Amenity, RoomType, RatePlan, Policy, NearbyPlace, Booking, Guest, EventRequest, RestaurantRequest, PromoCode, RoomInventory, AddonPackage, PaymentGateway

class PromoCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromoCode
        fields = '__all__'

class HotelImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = HotelImage
        fields = '__all__'

class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = '__all__'

class RatePlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = RatePlan
        fields = '__all__'

class RoomTypeSerializer(serializers.ModelSerializer):
    rate_plans = RatePlanSerializer(many=True, read_only=True)
    starting_price = serializers.ReadOnlyField()

    class Meta:
        model = RoomType
        fields = '__all__'

class PolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = Policy
        fields = '__all__'

class NearbyPlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NearbyPlace
        fields = '__all__'

class AddonPackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AddonPackage
        fields = '__all__'

class PaymentGatewaySerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentGateway
        fields = '__all__'

class HotelSerializer(serializers.ModelSerializer):
    images = HotelImageSerializer(many=True, read_only=True)
    room_types = serializers.SerializerMethodField()
    policies = PolicySerializer(many=True, read_only=True)
    nearby = NearbyPlaceSerializer(many=True, read_only=True)
    amenities = serializers.SerializerMethodField()
    promo_codes = PromoCodeSerializer(many=True, read_only=True)
    addons = AddonPackageSerializer(many=True, read_only=True)
    payment_gateways = PaymentGatewaySerializer(many=True, read_only=True)

    class Meta:
        model = Hotel
        fields = '__all__'

    def get_room_types(self, obj):
        request = self.context.get('request')
        if request and request.GET.get('include_inactive') == 'true':
            qs = obj.room_types.all()
        else:
            qs = obj.room_types.filter(is_active=True)
        return RoomTypeSerializer(qs, many=True).data

    def get_amenities(self, obj):
        amenities = Amenity.objects.filter(hotelamenity__hotel=obj)
        return AmenitySerializer(amenities, many=True).data

class GuestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guest
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    guest = GuestSerializer(read_only=True)
    hotel_name = serializers.CharField(source='hotel.name', read_only=True)
    hotel_phone = serializers.CharField(source='hotel.phone', read_only=True)
    hotel_email = serializers.CharField(source='hotel.email', read_only=True)
    hotel_address = serializers.CharField(source='hotel.address', read_only=True)
    room_name = serializers.CharField(source='room_type.name', read_only=True)
    rate_plan_title = serializers.CharField(source='rate_plan.title', read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'

class EventRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventRequest
        fields = '__all__'

class RestaurantRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = RestaurantRequest
        fields = '__all__'

# --- Epic 1 Schema & Request Serializers for Swagger & Validation ---

class PropertySearchQuerySerializer(serializers.Serializer):
    q = serializers.CharField(required=False, help_text="Search by hotel name, city, state, or address")
    property_type = serializers.CharField(required=False, help_text="Filter by property type (e.g. Hotel, Resort, Villa, Apartment)")
    min_rating = serializers.IntegerField(required=False, help_text="Minimum star rating or guest rating filter")
    sort_by = serializers.ChoiceField(
        choices=['price_low_to_high', 'price_high_to_low', 'rating', 'popularity'],
        default='popularity',
        required=False,
        help_text="Sorting criteria"
    )

class OccupancyCalcRequestSerializer(serializers.Serializer):
    check_in = serializers.DateField(help_text="Check-in date (YYYY-MM-DD)")
    check_out = serializers.DateField(help_text="Check-out date (YYYY-MM-DD)")
    num_adults = serializers.IntegerField(default=2, min_value=1, help_text="Number of adult guests")
    num_children = serializers.IntegerField(default=0, min_value=0, help_text="Number of child guests")
    child_ages = serializers.ListField(
        child=serializers.IntegerField(min_value=0, max_value=17),
        required=False,
        default=list,
        help_text="List of child ages (e.g. [3, 8])"
    )
    num_infants = serializers.IntegerField(default=0, min_value=0, help_text="Number of infants (age < 2)")
    extra_beds = serializers.IntegerField(default=0, min_value=0, help_text="Number of requested extra beds")

class AvailabilitySearchRequestSerializer(serializers.Serializer):
    hotel_slug = serializers.CharField(required=False, help_text="Hotel slug identifier (optional for multi-property)")
    check_in = serializers.DateField(help_text="Check-in date (YYYY-MM-DD)")
    check_out = serializers.DateField(help_text="Check-out date (YYYY-MM-DD)")
    num_rooms = serializers.IntegerField(default=1, min_value=1, help_text="Number of rooms needed")
    adults = serializers.IntegerField(default=2, min_value=1, help_text="Total adult guests")
    children = serializers.IntegerField(default=0, min_value=0, help_text="Total child guests")
    promo_code = serializers.CharField(required=False, allow_blank=True, help_text="Promo code or Corporate access code")

class PromoCodeValidateRequestSerializer(serializers.Serializer):
    code = serializers.CharField(help_text="Promotional or corporate discount code (e.g. SUMMER2026)")
    hotel_slug = serializers.CharField(required=False, help_text="Target hotel slug")
    booking_amount = serializers.DecimalField(max_digits=10, decimal_places=2, help_text="Total booking amount before discount")

class FlexibleCalendarRequestSerializer(serializers.Serializer):
    hotel_slug = serializers.CharField(help_text="Target hotel slug")
    room_type_slug = serializers.CharField(required=False, help_text="Target room type slug")
    start_date = serializers.DateField(required=False, help_text="Start date for calendar grid (YYYY-MM-DD)")
    range_days = serializers.IntegerField(default=7, min_value=3, max_value=30, help_text="Number of days to return (e.g. 7 or 30)")


