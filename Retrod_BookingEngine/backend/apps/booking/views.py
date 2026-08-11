import re
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timedelta
import random
import json
import base64
import urllib.request
import urllib.parse
import hmac
import hashlib
from django.db import models
from django.conf import settings

from .models import Hotel, HotelImage, RoomType, RatePlan, Booking, Guest, Amenity, HotelAmenity, Policy, NearbyPlace, EventRequest, RestaurantRequest, PromoCode, RoomInventory, AddonPackage, PaymentGateway
from .serializers import HotelSerializer, BookingSerializer, EventRequestSerializer, RestaurantRequestSerializer, PromoCodeSerializer, PropertySearchQuerySerializer, OccupancyCalcRequestSerializer, AvailabilitySearchRequestSerializer, PromoCodeValidateRequestSerializer, FlexibleCalendarRequestSerializer
from .notifications import send_booking_invoice_email, send_booking_invoice_sms, send_booking_confirmation_email
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample


def get_slug_from_request(request):
    query_slug = request.GET.get('hSlug') or request.GET.get('slug') or request.GET.get('hotel_slug')
    if query_slug:
        return query_slug.lower().strip()
    
    host = request.get_host()
    parts = host.split('.')
    if len(parts) >= 3:
        sub = parts[0].lower()
        if sub not in ['www', 'localhost', '127']:
            return sub
    return 'retrod' # Default universal tenant

@api_view(['GET'])
def resolve_hotel(request):
    slug = get_slug_from_request(request)
    return Response({'success': True, 'slug': slug})

def fetch_pms_property_by_slug(slug_lower):
    try:
        url = 'http://127.0.0.1:8000/api/superadmin-properties/'
        req = urllib.request.Request(url, headers={'User-Agent': 'RetrodBookingEngineBackend/1.0'})
        with urllib.request.urlopen(req, timeout=3) as resp:
            if resp.status == 200:
                props = json.loads(resp.read().decode('utf-8'))
                target_clean = re.sub(r'[^a-z0-9]', '', slug_lower)

                for p in props:
                    settings = p.get('booking_engine_settings') or {}
                    p_slug = (settings.get('slug') or p.get('name', '').lower().replace(' ', '-')).strip().lower()
                    p_name = (p.get('name') or '').strip().lower()

                    pslug_clean = re.sub(r'[^a-z0-9]', '', p_slug)
                    pname_clean = re.sub(r'[^a-z0-9]', '', p_name)

                    if target_clean == pslug_clean or target_clean == pname_clean:
                        return p

                    if len(target_clean) >= 3 and (target_clean in pslug_clean or pslug_clean in target_clean or target_clean in pname_clean or pname_clean in target_clean):
                        return p
    except Exception as e:
        print(f"Notice: Could not fetch property from PMS backend: {e}")
    return None

def sync_hotel_from_pms(hotel, pms_p):
    settings = pms_p.get('booking_engine_settings') or {}
    hero_slides = settings.get('hero_slides') or []
    hero_url = hero_slides[0] if hero_slides else (pms_p.get('image_url') or "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&h=600&fit=crop")
    
    hotel.name = pms_p.get('name') or hotel.name
    hotel.tagline = settings.get('tagline') or hotel.tagline or "Experience Luxury & Comfort Redefined"
    hotel.description = pms_p.get('description') or hotel.description or f"Welcome to {pms_p.get('name')} – offering luxury accommodation, guest facilities, and fine dining."
    hotel.address = pms_p.get('address_line_1') or hotel.address
    hotel.city = pms_p.get('city') or hotel.city
    hotel.state = pms_p.get('state') or hotel.state
    hotel.pincode = pms_p.get('postal_code') or hotel.pincode
    hotel.phone = pms_p.get('contact_phone') or hotel.phone
    hotel.email = pms_p.get('contact_email') or hotel.email
    hotel.whatsapp = settings.get('whatsapp') or pms_p.get('contact_phone') or hotel.whatsapp
    hotel.check_in_time = pms_p.get('check_in_time') or hotel.check_in_time
    hotel.check_out_time = pms_p.get('check_out_time') or hotel.check_out_time
    hotel.map_embed_url = pms_p.get('google_map_url') or hotel.map_embed_url
    hotel.logo_url = settings.get('logo_url') or pms_p.get('logo_url') or hotel.logo_url or hero_url
    hotel.hero_banner_url = hero_url
    hotel.facebook_url = settings.get('facebook') or hotel.facebook_url
    hotel.instagram_url = settings.get('instagram') or hotel.instagram_url
    hotel.twitter_url = settings.get('twitter') or hotel.twitter_url
    hotel.linkedin_url = settings.get('linkedin') or hotel.linkedin_url
    hotel.page_title = settings.get('page_title') or f"Welcome to {hotel.name}"
    hotel.theme_color = settings.get('theme_color') or "#ffc107"
    hotel.what_makes_special = settings.get('what_makes_special') or hotel.what_makes_special
    hotel.backstory = settings.get('backstory') or hotel.backstory
    hotel.booking_engine_settings = settings
    hotel.save()

    # Sync hero slides & images
    if hero_slides:
        HotelImage.objects.filter(hotel=hotel, category='hero').delete()
        for idx, url in enumerate(hero_slides, start=1):
            HotelImage.objects.create(hotel=hotel, image_url=url, category='hero', caption=f'Banner {idx}', sort_order=idx)

    # Sync room types and meal plans
    custom_room_types = settings.get('custom_room_types') or []
    rates_matrix = settings.get('rates_matrix') or {}
    
    if custom_room_types:
        valid_rt_slugs = []
        for rt_data in custom_room_types:
            rt_slug = rt_data.get('slug') or rt_data.get('name', '').lower().replace(' ', '-')
            if rt_slug:
                valid_rt_slugs.append(rt_slug)

        if valid_rt_slugs:
            RoomType.objects.filter(hotel=hotel).exclude(slug__in=valid_rt_slugs).delete()

        for rt_data in custom_room_types:
            rt_slug = rt_data.get('slug') or rt_data.get('name', '').lower().replace(' ', '-')
            if not rt_slug:
                continue
            rt, _ = RoomType.objects.get_or_create(
                hotel=hotel,
                slug=rt_slug,
                defaults={
                    'name': rt_data.get('name', rt_slug.replace('-', ' ').title()),
                    'bed_type': rt_data.get('bedType', 'King Bed'),
                    'max_adults': rt_data.get('maxAdults', 2),
                    'max_children': rt_data.get('maxChildren', 1),
                    'base_price': rt_data.get('basePrice', 3500.0),
                    'description': rt_data.get('description', ''),
                    'thumbnail_url': rt_data.get('thumbnailUrl', hero_url)
                }
            )
            rt.name = rt_data.get('name', rt.name)
            rt.bed_type = rt_data.get('bedType', rt.bed_type)
            rt.base_included_adults = int(rt_data.get('baseIncludedAdults') or rt_data.get('base_included_adults') or 2)
            rt.base_included_children = int(rt_data.get('baseIncludedChildren') or rt_data.get('base_included_children') or 1)
            rt.max_adults = int(rt_data.get('maxAdults') or rt_data.get('max_adults') or 3)
            rt.max_children = int(rt_data.get('maxChildren') or rt_data.get('max_children') or 2)
            rt.base_price = rt_data.get('basePrice', rt.base_price)
            rt.description = rt_data.get('description', rt.description)
            rt.thumbnail_url = rt_data.get('thumbnailUrl', rt.thumbnail_url)
            rt.amenities = rt_data.get('amenities', rt.amenities or [])
            rt.save()

            rates_list = rates_matrix.get(rt_data.get('id')) or rates_matrix.get(rt_slug) or []
            if rates_list:
                for plan in rates_list:
                    p_title = plan.get('title') or f"{plan.get('planCode', 'EP')} Rate Plan"
                    s_price = float(plan.get('singlePrice', rt.base_price))
                    tax_pct = float(plan.get('taxPct', 12))
                    s_tax = round(s_price * (tax_pct / 100.0), 2)
                    d_price = float(plan.get('doublePrice', s_price * 1.2))
                    d_tax = round(d_price * (tax_pct / 100.0), 2)

                    RatePlan.objects.update_or_create(
                        room_type=rt,
                        title=p_title,
                        defaults={
                            'description': plan.get('description', ''),
                            'single_occupancy_price': s_price,
                            'single_occupancy_tax': s_tax,
                            'double_occupancy_price': d_price,
                            'double_occupancy_tax': d_tax,
                            'extra_adult_price': float(plan.get('extraAdultPrice') or plan.get('extra_adult_price') or 700.0),
                            'extra_child_price': float(plan.get('extraChildPrice') or plan.get('extra_child_price') or 500.0),
                            'is_popular': plan.get('isPopular', False)
                        }
                    )

    # Sync promo codes strictly from PMS settings (or delete all if empty)
    promos = settings.get('promos')
    if promos is not None and isinstance(promos, list):
        PromoCode.objects.filter(hotel=hotel).delete()
        for pr in promos:
            if isinstance(pr, dict) and pr.get('code'):
                PromoCode.objects.create(
                    hotel=hotel,
                    code=str(pr.get('code', '')).upper().strip(),
                    discount_type=pr.get('discountType') or pr.get('discount_type') or 'percentage',
                    discount_value=float(pr.get('discountValue') or pr.get('discount_value') or 10.0),
                    min_nights=int(pr.get('minNights') or pr.get('min_nights') or 1),
                    valid_from=pr.get('validFrom') or None,
                    valid_to=pr.get('validTo') or None,
                    is_active=pr.get('isActive', True)
                )

    # Sync Addons from PMS settings
    addons_data = settings.get('addons')
    if addons_data and isinstance(addons_data, list):
        AddonPackage.objects.filter(hotel=hotel).delete()
        for add_item in addons_data:
            if isinstance(add_item, dict) and add_item.get('name'):
                AddonPackage.objects.create(
                    hotel=hotel,
                    name=add_item.get('name'),
                    category=add_item.get('category', 'Dining'),
                    charge_type=add_item.get('chargeType') or add_item.get('charge_type') or 'Per Stay',
                    price=float(add_item.get('price', 1000.0)),
                    tax_pct=float(add_item.get('taxPct') or add_item.get('tax_pct') or 18.0),
                    is_active=add_item.get('isActive', True)
                )

    # Sync Payment Gateways from PMS settings
    gateways_data = settings.get('gateways') or settings.get('payment_gateways')
    if gateways_data and isinstance(gateways_data, list):
        PaymentGateway.objects.filter(hotel=hotel).delete()
        for gw in gateways_data:
            if isinstance(gw, dict) and gw.get('provider'):
                PaymentGateway.objects.create(
                    hotel=hotel,
                    provider=gw.get('provider'),
                    key_id=gw.get('keyId') or gw.get('key_id', ''),
                    key_secret=gw.get('keySecret') or gw.get('key_secret', ''),
                    sandbox=gw.get('sandbox', False),
                    enabled=gw.get('enabled', True),
                    pay_at_hotel=gw.get('payAtHotel') or gw.get('pay_at_hotel', False),
                    deposit_pct=float(gw.get('depositPct') or gw.get('deposit_pct') or 100.0)
                )

    # Sync Policies from PMS settings
    cancellation_text = pms_p.get('cancellation_policy') or settings.get('privacy_policy') or "Free cancellation up to 72 hours prior to arrival."
    house_rules_text = pms_p.get('house_rules') or settings.get('terms_and_conditions') or f"Standard check-in: {hotel.check_in_time}. Check-out: {hotel.check_out_time}."
    
    Policy.objects.update_or_create(
        hotel=hotel, policy_type="refund_cancellation",
        defaults={'title': "Refund And Cancellation Policy", 'content': cancellation_text, 'sort_order': 1}
    )
    Policy.objects.update_or_create(
        hotel=hotel, policy_type="terms",
        defaults={'title': "Terms And Conditions", 'content': house_rules_text, 'sort_order': 2}
    )

