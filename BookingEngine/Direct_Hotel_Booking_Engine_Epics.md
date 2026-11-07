# Retrod Direct Hotel Booking Engine — Epics, User Stories & Pointing Document

---

## Architecture Overview
Unlike OTA platforms (Booking.com, MakeMyTrip) where users search across multiple hotels and cities, **Retrod Booking Engine** is a **Direct Hotel Booking Engine Platform**.

When a guest visits a specific hotel's website (e.g. `hotelroyal.com` or `hotelroyal.retrod.in`) and clicks **Book Now**:
1. The engine automatically detects the domain/subdomain (`hotelroyal`) and resolves the specific hotel tenant context.
2. Only `Hotel Royal` rooms, rate plans, amenities, policies, and availability are displayed with zero data conflict from other properties.
3. Bookings and payments are processed directly through `Hotel Royal`'s attached payment merchant gateway.
4. Booking attempts, cart holds, and completed reservations with unique reference numbers (e.g. `RET-ROYAL-2026-89F1`) are stored in the database.
5. Retrod Super Admin provides complete onboarding and configuration for each hotel tenant.

---

## Epic 1 — Tenant Resolution & Multi-Domain Engine
**User Stories & Features**

### 1. Subdomain & Custom Domain Tenant Resolver
Automatic resolution of hotel context from HTTP Host headers and subdomains.

**Features**
* HTTP Host Header Tenant Resolver (`hotelroyal.retrod.in` → Hotel Royal) [5 SP]
* Custom Domain CNAME Routing Support (`book.hotelroyal.com` → Hotel Royal) [8 SP]
* Fallback Tenant Resolver (Query Parameter `?hSlug=hotelroyal`) [2 SP]
* Strict Data Isolation Layer (Filters all queries by resolved hotel ID) [5 SP]
* Invalid / Unregistered Subdomain 404 Error Page [3 SP]

*Subtotal: 23 Story Points*
________________

### 2. Tenant Branding & Theme Engine
Dynamic application of hotel brand assets, colors, and styling based on host.

**Features**
* Dynamic Primary & Secondary Brand Colors per Tenant [3 SP]
* Tenant Logo, Favicon & Hero Banner Injector [3 SP]
* Tenant Custom Font & Typography Injector [3 SP]
* Custom CSS Stylesheet Overrides per Hotel Tenant [5 SP]

*Subtotal: 14 Story Points*
________________

### 3. Tenant Status & Maintenance Mode
Administrative controls for hotel operational status on the booking engine.

**Features**
* Tenant Active / Inactive Status Toggle [2 SP]
* Scheduled Maintenance Mode Banner & Messaging per Hotel [3 SP]
* Direct Booking Engine Shutdown Toggle (Redirect to Contact Us) [2 SP]

*Subtotal: 7 Story Points*
________________

**Total Epic 1 Story Points: 44 SP**

---

## Epic 2 — Dedicated Single-Hotel Availability & Restriction Engine
**User Stories & Features**

### 1. Single-Hotel Stay Dates & Occupancy Selector
Interactive stay calendar for the resolved hotel tenant.

**Features**
* Check-in / Check-out Calendar Datepicker [3 SP]
* Night Duration Calculation Engine [2 SP]
* Guest Occupancy Selector (Adults, Children, Infants) [3 SP]
* Child Age Group Categorization (Infants <2, Children 2-11, Adults 12+) [5 SP]
* Extra Bed Request Selector & Fee Calculation [3 SP]
* Max Capacity Validation against Selected Hotel Room Types [3 SP]

*Subtotal: 19 Story Points*
________________

### 2. Real-Time Room Availability & Inventory Lookup
Live room availability lookup for the specific hotel.

**Features**
* Real-Time Available Room Count Lookup for Resolved Hotel [8 SP]
* Sold-Out Detection per Room Type [3 SP]
* Alternative Date Suggestion Engine for the Hotel [5 SP]
* Real-Time Inventory Lock Engine during Booking [8 SP]

