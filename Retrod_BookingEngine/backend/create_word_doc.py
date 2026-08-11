import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn
import shutil

doc = docx.Document()

# Page setup - Margins 1 inch
for section in doc.sections:
    section.top_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1)
    section.right_margin = Inches(1)

# Color Palette
DARK_SLATE = RGBColor(15, 23, 42)      # #0F172A
BRAND_BLUE = RGBColor(37, 99, 235)     # #2563EB
TEXT_MUTED = RGBColor(100, 116, 139)   # #64748B

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

# Title
p_title = doc.add_paragraph()
p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
run_title = p_title.add_run('Retrod Booking Engine')
run_title.font.name = 'Segoe UI'
run_title.font.size = Pt(26)
run_title.font.bold = True
run_title.font.color.rgb = DARK_SLATE

p_sub = doc.add_paragraph()
p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
run_sub = p_sub.add_run('Executive Project Overview & Backend Epics Guide')
run_sub.font.name = 'Segoe UI'
run_sub.font.size = Pt(14)
run_sub.font.bold = True
run_sub.font.color.rgb = BRAND_BLUE

p_meta = doc.add_paragraph()
p_meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
run_meta = p_meta.add_run('A Comprehensive Reference Guide for Stakeholders, Hotel Clients & Team Members')
run_meta.font.name = 'Segoe UI'
run_meta.font.size = Pt(10)
run_meta.font.italic = True
run_meta.font.color.rgb = TEXT_MUTED

doc.add_paragraph() # Spacer

# Section 1: Executive Summary
h1 = doc.add_heading('1. Executive Project Summary', level=1)
h1.runs[0].font.name = 'Segoe UI'
h1.runs[0].font.color.rgb = DARK_SLATE

p_exec = doc.add_paragraph()
p_exec.add_run('The ').font.name = 'Segoe UI'
r_bold = p_exec.add_run('Retrod Booking Engine')
r_bold.font.bold = True
r_bold.font.name = 'Segoe UI'
p_exec.add_run(' is a state-of-the-art, multi-tenant cloud platform designed to power direct web bookings for hotels, luxury resorts, and hospitality chains. It connects directly with the ').font.name = 'Segoe UI'
r_pms = p_exec.add_run('Retrod Property Management System (Retrod PMS)')
r_pms.font.bold = True
r_pms.font.name = 'Segoe UI'
p_exec.add_run(' to deliver a seamless, high-speed, direct booking experience for guests across mobile devices and desktop computers.').font.name = 'Segoe UI'

# Core Value Bullet Points
bullet_points = [
    ('Direct Web Booking Guarantee: ', 'Drives commission-free direct bookings for hotels with exclusive web offers (e.g. default 14% tariff discount).'),
    ('Multi-Tenant Subdomain Architecture: ', 'Each hotel property receives its own dedicated website address (e.g. hotelxyz.retrod.com) with custom themes, logos, and localized currencies.'),
    ('Real-Time PMS Synchronization: ', 'Room availability, dynamic rates, meal plans, and inventory blocks automatically sync with Retrod PMS in real-time.'),
    ('Unified Master Guest Database: ', 'Centralized database storage of guest profiles, stay history, contact details, identity proofs, and payment transaction records.'),
    ('Dual Booking Engines: ', 'Handles both Overnight Room Reservations and Banquet Hall & Event Bookings (weddings, corporate meets, catering packages & decor add-ons).')
]

for b_title, b_desc in bullet_points:
    bp = doc.add_paragraph(style='List Bullet')
    r_bt = bp.add_run(b_title)
    r_bt.font.bold = True
    r_bt.font.name = 'Segoe UI'
    r_bt.font.color.rgb = DARK_SLATE
    r_bd = bp.add_run(b_desc)
    r_bd.font.name = 'Segoe UI'

doc.add_paragraph() # Spacer

# Section 2: Detailed Epics Explanation
h2 = doc.add_heading('2. Brief Guide to the 10 Core Development Epics', level=1)
h2.runs[0].font.name = 'Segoe UI'
h2.runs[0].font.color.rgb = DARK_SLATE