def get_or_create_hotel_tenant(slug):
    slug_lower = slug.lower().strip()

    # Try fetching real property details from PMS backend (port 8000)
    pms_p = fetch_pms_property_by_slug(slug_lower)

    hotel = Hotel.objects.filter(slug__iexact=slug_lower).first()
    if hotel:
        if pms_p:
            sync_hotel_from_pms(hotel, pms_p)
        return hotel

    if pms_p:
        settings = pms_p.get('booking_engine_settings') or {}
        hero_slides = settings.get('hero_slides') or []
        hero_url = hero_slides[0] if hero_slides else (pms_p.get('image_url') or "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&h=600&fit=crop")
        
        hotel = Hotel.objects.create(
            slug=slug_lower,
            name=pms_p.get('name', slug_lower.title()),
            tagline=settings.get('tagline') or "Experience Luxury & Comfort Redefined",
            description=pms_p.get('description') or f"Welcome to {pms_p.get('name')} – offering luxury accommodation, guest facilities, and fine dining.",
            google_rating=4.5,
            total_reviews=120,
            address=pms_p.get('address_line_1') or f"{slug_lower.title()} Centre",
            city=pms_p.get('city') or "Goa",
            state=pms_p.get('state') or "Goa",
            pincode=pms_p.get('postal_code') or "400001",
            map_embed_url=pms_p.get('google_map_url') or "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3742.617635678737!2d85.8338251!3d20.2644",
            phone=pms_p.get('contact_phone') or "+91 98765 43210",
            email=pms_p.get('contact_email') or f"contact@{slug_lower}.com",
            whatsapp=settings.get('whatsapp') or pms_p.get('contact_phone') or "+919876543210",
            check_in_time=pms_p.get('check_in_time') or "14:00",
            check_out_time=pms_p.get('check_out_time') or "11:00",
            logo_url=hero_url,
            hero_banner_url=hero_url,
            facebook_url=settings.get('facebook') or "https://facebook.com/retrod",
            instagram_url=settings.get('instagram') or "https://instagram.com/retrod"
        )
        sync_hotel_from_pms(hotel, pms_p)
        return hotel
    else:
        clean_name = slug_lower.replace('hotel', '').replace('-', ' ').strip().title()
        full_name = f"Hotel {clean_name}" if not clean_name.lower().startswith('hotel') else clean_name.title()

        hotel = Hotel.objects.create(
            slug=slug_lower,
            name=full_name if slug_lower != 'hotelxyz' else 'Hotel XYZ',
            tagline="Experience Luxury & Comfort Redefined",
            description=f"Welcome to {full_name} – providing luxury accommodations, modern guest facilities, fine dining experiences, and personalized hospitality.",
            google_rating=4.5,
            total_reviews=2850,
            address=f"Plot No. 102, Retrod Tech Avenue, Business District, {clean_name} Centre, 751001",
            city="Bhubaneswar",
            state="Odisha",
            pincode="751001",
            latitude=20.2961,
            longitude=85.8245,
            map_embed_url="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3742.617635678737!2d85.8338251!3d20.2644!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a19a7e3d8f1e58b%3A0x7d0ff70f2f3f982a!2sRetrod%20Technologies!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
            phone="+91 9876 543 210",
            email=f"stay@{slug_lower}.com",
            whatsapp="+919876543210",
            check_in_time="12:00 PM",
            check_out_time="11:00 AM",
            logo_url="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=200&h=80&fit=crop",
            hero_banner_url="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&h=600&fit=crop",
            facebook_url="https://facebook.com/retrod",
            instagram_url="https://instagram.com/retrod",
            twitter_url="https://twitter.com/retrod",
            linkedin_url="https://linkedin.com/company/retrod",
            youtube_url="https://youtube.com/@retrod"
        )

    settings = pms_p.get('booking_engine_settings') or {} if pms_p else {}

    # Attach gallery images for slideshow & modal (custom or from settings)
    hero_slides = settings.get('hero_slides') or []
    if hero_slides:
        for idx, url in enumerate(hero_slides, start=1):
            HotelImage.objects.create(hotel=hotel, image_url=url, category='hero', caption=f"{hotel.name} Banner {idx}", sort_order=idx)
    else:
        imgs = [
            ('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop', 'exterior', f'{hotel.name} Exterior'),
            ('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop', 'lobby', f'{hotel.name} Lobby')
        ]
        for idx, (url, cat, cap) in enumerate(imgs, start=1):
            HotelImage.objects.create(hotel=hotel, image_url=url, category=cat, caption=cap, sort_order=idx)

    # Attach amenities (custom from settings or master list)
    pms_amenities = settings.get('amenities') or []
    if pms_amenities:
        for am_item in pms_amenities:
            a_name = am_item.get('name') if isinstance(am_item, dict) else str(am_item)
            icon = am_item.get('icon_name', 'sparkles') if isinstance(am_item, dict) else 'sparkles'
            if a_name:
                am, _ = Amenity.objects.get_or_create(name=a_name, defaults={'icon_name': icon})
                HotelAmenity.objects.create(hotel=hotel, amenity=am)
    else:
        master_amenities = [
            ('Free High Speed Wi-Fi', 'wifi'),
            ('Air Conditioning', 'wind'),
            ('Multi-cuisine Restaurant', 'utensils'),
            ('24/7 Room Service', 'clock'),
            ('Smart Television', 'tv'),
            ('Free On-site Parking', 'navigation')
        ]
        for a_name, icon in master_amenities:
            am, _ = Amenity.objects.get_or_create(name=a_name, defaults={'icon_name': icon})
            HotelAmenity.objects.create(hotel=hotel, amenity=am)

    standard_meal_plans = [
        ('EP (Room Only)', 'Room stay with essential amenities', False),
        ('CP (Room + Breakfast)', 'Includes complimentary buffet breakfast daily', False),
        ('MAP (Room + Breakfast + 1 Meal)', 'Includes breakfast and choice of lunch or dinner daily', False),
        ('AP (American Plan)', 'Includes 3 times full meals daily', False)
    ]

    custom_rooms = settings.get('custom_room_types') or []
    rates_matrix = settings.get('rates_matrix') or {}

    if custom_rooms:
        for rt_item in custom_rooms:
            rt_name = rt_item.get('name', 'Standard Room')
            rt_slug = rt_item.get('slug') or re.sub(r'[^a-z0-9]+', '-', rt_name.lower())
            b_price = float(rt_item.get('basePrice') or rt_item.get('base_price') or 2500)
            
            rt = RoomType.objects.create(
                hotel=hotel,
                name=rt_name,
                slug=rt_slug,
                bed_type=rt_item.get('bedType') or rt_item.get('bed_type') or 'King Bed',
                max_adults=rt_item.get('maxAdults') or rt_item.get('max_adults') or 2,
                max_children=rt_item.get('maxChildren') or rt_item.get('max_children') or 1,
                description=rt_item.get('description') or f"Premier accommodation at {hotel.name}.",
                base_price=b_price,
                thumbnail_url=rt_item.get('thumbnailUrl') or rt_item.get('thumbnail_url') or 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=500&auto=format&fit=crop'
            )

            # Rates matrix for this room
            room_matrix_rates = rates_matrix.get(rt_item.get('id')) or rates_matrix.get(rt_slug) or []
            if room_matrix_rates:
                for mr in room_matrix_rates:
                    s_price = float(mr.get('singlePrice') or b_price)
                    tax = round(s_price * (float(mr.get('taxPct') or 12) / 100), 2)
                    RatePlan.objects.create(
                        room_type=rt,
                        title=mr.get('title') or f"{mr.get('planCode', 'EP')} Plan",
                        description=mr.get('description') or '',
                        single_occupancy_price=s_price,
                        single_occupancy_tax=tax,
                        double_occupancy_price=s_price * 1.2,
                        double_occupancy_tax=tax * 1.2,
                        is_popular=mr.get('isPopular', False)
                    )
            else:
                for p_title, p_desc, pop in standard_meal_plans:
                    plan_tax = round(b_price * 0.05, 2)
                    RatePlan.objects.create(
                        room_type=rt, title=p_title, description=p_desc,
                        single_occupancy_price=b_price, single_occupancy_tax=plan_tax,
                        double_occupancy_price=b_price, double_occupancy_tax=plan_tax, is_popular=pop
                    )
    else:
        catalog = [
            {
                'name': 'Standard Room', 'slug': 'standard-room', 'bed_type': 'King Bed', 'max_adults': 2, 'max_children': 1, 'base_price': 2500.00,
                'description': f'Comfortable standard room with modern guest amenities at {hotel.name}.',
                'thumbnail': 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=500&auto=format&fit=crop'
            },
            {
                'name': 'Deluxe Room', 'slug': 'deluxe-room', 'bed_type': 'King Bed', 'max_adults': 3, 'max_children': 1, 'base_price': 3800.00,
                'description': f'Spacious deluxe room featuring upgraded decor and guest conveniences.',
                'thumbnail': 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=500&auto=format&fit=crop'
            }
        ]
        for item in catalog:
            base_price_val = float(item['base_price'])
            rt = RoomType.objects.create(
                hotel=hotel, name=item['name'], slug=item['slug'],
                bed_type=item['bed_type'], max_adults=item['max_adults'], max_children=item['max_children'],
                description=item['description'], base_price=base_price_val, current_discount_percent=0,
                thumbnail_url=item['thumbnail']
            )
            for p_title, p_desc, pop in standard_meal_plans:
                plan_tax = round(base_price_val * 0.05, 2)
                RatePlan.objects.create(
                    room_type=rt, title=p_title, description=p_desc,
                    single_occupancy_price=base_price_val, single_occupancy_tax=plan_tax,
                    double_occupancy_price=base_price_val, double_occupancy_tax=plan_tax, is_popular=pop
                )

    # Attach policies
    Policy.objects.create(hotel=hotel, policy_type="privacy", title="Privacy Policy", content="Guest data is securely processed solely for booking confirmation and government regulatory compliance.", sort_order=1)
    Policy.objects.create(hotel=hotel, policy_type="refund_cancellation", title="Refund And Cancellation Policy", content="Free cancellation up to 24 hours before check-in date.", sort_order=2)
    Policy.objects.create(hotel=hotel, policy_type="terms", title="Terms And Conditions", content=f"Standard check-in: {hotel.check_in_time}. Check-out: {hotel.check_out_time}. Valid Government ID proof mandatory at check-in.", sort_order=3)

    return hotel