*Subtotal: 24 Story Points*
________________

### 3. Single-Hotel Restriction Rules Engine
Enforcing hotel-defined booking restrictions.

**Features**
* Minimum Length of Stay (Min LOS) Validation [5 SP]
* Maximum Length of Stay (Max LOS) Validation [3 SP]
* Closed to Arrival (CTA) Policy Validation on Check-in Date [3 SP]
* Closed to Departure (CTD) Policy Validation on Check-out Date [3 SP]
* Stop Sell / Blocked Room Inventory Validation [3 SP]

*Subtotal: 17 Story Points*
________________

### 4. Hotel Promo Code & Corporate Rate Engine
Validating discount codes associated with the hotel tenant.

**Features**
* Promotional Discount Code Entry & Validation [5 SP]
* Corporate Access Code Private Rate Unlock [5 SP]
* Multi-Tier Discount Calculation (Percentage Off / Flat Amount) [5 SP]
* Minimum Booking Amount & Expiry Validation [3 SP]

*Subtotal: 18 Story Points*
________________

### 5. Low Rate Matrix Calendar (Flexible Dates)
Visual rate discovery for the single hotel property.

**Features**
* Flexible Date Grid View (-3 / +3 Days Matrix) for Resolved Hotel [5 SP]
* Monthly Rate Calendar showing Lowest Price per Night [8 SP]
* Rate Trend Indicators (Cheapest Rate, Weekend Rate, High Demand) [3 SP]

*Subtotal: 16 Story Points*
________________

**Total Epic 2 Story Points: 94 SP**

---

## Epic 3 — Single-Hotel Catalog & Room/Rate Merchandising
**User Stories & Features**

### 1. Hotel Profile & Asset Presentation
Showcasing the hotel's identity, photos, amenities, and location.

**Features**
* Hotel Header, Tagline, Description & Contact Details Display [3 SP]
* High-Resolution Hotel Photo Gallery Carousel & Category Viewer [5 SP]
* Master Hotel Amenities List with Standardized Icons [3 SP]
* Hotel Location Address, Google Rating & Embed Map View [3 SP]
* Hotel Policies Display (Check-in/out times, Cancellation, Privacy) [3 SP]

*Subtotal: 17 Story Points*
________________

### 2. Room Type Catalog Display
Detailed room view cards for the hotel.

**Features**
* Room Type Cards Display with Bed Type & Size Badges [5 SP]
* Room Photo Gallery Viewer Modal [3 SP]
* Room Specific Amenities Tags (Balcony, AC, TV, Minibar) [3 SP]
* Room Capacity Badges & Max Adult/Child Indicators [2 SP]

*Subtotal: 13 Story Points*
________________

### 3. Rate Plan & Meal Plan Merchandising
Multiple rate options per room to maximize hotel ADR.

**Features**
* Rate Plan Options per Room (EP Room Only, CP Breakfast, MAP, AP) [5 SP]
* Rate Inclusions & Meal Badges [3 SP]
* Cancellation Policy Modal & Highlight Badges [3 SP]
* Scarcity & Urgency Badges ("Only 2 rooms left!") [3 SP]

*Subtotal: 14 Story Points*
________________

### 4. Dynamic Tax & Price Breakdown Engine
Transparent price calculation tailored to hotel tax structure.

**Features**
* Nightly Price Breakdown Modal [3 SP]
* Tax & Service Charge Calculation (GST/VAT, City Tax) [8 SP]
* Discount Deduction Breakdown [3 SP]
* Multi-Currency Display & Converter [5 SP]
* Total Estimated Payable Summary [3 SP]

*Subtotal: 22 Story Points*
________________

### 5. Hotel Add-on & Upsell Engine
Pre-booking services configured by the hotel.