epics_guide = [
    ('EPIC 1: Multi-Tenant Hotel Platform',
     'Allows hundreds of independent hotel properties to run on the same central booking engine while maintaining complete privacy, custom branding, and unique web addresses.',
     'Automatic recognition of hotel subdomains (e.g. hotelxyz.retrod.com) and header-based tenant resolution.',
     'Each hotel gets a custom-branded website with its own currency, theme, logo, and settings without affecting other properties.'),

    ('EPIC 2: Retrod PMS Real-Time Integration',
     'Creates a live bridge between the hotel\'s front desk system (Retrod PMS) and the online booking website.',
     'Instant synchronization of room availability, pricing updates, and automated push of website bookings directly to the hotel front desk.',
     'Prevents double-bookings and ensures rates updated at the hotel front desk immediately reflect on the website.'),

    ('EPIC 3: Property Presentation & Content Management',
     'Powers all visual content and information guests see when browsing the hotel website.',
     'High-resolution image galleries, amenity lists with icons, hotel policies (check-in times, cancellation rules), and Google Maps location directions.',
     'Builds guest trust and provides all necessary hotel information in an elegant, modern format.'),

    ('EPIC 4: Real-Time Room Search & Inventory Engine',
     'Handles live room search queries based on check-in/check-out dates and guest count.',
     'Smart occupancy validation (adults/children limits) and a 10-minute temporary cart lock that reserves selected rooms while a guest fills out checkout details.',
     'Ensures smooth room selection without the risk of another guest snatching the room during checkout.'),

    ('EPIC 5: Dynamic Pricing, Meal Plans & Discount Offers',
     'Calculates exact room costs based on stay length, meal inclusions, promotional offers, and government taxes.',
     'Meal plan selection (EP, CP, MAP, AP), default 14% Direct Web Discount, promo code validation (WELCOME10), and automated Indian GST calculation (12% / 18% slabs).',
     'Gives guests clear price transparency with itemized tax breakdowns and attractive direct booking incentives.'),

    ('EPIC 6: Master Guest Database & CRM',
     'Captures and maintains a secure central database record of all guests who interact with the booking engine.',
     'Records guest name, phone, email, address, encrypted ID proof uploads (Aadhaar/Passport), special stay preferences, and lifetime booking history.',
     'Helps hotels identify returning VIP guests, store mandatory identity records securely, and deliver personalized hospitality.'),

    ('EPIC 7: Seamless Reservation & Booking Pipeline',
     'Guides the guest smoothly from room cart selection to final booking confirmation.',
     'Multi-room booking support in a single order, generation of unique booking reference IDs (RTD-BK-XXXXX), and guest self-service booking lookup ("My Booking").',
     'Provides a frictionless booking experience that reduces cart abandonment.'),

    ('EPIC 8: Payment Processing & Automated GST Invoicing',
     'Securely processes online payments and generates official tax invoices.',
     'Integration with top payment gateways (Razorpay / Stripe), instant payment verification, and automated generation of downloadable PDF GST invoices.',
     'Ensures 100% payment security and satisfies financial/GST compliance automatically.'),

    ('EPIC 9: Banquet Hall & Event Booking Engine',
     'Dedicated booking engine for reserving hotel banquet halls for weddings, receptions, and corporate conferences.',
     'Banquet hall capacity display, per-plate catering rate calculator (Veg Buffet, Premium, Royal Feast), event add-on services (Stage Decor, DJ & Sound, Flowers, Photography, Bar Counter), and instant lead notification to the hotel event manager.',
     'Unlocks high-value event revenue for hotels alongside traditional room bookings.'),

    ('EPIC 10: Automated Guest Communications',
     'Sends instant confirmation messages to guests across multiple communication channels.',
     'Automated instant WhatsApp messages, SMS alerts, and detailed HTML confirmation emails with downloadable PDF invoices.',
     'Gives guests immediate reassurance and booking details directly on their mobile phones.')
]