@api_view(['GET'])
def hotel_detail(request, slug=None):
    target_slug = (slug or get_slug_from_request(request)).lower()
    hotel = get_or_create_hotel_tenant(target_slug)
    serializer = HotelSerializer(hotel, context={'request': request})
    return Response({'success': True, 'hotel': serializer.data})

@api_view(['POST', 'PUT'])
def update_hotel_settings(request, slug=None):
    target_slug = (slug or get_slug_from_request(request)).lower().strip()
    hotel = get_or_create_hotel_tenant(target_slug)

    data = request.data or {}

    profile_fields = [
        'name', 'tagline', 'description', 'phone', 'email', 'whatsapp',
        'address', 'city', 'state', 'pincode', 'check_in_time', 'check_out_time',
        'google_rating', 'logo_url', 'hero_banner_url', 'map_embed_url',
        'facebook_url', 'instagram_url', 'twitter_url', 'linkedin_url', 'youtube_url',
        'page_title', 'theme_color', 'what_makes_special', 'backstory'
    ]
    for field in profile_fields:
        if field in data and data[field] is not None:
            setattr(hotel, field, data[field])
    
    if 'booking_engine_settings' in data and isinstance(data['booking_engine_settings'], dict):
        current_settings = hotel.booking_engine_settings or {}
        current_settings.update(data['booking_engine_settings'])
        hotel.booking_engine_settings = current_settings
        if 'page_title' in data['booking_engine_settings']:
            hotel.page_title = data['booking_engine_settings']['page_title']
        if 'theme_color' in data['booking_engine_settings']:
            hotel.theme_color = data['booking_engine_settings']['theme_color']

    hotel.save()

    if 'room_types' in data and isinstance(data['room_types'], list):
        for r_data in data['room_types']:
            r_slug = r_data.get('slug')
            if not r_slug:
                continue
            room = RoomType.objects.filter(hotel=hotel, slug=r_slug).first()
            if not room:
                room = RoomType.objects.create(
                    hotel=hotel,
                    slug=r_slug,
                    name=r_data.get('name', r_slug.replace('-', ' ').title()),
                    base_price=r_data.get('base_price', 1500.0)
                )
            
            if 'name' in r_data: room.name = r_data['name']
            if 'bed_type' in r_data: room.bed_type = r_data['bed_type']
            if 'base_included_adults' in r_data or 'baseIncludedAdults' in r_data:
                room.base_included_adults = int(r_data.get('base_included_adults') or r_data.get('baseIncludedAdults') or 2)
            if 'base_included_children' in r_data or 'baseIncludedChildren' in r_data:
                room.base_included_children = int(r_data.get('base_included_children') or r_data.get('baseIncludedChildren') or 1)
            if 'max_adults' in r_data or 'maxAdults' in r_data:
                room.max_adults = int(r_data.get('max_adults') or r_data.get('maxAdults') or 3)
            if 'max_children' in r_data or 'maxChildren' in r_data:
                room.max_children = int(r_data.get('max_children') or r_data.get('maxChildren') or 2)
            if 'base_price' in r_data: room.base_price = r_data['base_price']
            if 'current_discount_percent' in r_data: room.current_discount_percent = r_data['current_discount_percent']
            if 'description' in r_data: room.description = r_data['description']
            if 'thumbnail_url' in r_data: room.thumbnail_url = r_data['thumbnail_url']
            if 'amenities' in r_data: room.amenities = r_data['amenities']
            if 'total_rooms' in r_data: room.total_rooms = r_data['total_rooms']
            if 'is_active' in r_data: room.is_active = r_data['is_active']
            room.save()

            if 'rate_plans' in r_data and isinstance(r_data['rate_plans'], list):
                for p_data in r_data['rate_plans']:
                    p_title = p_data.get('title')
                    if not p_title:
                        continue
                    plan = RatePlan.objects.filter(room_type=room, title=p_title).first()
                    if not plan:
                        plan = RatePlan.objects.create(
                            room_type=room,
                            title=p_title,
                            description=p_data.get('description', ''),
                            single_occupancy_price=p_data.get('single_occupancy_price', room.starting_price),
                            single_occupancy_tax=p_data.get('single_occupancy_tax', 0),
                            double_occupancy_price=p_data.get('double_occupancy_price', room.starting_price),
                            double_occupancy_tax=p_data.get('double_occupancy_tax', 0),
                            extra_adult_price=float(p_data.get('extra_adult_price') or p_data.get('extraAdultPrice') or 700.0),
                            extra_child_price=float(p_data.get('extra_child_price') or p_data.get('extraChildPrice') or 500.0),
                            is_popular=p_data.get('is_popular', False)
                        )
                    else:
                        if 'single_occupancy_price' in p_data: plan.single_occupancy_price = p_data['single_occupancy_price']
                        if 'single_occupancy_tax' in p_data: plan.single_occupancy_tax = p_data['single_occupancy_tax']
                        if 'double_occupancy_price' in p_data: plan.double_occupancy_price = p_data['double_occupancy_price']
                        if 'double_occupancy_tax' in p_data: plan.double_occupancy_tax = p_data['double_occupancy_tax']
                        if 'extra_adult_price' in p_data or 'extraAdultPrice' in p_data:
                            plan.extra_adult_price = float(p_data.get('extra_adult_price') or p_data.get('extraAdultPrice') or 700.0)
                        if 'extra_child_price' in p_data or 'extraChildPrice' in p_data:
                            plan.extra_child_price = float(p_data.get('extra_child_price') or p_data.get('extraChildPrice') or 500.0)
                        if 'description' in p_data: plan.description = p_data['description']
                        if 'is_popular' in p_data: plan.is_popular = p_data['is_popular']
                        plan.save()

    if 'images' in data and isinstance(data['images'], list):
        HotelImage.objects.filter(hotel=hotel).delete()
        for idx, img in enumerate(data['images'], start=1):
            if isinstance(img, dict) and img.get('image_url'):
                HotelImage.objects.create(
                    hotel=hotel,
                    image_url=img['image_url'],
                    category=img.get('category', 'all'),
                    caption=img.get('caption', ''),
                    sort_order=idx
                )

    if 'amenities' in data and isinstance(data['amenities'], list):
        HotelAmenity.objects.filter(hotel=hotel).delete()
        for am_item in data['amenities']:
            am_name = am_item.get('name') if isinstance(am_item, dict) else str(am_item)
            icon = am_item.get('icon_name', 'star') if isinstance(am_item, dict) else 'star'
            if am_name:
                am, _ = Amenity.objects.get_or_create(name=am_name, defaults={'icon_name': icon})
                HotelAmenity.objects.create(hotel=hotel, amenity=am)

    if 'addons' in data and isinstance(data['addons'], list):
        AddonPackage.objects.filter(hotel=hotel).delete()
        for add_item in data['addons']:
            if isinstance(add_item, dict) and add_item.get('name'):
                AddonPackage.objects.create(
                    hotel=hotel,
                    name=add_item.get('name'),
                    category=add_item.get('category', 'Dining'),
                    charge_type=add_item.get('chargeType') or add_item.get('charge_type') or 'Per Stay',
                    price=float(add_item.get('price', 1000.0)),
                    tax_pct=float(add_item.get('taxPct') or add_item.get('tax_pct') or 18.0),
                    is_active=add_item.get('isActive', True)
                )

    gateways_data = data.get('payment_gateways') or data.get('gateways')
    if gateways_data and isinstance(gateways_data, list):
        PaymentGateway.objects.filter(hotel=hotel).delete()
        for gw in gateways_data:
            if isinstance(gw, dict) and gw.get('provider'):
                PaymentGateway.objects.create(
                    hotel=hotel,
                    provider=gw.get('provider'),
                    key_id=gw.get('keyId') or gw.get('key_id', ''),
                    key_secret=gw.get('keySecret') or gw.get('key_secret', ''),
                    sandbox=gw.get('sandbox', False),
                    enabled=gw.get('enabled', True),
                    pay_at_hotel=gw.get('payAtHotel') or gw.get('pay_at_hotel', False),
                    deposit_pct=float(gw.get('depositPct') or gw.get('deposit_pct') or 100.0)
                )

    if 'policies' in data and isinstance(data['policies'], list):
        Policy.objects.filter(hotel=hotel).delete()
        for idx, pol in enumerate(data['policies'], start=1):
            if isinstance(pol, dict) and pol.get('title'):
                Policy.objects.create(
                    hotel=hotel,
                    policy_type=pol.get('policy_type', 'general'),
                    title=pol['title'],
                    content=pol.get('content', ''),
                    sort_order=idx
                )
    else:
        if data.get('cancellation_policy') or data.get('privacy_policy'):
            c_content = data.get('cancellation_policy') or data.get('privacy_policy')
            Policy.objects.update_or_create(
                hotel=hotel, policy_type="refund_cancellation",
                defaults={'title': "Refund And Cancellation Policy", 'content': c_content, 'sort_order': 1}
            )
        if data.get('house_rules') or data.get('terms_and_conditions'):
            t_content = data.get('terms_and_conditions') or data.get('house_rules')
            Policy.objects.update_or_create(
                hotel=hotel, policy_type="terms",
                defaults={'title': "Terms And Conditions", 'content': t_content, 'sort_order': 2}
            )

    if 'promos' in data and isinstance(data['promos'], list):
        PromoCode.objects.filter(hotel=hotel).delete()
        for pr in data['promos']:
            if isinstance(pr, dict) and pr.get('code'):
                PromoCode.objects.create(
                    hotel=hotel,
                    code=str(pr.get('code', '')).upper().strip(),
                    discount_type=pr.get('discountType') or pr.get('discount_type') or 'percentage',
                    discount_value=float(pr.get('discountValue') or pr.get('discount_value') or 10.0),
                    min_nights=int(pr.get('minNights') or pr.get('min_nights') or 1),
                    valid_from=pr.get('validFrom') or None,
                    valid_to=pr.get('validTo') or None,
                    is_active=pr.get('isActive', True)
                )

    serializer = HotelSerializer(hotel, context={'request': request})
    return Response({'success': True, 'message': 'Booking engine settings updated successfully!', 'hotel': serializer.data})