**Features**
* Airport Transfer Shuttle Selection [5 SP]
* Early Check-In / Late Check-Out Paid Requests [5 SP]
* Dining & Special Occasion Packages (Candlelight Dinner, Spa) [5 SP]
* Extra Bed Request Add-On [2 SP]

*Subtotal: 17 Story Points*
________________

**Total Epic 3 Story Points: 83 SP**

---

## Epic 4 — Guest Checkout & Abandoned Booking Tracking Engine
**User Stories & Features**

### 1. Inventory Cart Lock & Countdown Timer
Holding inventory temporarily while guest completes checkout.

**Features**
* Temporary Room Inventory Lock in Cache/DB (10-15 Min Hold) [8 SP]
* Live Checkout Countdown Timer Banner [3 SP]
* Cart Expiry Warning & Auto Inventory Release [5 SP]

*Subtotal: 16 Story Points*
________________

### 2. Guest Details Capture Form
Collecting lead guest information and preferences.

**Features**
* Lead Guest Contact Form (First Name, Last Name, Email, Phone) [3 SP]
* International Phone Country Code Selector & Validation [3 SP]
* Special Requests & Dietary Notes Input Box [2 SP]
* Corporate Billing Details (Company Name, GST/Tax ID Number) [5 SP]

*Subtotal: 13 Story Points*
________________

### 3. Attempted Booking / Abandoned Cart Tracking
Capturing guest checkout attempts BEFORE payment completion for retargeting.

**Features**
* Save "Attempted Booking" Record in Database when Guest Enters Details [8 SP]
* Abandoned Cart Status Listener (Marked if cart expires before payment) [5 SP]
* Automated Abandoned Cart Recovery Email Trigger Integration [5 SP]
* Abandoned Checkout Analytics Log for Super Admin [5 SP]

*Subtotal: 23 Story Points*
________________

### 4. Terms, Policies & Regulatory Compliance
Capturing guest consent.

**Features**
* Hotel Terms & Conditions Checkbox [2 SP]
* Cancellation Policy Acceptance Checkbox [2 SP]
* Privacy Policy & GDPR Consent Checkbox [2 SP]

*Subtotal: 6 Story Points*
________________

**Total Epic 4 Story Points: 58 SP**

---

## Epic 5 — Tenant Payment Attachment & Financial Settlement
**User Stories & Features**

### 1. Hotel Merchant Payment Gateway Attachment
Connecting hotel's specific payment merchant account (Stripe, Razorpay, PayPal).

**Features**
* Dynamic Payment Gateway Credentials Attachment per Hotel Tenant [8 SP]
* Stripe Payment Gateway Integration (Cards, Apple Pay, Google Pay) [8 SP]
* Razorpay Payment Gateway Integration (UPI, Netbanking, Cards) [8 SP]
* PayPal Express Checkout Integration [5 SP]

*Subtotal: 29 Story Points*
________________

### 2. Payment Models & Guarantee Options
Supporting payment policies specified by the hotel.

**Features**
* 100% Advance Online Payment Processing [3 SP]
* Partial Online Deposit Payment Processing (e.g. 20% Deposit) [5 SP]
* Pay at Hotel / Credit Card Guarantee Option [8 SP]

*Subtotal: 16 Story Points*
________________

### 3. Unique Reference Generator & Transaction Listener
Recording completed bookings and financial logs.

**Features**
* Unique Booking Reference Generator (`RET-ROYAL-2026-X8F9`) [3 SP]
* Payment Gateway Webhook Listener (Handling Success, Failure, Pending) [8 SP]
* Save Completed Booking & Guest Record in Database [5 SP]
* Automated Instant Email Confirmation Voucher to Guest & Hotel [5 SP]
* Download PDF Confirmation Voucher & Tax Invoice [5 SP]

*Subtotal: 26 Story Points*
________________

**Total Epic 5 Story Points: 71 SP**

---

## Epic 6 — Retrod Super Admin Tenant Onboarding & Management
**User Stories & Features**

### 1. New Hotel Tenant Onboarding Wizard
Super Admin workspace to onboard new hotel properties.