for title, desc, feature, why in epics_guide:
    h_epic = doc.add_heading(title, level=2)
    h_epic.runs[0].font.name = 'Segoe UI'
    h_epic.runs[0].font.color.rgb = BRAND_BLUE
    
    p_desc = doc.add_paragraph()
    r_d1 = p_desc.add_run('• What it does: ')
    r_d1.font.bold = True
    r_d1.font.name = 'Segoe UI'
    r_d2 = p_desc.add_run(desc)
    r_d2.font.name = 'Segoe UI'

    p_feat = doc.add_paragraph()
    r_f1 = p_feat.add_run('• Key Feature: ')
    r_f1.font.bold = True
    r_f1.font.name = 'Segoe UI'
    r_f2 = p_feat.add_run(feature)
    r_f2.font.name = 'Segoe UI'

    p_why = doc.add_paragraph()
    r_w1 = p_why.add_run('• Why it matters: ')
    r_w1.font.bold = True
    r_w1.font.name = 'Segoe UI'
    r_w2 = p_why.add_run(why)
    r_w2.font.name = 'Segoe UI'

doc.add_paragraph() # Spacer

# Section 3: Summary Table
h3 = doc.add_heading('3. Executive Summary Matrix for Stakeholders', level=1)
h3.runs[0].font.name = 'Segoe UI'
h3.runs[0].font.color.rgb = DARK_SLATE

table_data = [
    ['Epic #', 'Epic Title', 'Primary Business Objective', 'Main Guest Benefit'],
    ['Epic 1', 'Multi-Tenant Platform', 'Multi-hotel brand isolation', 'Custom hotel URL & localized currency'],
    ['Epic 2', 'Retrod PMS Sync', 'Live inventory & price sync', 'Real-time accurate room availability'],
    ['Epic 3', 'Property Content', 'Showcase hotel facilities', 'Rich photos, amenities & location map'],
    ['Epic 4', 'Room Search & Locks', 'Eliminate overbooking', '10-minute temporary room cart lock'],
    ['Epic 5', 'Pricing & Discounts', 'Increase direct web revenue', '14% Direct Web Discount & Promo codes'],
    ['Epic 6', 'Guest Database CRM', 'Unified guest profile vault', 'Repeat guest perks & identity security'],
    ['Epic 7', 'Reservation Pipeline', 'Frictionless checkout pipeline', 'Multi-room booking & My Booking lookup'],
    ['Epic 8', 'Payments & Invoices', 'Secure payments & compliance', 'Instant digital payment & PDF GST invoice'],
    ['Epic 9', 'Banquet Event Engine', 'Capture banquet & wedding leads', 'Custom catering & event package pricing'],
    ['Epic 10', 'Guest Communications', 'Instant omnichannel alerts', 'Instant WhatsApp & Email confirmations']
]

table = doc.add_table(rows=len(table_data), cols=4)
table.alignment = WD_TABLE_ALIGNMENT.CENTER

for r_idx, row in enumerate(table_data):
    for c_idx, val in enumerate(row):
        cell = table.cell(r_idx, c_idx)
        cell.text = val
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER if c_idx == 0 else WD_ALIGN_PARAGRAPH.LEFT
        run = p.runs[0]
        run.font.name = 'Segoe UI'
        run.font.size = Pt(9.5)
        
        if r_idx == 0:
            set_cell_background(cell, '1E293B')
            run.font.bold = True
            run.font.color.rgb = RGBColor(255, 255, 255)
        else:
            if r_idx % 2 == 1:
                set_cell_background(cell, 'F8FAFC')
            run.font.color.rgb = DARK_SLATE

# Set Column Widths
widths = [Inches(0.8), Inches(1.8), Inches(2.2), Inches(2.2)]
for row in table.rows:
    for idx, width in enumerate(widths):
        row.cells[idx].width = width

doc_path = 'd:/Retrod_Work/Retrod_BookingEngine/backend/Retrod_BookingEngine_Project_Overview_And_Epics.docx'
doc.save(doc_path)

# Also copy to artifact folder
artifact_path = 'C:/Users/sammy/.gemini/antigravity-ide/brain/aebe62ab-0184-4e4d-ba96-862d36dcc15f/Retrod_BookingEngine_Project_Overview_And_Epics.docx'
shutil.copy(doc_path, artifact_path)

print('Word Document (.docx) generated successfully at:', doc_path)