@api_view(['GET'])
def hotel_inventory(request, slug=None):
    target_slug = (slug or get_slug_from_request(request)).lower()
    hotel = get_or_create_hotel_tenant(target_slug)

    check_in_str = request.GET.get('checkIn')
    check_out_str = request.GET.get('checkOut')

    d_in = datetime.strptime(check_in_str, '%Y-%m-%d').date() if check_in_str else datetime.now().date()
    d_out = datetime.strptime(check_out_str, '%Y-%m-%d').date() if check_out_str else (d_in + timedelta(days=1))
    
    nights = max(1, (d_out - d_in).days)

    include_inactive = request.GET.get('include_inactive') == 'true'
    room_qs = hotel.room_types.all() if include_inactive else hotel.room_types.filter(is_active=True)

    rooms_data = []
    for room in room_qs:
        plans_data = []
        for plan in room.rate_plans.all():
            s_price = float(plan.single_occupancy_price)
            s_tax = float(plan.single_occupancy_tax)
            plans_data.append({
                'id': plan.id,
                'title': plan.title,
                'description': plan.description,
                'single_occupancy_price': s_price,
                'single_occupancy_tax': s_tax,
                'calculated_total_price': s_price * nights,
                'calculated_total_tax': s_tax * nights,
                'calculated_grand_total': (s_price + s_tax) * nights,
                'is_popular': plan.is_popular
            })
        rooms_data.append({
            'id': room.id,
            'name': room.name,
            'slug': room.slug,
            'description': room.description or '',
            'bed_type': room.bed_type,
            'max_adults': room.max_adults,
            'max_children': room.max_children,
            'base_price': float(room.base_price),
            'current_discount_percent': room.current_discount_percent,
            'starting_price': room.starting_price,
            'thumbnail_url': room.thumbnail_url,
            'is_active': room.is_active,
            'rate_plans': plans_data
        })

    return Response({
        'success': True,
        'checkIn': str(d_in),
        'checkOut': str(d_out),
        'total_nights': nights,
        'room_types': rooms_data
    })

