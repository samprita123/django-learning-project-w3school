# 🏨 Retrod Booking Engine — Project Overview & Backend Epics Guide

---

## 📌 Executive Project Summary

The **Retrod Booking Engine** is a state-of-the-art, multi-tenant cloud application designed to power direct web bookings for hotels, resorts, and hospitality chains. It connects directly with the **Retrod Property Management System (Retrod PMS)** to deliver a seamless, high-speed, direct booking experience for guests on both mobile devices and desktop computers.

### 🌟 Core Value Proposition
- **Direct Web Booking Guarantee**: Drive commission-free direct bookings for hotels with exclusive direct web offers (e.g. default 14% discount).
- **Multi-Tenant Subdomain Architecture**: Each hotel property gets its own dedicated web address (e.g., `hotelxyz.retrod.com`) with custom branding, themes, and localized currencies.
- **Real-Time PMS Synchronization**: Room availability, dynamic tariffs, meal plans, and inventory blocks automatically sync with Retrod PMS in real-time.
- **Unified Master Guest Database**: Complete database storage of guest profiles, stay history, contact details, identity proofs, and transaction records.
- **Dual Booking Engine**: Handles both **Overnight Room Reservations** and **Banquet Hall & Event Bookings** (weddings, corporate meets, catering & decor add-ons).

---

## 🗺️ Brief Guide to Development Epics

Below is a clear, non-technical explanation of the **10 Core Development Epics** building the Retrod Booking Engine Backend.

---

### 🏛️ EPIC 1: Multi-Tenant Hotel Platform
**What it does**: Allows hundreds of independent hotel properties to run on the same central booking engine while maintaining complete privacy, custom branding, and unique web addresses.
- **Key Feature**: Automatic recognition of hotel subdomains (e.g. `hotelxyz.retrod.com`).
- **Why it matters**: Each hotel gets a custom-branded website with its own currency, theme, logo, and settings without affecting other hotels.

---

### 🔄 EPIC 2: Retrod PMS Real-Time Integration
**What it does**: Creates a live bridge between the hotel's front desk system (Retrod PMS) and the online booking website.
- **Key Feature**: Instant synchronization of room availability, pricing updates, and automated push of website bookings directly to the hotel front desk.
- **Why it matters**: Prevents double-bookings and ensures rates updated at the hotel front desk immediately reflect on the website.

---

### 🖼️ EPIC 3: Property Presentation & Content Management
**What it does**: Powers all visual content and information guests see when browsing the hotel website.
- **Key Feature**: High-resolution image galleries, amenity lists with icons, hotel policies (check-in times, cancellation rules), and Google Maps location directions.
- **Why it matters**: Builds guest trust and provides all necessary hotel information in an elegant, modern format.

---

### 🛌 EPIC 4: Real-Time Room Search & Inventory Engine
**What it does**: Handles live room search queries based on check-in/check-out dates and guest count.
- **Key Feature**: Smart occupancy validation (adults/children limits) and a **10-minute temporary cart lock** that reserves selected rooms while a guest fills out checkout details.
- **Why it matters**: Ensures smooth room selection without the risk of another guest snatching the room during checkout.

---

### 💰 EPIC 5: Dynamic Pricing, Meal Plans & Discount Offers
**What it does**: Calculates exact room costs based on stay length, meal inclusions, promotional offers, and government taxes.
- **Key Feature**: Meal plan selection (Breakfast Included, Half-Board, Full-Board), default **14% Direct Web Booking Discount**, promo code validation (`WELCOME10`), and automated Indian GST calculation (12% / 18% slabs).
- **Why it matters**: Gives guests clear price transparency with itemized tax breakdowns and attractive direct booking incentives.

---

### 👥 EPIC 6: Master Guest Database & CRM
**What it does**: Captures and maintains a secure central database record of all guests.
- **Key Feature**: Records guest name, phone, email, address, encrypted ID proof uploads (Aadhaar/Passport), special stay preferences, and lifetime booking history.
- **Why it matters**: Helps hotels identify returning VIP guests, store mandatory identity records securely, and deliver personalized hospitality.

---

### 🛒 EPIC 7: Seamless Reservation & Booking Pipeline
**What it does**: Guides the guest smoothly from room cart selection to final booking confirmation.
- **Key Feature**: Multi-room booking support in a single order, generation of unique booking reference IDs (`RTD-BK-XXXXX`), and guest self-service booking lookup ("My Booking").
- **Why it matters**: Provides a frictionless booking experience that reduces cart abandonment.

---

### 💳 EPIC 8: Payment Processing & Automated GST Invoicing
**What it does**: Securely processes online payments and generates official tax invoices.
- **Key Feature**: Integration with top payment gateways (Razorpay / Stripe), instant payment verification, and automated generation of downloadable PDF GST invoices.
- **Why it matters**: Ensures 100% payment security and satisfies financial/GST compliance automatically.

---

### 🏛️ EPIC 9: Banquet Hall & Event Booking Engine
**What it does**: Dedicated booking engine for reserving hotel banquet halls for weddings, receptions, and corporate conferences.
- **Key Feature**: Banquet hall capacity display, per-plate catering rate calculator (Veg Buffet, Premium, Royal Feast), event add-on services (Stage Decor, DJ & Sound, Flowers, Photography, Bar Counter), and instant lead notification to the hotel event manager.
- **Why it matters**: Unlocks high-value event revenue for hotels alongside traditional room bookings.

---

### 📱 EPIC 10: Automated Guest Communications
**What it does**: Sends instant confirmation messages to guests across multiple communication channels.
- **Key Feature**: Automated instant WhatsApp messages, SMS alerts, and detailed HTML confirmation emails with downloadable PDF invoices.
- **Why it matters**: Gives guests immediate reassurance and booking details directly on their mobile phones.

---

## 📈 Summary Table for Stakeholders

| Epic # | Epic Title | Primary Business Objective | Main Guest Benefit |
| :--- | :--- | :--- | :--- |
| **Epic 1** | Multi-Tenant Platform | Multi-hotel brand isolation | Custom hotel URL & localized currency |
| **Epic 2** | Retrod PMS Sync | Live inventory & price sync | Real-time accurate room availability |
| **Epic 3** | Property Content | Showcase hotel facilities | Rich photos, amenities & location map |
| **Epic 4** | Room Search & Locks | Eliminate overbooking | 10-minute temporary room lock |
| **Epic 5** | Pricing & Discounts | Increase direct web revenue | 14% Direct Web Discount & Promo codes |
| **Epic 6** | Guest Database CRM | Unified guest profile vault | Repeat guest perks & identity security |
| **Epic 7** | Reservation Pipeline | Frictionless checkout pipeline | Multi-room booking & My Booking lookup |
| **Epic 8** | Payments & Invoices | Secure payments & compliance | Instant digital payment & PDF GST invoice |
| **Epic 9** | Banquet Event Engine | Capture banquet & wedding leads | Custom catering & event package pricing |
| **Epic 10**| Guest Communications | Instant omnichannel alerts | Instant WhatsApp & Email confirmations |