**Features**
* Create New Hotel Tenant (Name, Slug, Subdomain, Domain) [5 SP]
* Hotel Contact Info, Address, Geo-Coordinates & Map Embed Setup [3 SP]
* Hotel Logo, Favicon & Hero Banner Media Manager [3 SP]
* Hotel Branding & Color Palette Setup Studio [3 SP]

*Subtotal: 14 Story Points*
________________

### 2. Hotel Property Configuration Studio
Configuring rooms, rates, amenities, and policies for the hotel.

**Features**
* Create / Edit Room Types (Name, Capacity, Bed Type, Base Price, Total Rooms) [5 SP]
* Create / Edit Rate Plans & Meal Plan Packages (EP, CP, MAP, AP) [5 SP]
* Assign Amenities & Upload Room / Hotel Gallery Photos [3 SP]
* Configure Hotel Policies (Check-in/out times, Cancellation, Privacy) [3 SP]
* Set Up Room Inventory & Daily Price Overrides Calendar [5 SP]

*Subtotal: 21 Story Points*
________________

### 3. Hotel Payment Gateway Credentials Configuration
Attaching merchant keys for each hotel property.

**Features**
* Configure Stripe API Keys (Publishable Key, Secret Key, Webhook Secret) per Hotel [5 SP]
* Configure Razorpay API Keys (Key ID, Key Secret) per Hotel [5 SP]
* Configure Payment Modes Allowed for Hotel (Full Advance, Deposit, Pay at Hotel) [3 SP]

*Subtotal: 13 Story Points*
________________

### 4. Tenant Booking & Revenue Tracking Dashboard
Super Admin reporting on direct bookings and revenue.

**Features**
* Hotel Direct Booking History & Status List [5 SP]
* Abandoned Cart & Checkout Conversion Analytics [5 SP]
* Hotel Revenue & Occupancy Reports [5 SP]

*Subtotal: 15 Story Points*
________________

**Total Epic 6 Story Points: 63 SP**

---

## Epic 7 — Guest Self-Service Portal & Reservation Management
**User Stories & Features**

### 1. Booking Retrieval & Lookup
Guests retrieving their reservation on the hotel's booking engine.

**Features**
* Lookup Booking via Reference Number + Email / Phone [3 SP]
* Resend Confirmation Email / WhatsApp Button [2 SP]
* Download Printable Voucher & Tax Receipt [3 SP]

*Subtotal: 8 Story Points*
________________

### 2. Self-Service Modifications & Cancellations
Self-service options according to hotel policy.

**Features**
* Self-Service Date Change Request [5 SP]
* Self-Service Room Upgrade Request [5 SP]
* Self-Service Cancellation & Refund Calculator [5 SP]

*Subtotal: 15 Story Points*
________________

**Total Epic 7 Story Points: 23 SP**

---

## Summary of Direct Hotel Booking Engine Story Pointing

| Epic Number | Epic Title | Features | Story Points (SP) |
| :--- | :--- | :---: | :---: |
| **Epic 1** | **Tenant Resolution & Multi-Domain Engine** | 12 | **44 SP** |
| **Epic 2** | **Dedicated Single-Hotel Availability & Restriction Engine** | 22 | **94 SP** |
| **Epic 3** | **Single-Hotel Catalog & Room/Rate Merchandising** | 20 | **83 SP** |
| **Epic 4** | **Guest Checkout & Abandoned Booking Tracking Engine** | 14 | **58 SP** |
| **Epic 5** | **Tenant Payment Attachment & Financial Settlement** | 12 | **71 SP** |
| **Epic 6** | **Retrod Super Admin Tenant Onboarding & Management** | 15 | **63 SP** |
| **Epic 7** | **Guest Self-Service Portal & Reservation Management** | 6 | **23 SP** |
| **TOTAL** | **Direct Hotel Booking Engine Platform Total** | **101 Features** | **436 SP** |