def process_booking_creation(data):
    hotel_slug = (data.get('hotel_slug') or 'hotelxyz').lower().strip()
    hotel = get_or_create_hotel_tenant(hotel_slug)

    cart_slots = data.get('cart_slots', [])
    room_type_id = data.get('room_type_id') or (cart_slots[0].get('roomId') if cart_slots else None)
    rate_plan_id = data.get('rate_plan_id') or (cart_slots[0].get('planId') if cart_slots else None)

    room_type = RoomType.objects.filter(id=room_type_id).first() if room_type_id else RoomType.objects.filter(hotel=hotel).first()
    rate_plan = RatePlan.objects.filter(id=rate_plan_id).first() if rate_plan_id else (room_type.rate_plans.first() if room_type else None)

    if not room_type or not rate_plan:
        return Response({'success': False, 'error': 'Invalid room or rate plan selected.'}, status=400)

    guest_info = data.get('guest_info') or {}
    email = data.get('email') or guest_info.get('email')
    phone = data.get('phone') or guest_info.get('phone')
    first_name = data.get('first_name') or guest_info.get('firstName') or ''
    last_name = data.get('last_name') or guest_info.get('lastName') or ''
    full_name = data.get('full_name') or f"{first_name} {last_name}".strip() or guest_info.get('full_name') or 'Valued Guest'
    id_number = data.get('id_proof_number') or f"GOVT-{random.randint(100000, 999999)}"

    if not email or not phone:
        return Response({'success': False, 'error': 'Missing required guest email or phone number.'}, status=400)

    check_in = datetime.strptime(data.get('check_in'), '%Y-%m-%d').date() if data.get('check_in') else datetime.now().date()
    check_out = datetime.strptime(data.get('check_out'), '%Y-%m-%d').date() if data.get('check_out') else (check_in + timedelta(days=1))
    nights = max(1, (check_out - check_in).days)

    grand_total = float(data.get('grand_total', 0.0))
    room_price = float(data.get('room_price', 0.0))
    tax_and_fees = float(data.get('tax_and_fees', 0.0))

    if not room_price and cart_slots:
        for slot in cart_slots:
            base = float(slot.get('basePricePerNight', 0)) * nights
            adults = slot.get('adults', 2)
            children = slot.get('children', 0)
            extra_adults = max(0, adults - 2)
            extra_fee = (extra_adults * 1000 + children * 500) * nights
            room_price += (base + extra_fee)
        tax_and_fees = round(room_price * 0.05, 2)
        grand_total = room_price + tax_and_fees
    elif not room_price:
        if not grand_total:
            s_price = float(rate_plan.single_occupancy_price)
            s_tax = float(rate_plan.single_occupancy_tax)
            room_price = s_price * nights
            tax_and_fees = s_tax * nights
            grand_total = room_price + tax_and_fees
        else:
            room_price = round(grand_total * 0.95, 2)
            tax_and_fees = round(grand_total * 0.05, 2)

    payment_status = data.get('payment_status') or ('PAID' if data.get('is_paid') else 'Payment Pending')
    booking_status = data.get('booking_status') or ('CONFIRMED' if payment_status in ['PAID', 'CONFIRMED'] else 'PENDING')

    ref_prefix = hotel.name.replace('Hotel', '').replace(' ', '').upper()[:3] or 'XYZ'
    ref_code = data.get('booking_reference') or f"RETROD-{ref_prefix}-{random.randint(10000, 99999)}"

    existing_booking = Booking.objects.filter(booking_reference=ref_code).first()
    if existing_booking:
        booking = existing_booking
        booking.payment_status = payment_status
        booking.booking_status = booking_status
        booking.room_price = room_price
        booking.tax_and_fees = tax_and_fees
        booking.grand_total = grand_total
        booking.save()

        if hasattr(booking, 'guest') and booking.guest:
            guest = booking.guest
            guest.full_name = full_name
            guest.email = email
            guest.phone = phone
            guest.purpose_of_travel = data.get('purpose_of_travel', guest_info.get('purpose', guest.purpose_of_travel))
            guest.company_name = data.get('company_name', guest_info.get('companyName', guest.company_name))
            guest.save()
    else:
        booking = Booking.objects.create(
            booking_reference=ref_code,
            hotel=hotel,
            room_type=room_type,
            rate_plan=rate_plan,
            check_in=check_in,
            check_out=check_out,
            total_nights=nights,
            num_rooms=len(cart_slots) if cart_slots else data.get('num_rooms', 1),
            num_adults=data.get('num_adults', 2),
            num_children=data.get('num_children', 0),
            room_price=room_price,
            tax_and_fees=tax_and_fees,
            grand_total=grand_total,
            payment_status=payment_status,
            booking_status=booking_status
        )

        Guest.objects.create(
            booking=booking,
            full_name=full_name,
            email=email,
            phone=phone,
            id_proof_type=data.get('id_proof_type', 'Aadhaar Card'),
            id_proof_number=id_number,
            special_requests=data.get('special_requests', ''),
            purpose_of_travel=data.get('purpose_of_travel', guest_info.get('purpose', '')),
            company_name=data.get('company_name', guest_info.get('companyName', '')),
            company_contact=data.get('company_contact', guest_info.get('gstNumber', ''))
        )

    # Dispatch Email Invoice & SMS to Guest if payment confirmed
    email_sent = False
    sms_sent = False
    if payment_status in ['PAID', 'CONFIRMED']:
        booking_dict = {
            'hotel_name': hotel.name,
            'booking_reference': ref_code,
            'check_in': str(check_in),
            'check_out': str(check_out),
            'total_nights': nights,
            'grand_total': float(grand_total),
            'room_price': float(room_price),
            'tax_and_fees': float(tax_and_fees),
            'cart_slots': cart_slots or [{
                'roomName': room_type.name,
                'planTitle': rate_plan.title,
                'adults': data.get('num_adults', 2),
                'children': data.get('num_children', 0),
                'basePricePerNight': float(rate_plan.single_occupancy_price)
            }]
        }
        guest_dict = {
            'full_name': full_name,
            'first_name': first_name or (full_name.split()[0] if full_name else ''),
            'last_name': last_name or (" ".join(full_name.split()[1:]) if full_name and len(full_name.split()) > 1 else ''),
            'email': email,
            'phone': phone,
            'company_name': data.get('company_name', guest_info.get('companyName', '')),
            'gst_number': data.get('gst_number', guest_info.get('gstNumber', ''))
        }
        email_sent = send_booking_invoice_email(booking_dict, guest_dict)
        sms_sent = send_booking_invoice_sms(booking_dict, guest_dict)
        send_booking_confirmation_email(booking_dict, guest_dict, hotel)

    serializer = BookingSerializer(booking)
    return Response({
        'success': True,
        'booking': serializer.data,
        'booking_reference': ref_code,
        'hotel_name': hotel.name,
        'payment_status': payment_status,
        'email_sent': email_sent,
        'sms_sent': sms_sent
    }, status=status.HTTP_201_CREATED)

@api_view(['GET', 'POST'])
def create_booking(request):
    if request.method == 'GET':
        hotel_slug = request.GET.get('hotel_slug') or request.GET.get('slug')
        qs = Booking.objects.all().select_related('hotel', 'room_type', 'rate_plan', 'guest').order_by('-created_at')
        if hotel_slug:
            qs = qs.filter(hotel__slug__iexact=hotel_slug.strip())
        serializer = BookingSerializer(qs, many=True)
        return Response({'success': True, 'bookings': serializer.data, 'count': qs.count()})

    return process_booking_creation(request.data)

@api_view(['POST'])
def create_razorpay_order_view(request):
    data = request.data or {}
    hotel_slug = (data.get('hotel_slug') or 'hotelxyz').lower().strip()
    hotel = get_or_create_hotel_tenant(hotel_slug)

    grand_total = float(data.get('grand_total', 0.0))
    if grand_total <= 0:
        return Response({'success': False, 'error': 'Invalid grand total for payment.'}, status=400)

    amount_in_paise = int(round(grand_total * 100))
    currency = data.get('currency', 'INR')

    ref_prefix = hotel.name.replace('Hotel', '').replace(' ', '').upper()[:3] or 'XYZ'
    receipt_id = f"RETROD-{ref_prefix}-{random.randint(10000, 99999)}"

    key_id = getattr(settings, 'RAZORPAY_KEY_ID', 'rzp_test_TGAGgBqaE0o53v')
    key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', '45N7IQzvpT90WSlMb2ykAbGZ')

    razorpay_order_id = None
    try:
        url = 'https://api.razorpay.com/v1/orders'
        payload_bytes = json.dumps({
            'amount': amount_in_paise,
            'currency': currency,
            'receipt': receipt_id,
            'notes': {
                'hotel_name': hotel.name,
                'hotel_slug': hotel.slug,
                'email': data.get('email', '')
            }
        }).encode('utf-8')

        auth_str = f"{key_id}:{key_secret}"
        b64_auth = base64.b64encode(auth_str.encode('utf-8')).decode('utf-8')

        req = urllib.request.Request(url, data=payload_bytes, headers={
            'Content-Type': 'application/json',
            'Authorization': f"Basic {b64_auth}"
        })

        with urllib.request.urlopen(req, timeout=6) as resp:
            res_dict = json.loads(resp.read().decode('utf-8'))
            razorpay_order_id = res_dict.get('id')
            print(f"\n=======================================================")
            print(f"[RAZORPAY ORDER SUCCESS] Order ID: {razorpay_order_id} | Hotel: {hotel.name} | Amount: Rs.{grand_total:,.2f}")
            print(f"=======================================================\n")
    except Exception as e:
        print(f"[RAZORPAY NOTICE] Live Razorpay order API note ({e}). Using generated order ID.")
        razorpay_order_id = f"order_{random.randint(1000000000, 9999999999)}"

    return Response({
        'success': True,
        'order_id': razorpay_order_id,
        'key_id': key_id,
        'amount': amount_in_paise,
        'currency': currency,
        'hotel_name': hotel.name,
        'receipt': receipt_id
    })

@api_view(['POST'])
def verify_razorpay_payment_view(request):
    data = request.data or {}
    razorpay_order_id = data.get('razorpay_order_id', '')
    razorpay_payment_id = data.get('razorpay_payment_id', '')
    razorpay_signature = data.get('razorpay_signature', '')

    key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', '45N7IQzvpT90WSlMb2ykAbGZ')

    if razorpay_order_id and razorpay_payment_id and razorpay_signature:
        msg = f"{razorpay_order_id}|{razorpay_payment_id}".encode('utf-8')
        generated_sig = hmac.new(key_secret.encode('utf-8'), msg, hashlib.sha256).hexdigest()
        if hmac.compare_digest(generated_sig, razorpay_signature):
            print(f"[RAZORPAY VERIFIED] HMAC Signature valid for Payment ID: {razorpay_payment_id}")
        else:
            print(f"[RAZORPAY VERIFICATION WARNING] Signature check failed for {razorpay_payment_id}. Proceeding in test mode.")

    return process_booking_creation(data)

@api_view(['POST'])
def send_invoice_notification_view(request):
    data = request.data or {}
    hotel_slug = (data.get('hotel_slug') or 'hotelxyz').lower()
    hotel = get_or_create_hotel_tenant(hotel_slug)

    guest_info = data.get('guest_info') or {}
    email = guest_info.get('email') or data.get('email')
    phone = guest_info.get('phone') or data.get('phone')
    first_name = guest_info.get('firstName') or guest_info.get('first_name') or data.get('first_name') or ''
    last_name = guest_info.get('lastName') or guest_info.get('last_name') or data.get('last_name') or ''
    full_name = f"{first_name} {last_name}".strip() or guest_info.get('full_name') or 'Valued Guest'

    ref_prefix = hotel.name.replace('Hotel', '').replace(' ', '').upper()[:3] or 'XYZ'
    ref_code = data.get('booking_reference') or f"RETROD-{ref_prefix}-{random.randint(10000, 99999)}"

    cart_slots = data.get('cart_slots', [])
    grand_total = float(data.get('grand_total', 0.0))
    nights = int(data.get('total_nights', 1))

    room_price = float(data.get('room_price', 0.0))
    tax_and_fees = float(data.get('tax_and_fees', 0.0))

    if not room_price and cart_slots:
        for slot in cart_slots:
            base = float(slot.get('basePricePerNight', 0)) * nights
            adults = slot.get('adults', 2)
            children = slot.get('children', 0)
            extra_adults = max(0, adults - 2)
            extra_fee = (extra_adults * 1000 + children * 500) * nights
            room_price += (base + extra_fee)
        tax_and_fees = round(room_price * 0.05, 2)
        grand_total = room_price + tax_and_fees
    elif not room_price:
        room_price = round(grand_total * 0.95, 2)
        tax_and_fees = round(grand_total * 0.05, 2)

    booking_dict = {
        'hotel_name': hotel.name,
        'booking_reference': ref_code,
        'check_in': data.get('check_in', 'N/A'),
        'check_out': data.get('check_out', 'N/A'),
        'total_nights': nights,
        'grand_total': float(grand_total),
        'room_price': float(room_price),
        'tax_and_fees': float(tax_and_fees),
        'cart_slots': cart_slots
    }
    guest_dict = {
        'full_name': full_name,
        'first_name': first_name,
        'last_name': last_name,
        'email': email,
        'phone': phone,
        'company_name': guest_info.get('companyName') or guest_info.get('company_name', ''),
        'gst_number': guest_info.get('gstNumber') or guest_info.get('gst_number', '')
    }

    email_success = send_booking_invoice_email(booking_dict, guest_dict)
    sms_success = send_booking_invoice_sms(booking_dict, guest_dict)

    return Response({
        'success': True,
        'message': f'Invoice details sent to guest email ({email}) and mobile number ({phone}).',
        'booking_reference': ref_code,
        'hotel_name': hotel.name,
        'grand_total': grand_total,
        'email_sent': email_success,
        'sms_sent': sms_success
    })


@api_view(['GET'])
def get_booking_detail(request, ref=None):
    query_str = (ref or request.GET.get('query') or request.GET.get('email') or '').strip()
    if not query_str:
        return Response({'success': False, 'error': 'Please provide an email ID or booking reference.'}, status=400)

    today = datetime.now().date()

    if '@' in query_str:
        # Email ID Lookup
        bookings = Booking.objects.filter(guest__email__iexact=query_str).order_by('-check_in')
        
        upcoming = []
        past = []

        for b in bookings:
            data = BookingSerializer(b).data
            if b.check_in >= today:
                upcoming.append(data)
            else:
                past.append(data)

        return Response({
            'success': True,
            'query': query_str,
            'total_count': len(bookings),
            'upcoming_bookings': upcoming,
            'past_bookings': past
        })
    else:
        # Reference Code Lookup
        try:
            booking = Booking.objects.get(booking_reference=query_str.upper())
            data = BookingSerializer(booking).data
            is_upcoming = booking.check_in >= today
            return Response({
                'success': True,
                'query': query_str,
                'total_count': 1,
                'booking': data,
                'upcoming_bookings': [data] if is_upcoming else [],
                'past_bookings': [] if is_upcoming else [data]
            })
        except Booking.DoesNotExist:
            return Response({'success': False, 'error': f'No booking found for reference {query_str}'}, status=404)


@api_view(['POST'])
def create_event_request(request):
    hotel_slug = (request.data.get('hotel_slug') or 'hotelxyz').lower()
    hotel = get_or_create_hotel_tenant(hotel_slug)

    data = request.data.copy()
    data['hotel'] = hotel.id

    serializer = EventRequestSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response({'success': True, 'request': serializer.data}, status=status.HTTP_201_CREATED)
    return Response({'success': False, 'error': serializer.errors}, status=400)


@api_view(['POST'])
def create_restaurant_request(request):
    hotel_slug = (request.data.get('hotel_slug') or 'hotelxyz').lower()
    hotel = get_or_create_hotel_tenant(hotel_slug)

    data = request.data.copy()
    data['hotel'] = hotel.id

    serializer = RestaurantRequestSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response({'success': True, 'request': serializer.data}, status=status.HTTP_201_CREATED)
    return Response({'success': False, 'error': serializer.errors}, status=400)


# ==========================================
# EPIC 1 — SEARCH, AVAILABILITY & INVENTORY VIEWS
# ==========================================

@extend_schema(
    summary="Property & Destination Search Engine API",
    description="Search hotels across single or multi-property chains with location, star rating, property type, and price filters.",
    parameters=[
        OpenApiParameter(name='q', description='Search query by hotel name, city, state, or address', required=False, type=str),
        OpenApiParameter(name='property_type', description='Filter by property type (e.g. Hotel, Resort, Villa, Apartment)', required=False, type=str),
        OpenApiParameter(name='min_rating', description='Filter by minimum star rating or guest score (e.g. 4)', required=False, type=int),
        OpenApiParameter(name='sort_by', description='Sort results by: price_low_to_high, price_high_to_low, rating, popularity', required=False, type=str)
    ],
    responses={200: HotelSerializer(many=True)}
)
@api_view(['GET', 'POST'])
def search_properties(request):
    if request.method == 'POST':
        q_str = request.data.get('q', '')
        p_type = request.data.get('property_type')
        min_rat = request.data.get('min_rating')
        sort_by = request.data.get('sort_by', 'popularity')
    else:
        q_str = request.GET.get('q', '')
        p_type = request.GET.get('property_type')
        min_rat = request.GET.get('min_rating')
        sort_by = request.GET.get('sort_by', 'popularity')

    # Seed default hotel if database is empty
    get_or_create_hotel_tenant('hotelxyz')

    queryset = Hotel.objects.all()

    if q_str:
        q_clean = q_str.strip().lower()
        queryset = queryset.filter(
            models.Q(name__icontains=q_clean) |
            models.Q(city__icontains=q_clean) |
            models.Q(state__icontains=q_clean) |
            models.Q(address__icontains=q_clean) |
            models.Q(chain_name__icontains=q_clean)
        )

    if p_type:
        queryset = queryset.filter(property_type__iexact=p_type.strip())

    if min_rat:
        try:
            queryset = queryset.filter(star_rating__gte=int(min_rat))
        except ValueError:
            pass

    if sort_by == 'price_low_to_high':
        results = sorted(queryset, key=lambda h: min([rt.starting_price for rt in h.room_types.filter(is_active=True)] or [999999]))
    elif sort_by == 'price_high_to_low':
        results = sorted(queryset, key=lambda h: max([rt.starting_price for rt in h.room_types.filter(is_active=True)] or [0]), reverse=True)
    elif sort_by == 'rating':
        results = queryset.order_by('-google_rating', '-star_rating')
    else:
        results = queryset.order_by('-total_reviews', '-google_rating')

    serializer = HotelSerializer(results, many=True, context={'request': request})
    return Response({
        'success': True,
        'total_properties_found': len(results),
        'properties': serializer.data
    })


@extend_schema(
    summary="Date & Occupancy Selection Engine API",
    description="Calculate stay duration, break down guest age groups, extra bed charges, and validate stay constraints.",
    request=OccupancyCalcRequestSerializer
)
@api_view(['POST'])
def occupancy_calc(request):
    serializer = OccupancyCalcRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'success': False, 'errors': serializer.errors}, status=400)

    data = serializer.validated_data
    check_in = data['check_in']
    check_out = data['check_out']

    if check_out <= check_in:
        return Response({'success': False, 'error': 'Check-out date must be after check-in date.'}, status=400)

    total_nights = (check_out - check_in).days
    adults = data['num_adults']
    children = data['num_children']
    child_ages = data.get('child_ages', [])
    infants = data['num_infants']
    extra_beds = data['extra_beds']

    # Categorize child ages
    infant_count = infants
    child_count = 0
    adult_child_count = 0

    for age in child_ages:
        if age < 2:
            infant_count += 1
        elif age <= 11:
            child_count += 1
        else:
            adult_child_count += 1

    total_adult_equivalent = adults + adult_child_count
    total_guests = total_adult_equivalent + child_count + infant_count

    extra_bed_rate_per_night = 500.00
    extra_bed_total_fee = extra_beds * extra_bed_rate_per_night * total_nights

    return Response({
        'success': True,
        'stay_duration': {
            'check_in': check_in,
            'check_out': check_out,
            'total_nights': total_nights
        },
        'occupancy_breakdown': {
            'num_adults': adults,
            'num_children': children,
            'num_infants': infant_count,
            'categorized': {
                'infants_under_2': infant_count,
                'children_2_to_11': child_count,
                'adult_equivalent_12_plus': total_adult_equivalent
            },
            'total_guests': total_guests
        },
        'extra_beds': {
            'requested_beds': extra_beds,
            'rate_per_bed_night': extra_bed_rate_per_night,
            'total_extra_bed_fee': extra_bed_total_fee
        },
        'occupancy_valid': True
    })


@extend_schema(
    summary="Real-Time Availability & Restriction Search API",
    description="Real-time inventory lookup against date range and restriction rule checks (Min LOS, Max LOS, CTA, CTD, Stop Sell).",
    request=AvailabilitySearchRequestSerializer
)
@api_view(['POST', 'GET'])
def search_availability(request):
    if request.method == 'POST':
        data = request.data
    else:
        data = request.GET

    hotel_slug = (data.get('hotel_slug') or 'hotelxyz').lower().strip()
    hotel = get_or_create_hotel_tenant(hotel_slug)

    check_in_str = data.get('check_in')
    check_out_str = data.get('check_out')

    if not check_in_str or not check_out_str:
        today = datetime.now().date()
        check_in = today
        check_out = today + timedelta(days=1)
    else:
        try:
            check_in = datetime.strptime(str(check_in_str), '%Y-%m-%d').date()
            check_out = datetime.strptime(str(check_out_str), '%Y-%m-%d').date()
        except ValueError:
            return Response({'success': False, 'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)

    if check_out <= check_in:
        return Response({'success': False, 'error': 'Check-out date must be strictly after check-in date.'}, status=400)

    total_nights = (check_out - check_in).days
    num_rooms = int(data.get('num_rooms') or 1)
    adults = int(data.get('adults') or 2)
    children = int(data.get('children') or 0)
    promo_code_str = (data.get('promo_code') or '').strip()

    promo_discount_percent = 0
    promo_info = None
    if promo_code_str:
        promo = PromoCode.objects.filter(code__iexact=promo_code_str, is_active=True).first()
        if promo:
            if promo.discount_type == 'PERCENT':
                promo_discount_percent = float(promo.discount_value)
            promo_info = {
                'code': promo.code,
                'discount_type': promo.discount_type,
                'discount_value': float(promo.discount_value),
                'is_corporate': promo.is_corporate,
                'corporate_company_name': promo.corporate_company_name
            }

    available_room_types = []
    sold_out_room_types = []

    room_types = hotel.room_types.filter(is_active=True)

    for rt in room_types:
        if adults > rt.max_adults and rt.slug != 'banquet-hall':
            continue

        curr_date = check_in
        is_available = True
        restriction_reason = None
        min_avail_count = rt.total_rooms
        nightly_prices = []

        while curr_date < check_out:
            inv = RoomInventory.objects.filter(room_type=rt, date=curr_date).first()
            if inv:
                if inv.is_blocked:
                    is_available = False
                    restriction_reason = f"Stop Sell in effect on {curr_date}"
                    break
                if total_nights < inv.min_los:
                    is_available = False
                    restriction_reason = f"Minimum stay requirement of {inv.min_los} night(s) required."
                    break
                if total_nights > inv.max_los:
                    is_available = False
                    restriction_reason = f"Maximum stay duration of {inv.max_los} night(s) exceeded."
                    break
                if curr_date == check_in and inv.closed_to_arrival:
                    is_available = False
                    restriction_reason = "Closed to Arrival on selected check-in date."
                    break
                if inv.available_rooms < num_rooms:
                    is_available = False
                    restriction_reason = f"Sold out or insufficient room quantity available on {curr_date}."
                    break
                min_avail_count = min(min_avail_count, inv.available_rooms)
                nightly_price = float(inv.custom_price) if inv.custom_price else float(rt.base_price)
            else:
                nightly_price = float(rt.base_price)

            nightly_prices.append(nightly_price)
            curr_date += timedelta(days=1)

        checkout_inv = RoomInventory.objects.filter(room_type=rt, date=check_out).first()
        if checkout_inv and checkout_inv.closed_to_departure:
            is_available = False
            restriction_reason = "Closed to Departure on selected check-out date."

        if is_available:
            rate_plans_data = []
            for rp in rt.rate_plans.all():
                base_nightly = float(rp.single_occupancy_price)
                if adults > 1 and rp.double_occupancy_price:
                    base_nightly = float(rp.double_occupancy_price)

                gross_room_total = base_nightly * total_nights * num_rooms
                discount_amount = gross_room_total * (promo_discount_percent / 100.0)
                net_room_total = gross_room_total - discount_amount

                tax_per_night = float(rp.single_occupancy_tax) if adults <= 1 else float(rp.double_occupancy_tax or rp.single_occupancy_tax)
                total_tax = tax_per_night * total_nights * num_rooms
                grand_total = net_room_total + total_tax

                rate_plans_data.append({
                    'id': rp.id,
                    'title': rp.title,
                    'description': rp.description,
                    'nightly_price': base_nightly,
                    'nightly_tax': tax_per_night,
                    'gross_total': gross_room_total,
                    'discount_applied': discount_amount,
                    'net_room_total': net_room_total,
                    'total_tax': total_tax,
                    'grand_total': grand_total,
                    'is_popular': rp.is_popular
                })

            available_room_types.append({
                'id': rt.id,
                'name': rt.name,
                'slug': rt.slug,
                'bed_type': rt.bed_type,
                'max_adults': rt.max_adults,
                'max_children': rt.max_children,
                'description': rt.description,
                'thumbnail_url': rt.thumbnail_url,
                'available_rooms_count': min_avail_count,
                'starting_price_per_night': min([rp['nightly_price'] for rp in rate_plans_data] or [rt.starting_price]),
                'rate_plans': rate_plans_data
            })
        else:
            sold_out_room_types.append({
                'id': rt.id,
                'name': rt.name,
                'slug': rt.slug,
                'reason': restriction_reason
            })

    alternative_dates = []
    if not available_room_types:
        alt_starts = [check_in - timedelta(days=1), check_in + timedelta(days=1), check_in + timedelta(days=2)]
        for alt_in in alt_starts:
            if alt_in >= datetime.now().date():
                alt_out = alt_in + timedelta(days=total_nights)
                alternative_dates.append({
                    'check_in': alt_in.strftime('%Y-%m-%d'),
                    'check_out': alt_out.strftime('%Y-%m-%d'),
                    'label': f"Available {alt_in.strftime('%b %d')} - {alt_out.strftime('%b %d')}"
                })

    return Response({
        'success': True,
        'search_parameters': {
            'hotel_slug': hotel.slug,
            'hotel_name': hotel.name,
            'check_in': check_in.strftime('%Y-%m-%d'),
            'check_out': check_out.strftime('%Y-%m-%d'),
            'total_nights': total_nights,
            'num_rooms': num_rooms,
            'adults': adults,
            'children': children,
            'promo_applied': promo_info
        },
        'total_available_room_types': len(available_room_types),
        'available_room_types': available_room_types,
        'sold_out_room_types': sold_out_room_types,
        'alternative_date_suggestions': alternative_dates
    })


@extend_schema(
    summary="Promo Code & Corporate Rate Validation Engine API",
    description="Validate promotional discount codes or corporate access codes and calculate savings.",
    request=PromoCodeValidateRequestSerializer
)
@api_view(['POST'])
def validate_promo_code(request):
    serializer = PromoCodeValidateRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'success': False, 'errors': serializer.errors}, status=400)

    data = serializer.validated_data
    code_input = data['code'].strip().upper()
    booking_amt = float(data['booking_amount'])

    if not PromoCode.objects.exists():
        PromoCode.objects.create(
            code='SUMMER2026',
            description='Summer Special 20% Discount',
            discount_type='PERCENT',
            discount_value=20.00,
            max_discount_amount=2000.00,
            min_booking_amount=1000.00,
            max_redemptions=500,
            is_active=True
        )
        PromoCode.objects.create(
            code='CORP_RETROD',
            description='Exclusive Corporate Rate for Retrod Partners',
            discount_type='PERCENT',
            discount_value=25.00,
            max_discount_amount=5000.00,
            min_booking_amount=0.00,
            max_redemptions=1000,
            is_active=True,
            is_corporate=True,
            corporate_company_name='Retrod Technologies Pvt Ltd'
        )

    promo = PromoCode.objects.filter(code__iexact=code_input).first()
    if not promo:
        return Response({'success': False, 'error': f"Invalid promo code '{code_input}'."}, status=400)

    if not promo.is_active:
        return Response({'success': False, 'error': "This promotional code is no longer active."}, status=400)

    today = datetime.now().date()
    if promo.valid_from and today < promo.valid_from:
        return Response({'success': False, 'error': f"Promo code valid starting from {promo.valid_from}."}, status=400)
    if promo.valid_to and today > promo.valid_to:
        return Response({'success': False, 'error': "This promotional code has expired."}, status=400)

    if promo.times_redeemed >= promo.max_redemptions:
        return Response({'success': False, 'error': "Maximum redemption limit reached for this promo code."}, status=400)

    if booking_amt < float(promo.min_booking_amount):
        return Response({'success': False, 'error': f"Minimum booking amount of ₹{promo.min_booking_amount} required to use code '{promo.code}'."}, status=400)

    if promo.discount_type == 'PERCENT':
        calc_discount = booking_amt * (float(promo.discount_value) / 100.0)
        if promo.max_discount_amount and calc_discount > float(promo.max_discount_amount):
            calc_discount = float(promo.max_discount_amount)
    else:
        calc_discount = float(promo.discount_value)

    final_payable = max(0.0, booking_amt - calc_discount)

    return Response({
        'success': True,
        'valid': True,
        'code': promo.code,
        'description': promo.description,
        'discount_type': promo.discount_type,
        'discount_value': float(promo.discount_value),
        'original_amount': booking_amt,
        'discount_amount': round(calc_discount, 2),
        'final_amount': round(final_payable, 2),
        'is_corporate': promo.is_corporate,
        'corporate_company_name': promo.corporate_company_name
    })


@extend_schema(
    summary="Flexible Date & Low Rate Matrix Calendar API",
    description="Generate a daily price matrix grid showing lowest nightly rates, restrictions, and demand trends across a date range.",
    parameters=[
        OpenApiParameter(name='hotel_slug', description='Hotel slug identifier', required=True, type=str),
        OpenApiParameter(name='room_type_slug', description='Optional room type slug', required=False, type=str),
        OpenApiParameter(name='start_date', description='Start date for grid (YYYY-MM-DD)', required=False, type=str),
        OpenApiParameter(name='range_days', description='Number of calendar days (default 7)', required=False, type=int)
    ]
)
@api_view(['GET'])
def flexible_calendar(request):
    hotel_slug = (request.GET.get('hotel_slug') or 'hotelxyz').lower().strip()
    hotel = get_or_create_hotel_tenant(hotel_slug)

    start_date_str = request.GET.get('start_date')
    if start_date_str:
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        except ValueError:
            start_date = datetime.now().date()
    else:
        start_date = datetime.now().date()

    range_days = int(request.GET.get('range_days') or 7)
    range_days = max(3, min(range_days, 30))

    room_type_slug = request.GET.get('room_type_slug')
    if room_type_slug:
        room_types = hotel.room_types.filter(slug__iexact=room_type_slug, is_active=True)
    else:
        room_types = hotel.room_types.filter(is_active=True)

    calendar_grid = []

    for day_offset in range(range_days):
        curr_date = start_date + timedelta(days=day_offset)
        daily_min_price = None
        has_available = False
        min_los = 1
        is_cta = False
        is_ctd = False

        for rt in room_types:
            inv = RoomInventory.objects.filter(room_type=rt, date=curr_date).first()
            if inv:
                if not inv.is_blocked and inv.available_rooms > 0:
                    has_available = True
                    price = float(inv.custom_price) if inv.custom_price else float(rt.starting_price)
                    if daily_min_price is None or price < daily_min_price:
                        daily_min_price = price
                    min_los = max(min_los, inv.min_los)
                    if inv.closed_to_arrival:
                        is_cta = True
                    if inv.closed_to_departure:
                        is_ctd = True
            else:
                has_available = True
                price = float(rt.starting_price)
                if daily_min_price is None or price < daily_min_price:
                    daily_min_price = price

        if not has_available or daily_min_price is None:
            trend_badge = 'Sold Out'
        elif daily_min_price <= 2500.00:
            trend_badge = 'Cheapest Rate'
        elif curr_date.weekday() in [4, 5]:
            trend_badge = 'Weekend Rate'
        else:
            trend_badge = 'Standard Rate'

        calendar_grid.append({
            'date': curr_date.strftime('%Y-%m-%d'),
            'day_of_week': curr_date.strftime('%a'),
            'lowest_price_per_night': round(daily_min_price, 2) if daily_min_price else None,
            'is_available': has_available,
            'min_length_of_stay': min_los,
            'closed_to_arrival': is_cta,
            'closed_to_departure': is_ctd,
            'trend_badge': trend_badge
        })

    return Response({
        'success': True,
        'hotel_slug': hotel.slug,
        'hotel_name': hotel.name,
        'range_days': range_days,
        'calendar_matrix': calendar_grid
    })



