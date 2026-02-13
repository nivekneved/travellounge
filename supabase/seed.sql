-- ==============================================================================
-- TRAVEL LOUNGE MAURITIUS: SEED DATA (DML)
-- Consolidated Seed (Settings, Pages, Menus, Hotels, Activities, Cruises, etc.)
-- ==============================================================================

-- 0. CLEANUP (Truncate existing data)
TRUNCATE TABLE 
  categories,
  site_settings,
  media,
  testimonials,
  team_members,
  hero_slides,
  menus,
  promotions,
  flights,
  newsletter_subscribers,
  email_templates,
  pages,
  services,
  hotel_rooms,
  room_daily_prices,
  reviews,
  bookings
  -- admins, audit_logs -- Excluded to prevent lockout and preserve history
  RESTART IDENTITY CASCADE;

-- 1. SITE SETTINGS
INSERT INTO site_settings (key, value, category, description) VALUES
('contact_phone', '"230 208 9999"', 'footer', 'Main contact phone number'),
('contact_email', '"info@travellounge.mu"', 'footer', 'Main contact email'),
('contact_address', '"Ground Floor Newton Tower, Sir William Newton St, Port Louis, Mauritius"', 'footer', 'Main office address'),
('working_hours', '"Mon-Fri: 9:00 AM - 5:00 PM"', 'footer', 'Business hours'),
('facebook_url', '"https://facebook.com/travellounge"', 'footer', 'Facebook page URL'),
('instagram_url', '"https://instagram.com/travellounge"', 'footer', 'Instagram profile URL'),
('website_url', '"https://travellounge.mu"', 'footer', 'Website URL'),
('office_locations', '[]', 'footer', 'Array of office locations')
ON CONFLICT (key) DO NOTHING;

-- 2. DEFAULT PAGES
INSERT INTO pages (slug, title, content) VALUES
('about', 'About Us', '{
    "hero": {
        "title": "Crafting Memories",
        "subtitle": "Est. 2010",
        "image_url": "https://images.unsplash.com/photo-1544391626-d6215112fa59?auto=format&fit=crop&q=80&w=1920"
    },
    "stats": [
        { "label": "Years Experience", "value": "15+" },
        { "label": "Happy Travelers", "value": "50k+" },
        { "label": "Destinations", "value": "100+" },
        { "label": "Support", "value": "24/7" }
    ],
    "story": {
        "title": "Redefining Luxury Travel in Mauritius",
        "titles": "Redefining Luxury Travel in Mauritius",
        "paragraphs": [
            "Founded on the principles of excellence and personalization, Travel Lounge has grown from a boutique agency to a premier travel partner for thousands of clients worldwide. We believe that travel is not just about the destination, but about the feelings, memories, and connections made along the way."
        ],
        "images": [
            "https://images.unsplash.com/photo-1572978394861-fb964f9f7596?auto=format&fit=crop&w=800",
            "https://images.unsplash.com/photo-1589519160732-57fc498494f8?auto=format&fit=crop&w=600"
        ]
    },
    "values": [
        { "title": "Trusted & Secure", "description": "Registered, bonded, and insured. Your peace of mind is our top priority.", "icon": "ShieldCheck" },
        { "title": "Personalized Care", "description": "A dedicated travel specialist accompanies you from planning to return.", "icon": "Users" },
        { "title": "Unbeatable Value", "description": "Exclusive partnerships allow us to offer you the best rates and perks.", "icon": "Target" }
    ]
}'),
('contact', 'Contact Us', '{"headline": "Get in Touch", "body": "Contact details"}'),
('services', 'Our Services', '{"headline": "Premium Services", "body": "Service list"}'),
('faq', 'Frequently Asked Questions', '{"headline": "FAQ", "body": "Q&A"}')
ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content;

-- 3. MENUS
INSERT INTO menus (title, location, items) VALUES
('Main Navigation', 'header', '[
    {"label": "Home", "link": "/"},
    {
        "label": "Travel Abroad",
        "link": "#",
        "children": [
            {"label": "Book a Flight", "link": "/flights", "icon": "Plane"},
            {"label": "Tailor Made Packages", "link": "/package-builder", "icon": "FileText"},
            {"label": "Cruise Vacations", "link": "/cruises", "icon": "Ship"},
            {"label": "Guided Group Tours", "link": "/group-tours", "icon": "Users"},
            {
                "label": "Rodrigues",
                "link": "#",
                "children": [
                    {"label": "Guest Houses", "link": "/rodrigues-guest-houses", "icon": "Hotel"},
                    {"label": "Hotels", "link": "/rodrigues-hotels", "icon": "Hotel"}
                ]
            },
            {"label": "Visa Services", "link": "/visa-services", "icon": "FileText"}
        ]
    },
    {"label": "Hotels", "link": "/hotels", "icon": "Hotel"},
    {"label": "Flight", "link": "/flights", "icon": "Plane"},
    {
        "label": "Local Deals",
        "link": "#",
        "children": [
            {"label": "Land Activities", "link": "/activities?category=Land Activities"},
            {"label": "Sea Activities", "link": "/activities?category=Sea Activities"},
            {"label": "Hotel Day Packages", "link": "/day-packages", "icon": "Calendar"}
        ]
    },
    {
        "label": "About",
        "link": "#",
        "children": [
            {"label": "About Us", "link": "/about"},
            {"label": "Team", "link": "/team", "icon": "UsersRound"}
        ]
    }
]') ON CONFLICT (id) DO NOTHING;

-- 4. ADDITIONAL SERVICES (From original seed.sql)
INSERT INTO services (name, category, type, description, location, pricing, images, is_featured, created_at, updated_at)
VALUES
('Sunset Catamaran Cruise', 'activity', 'water', 'Enjoy a beautiful sunset cruise along the north coast with unlimited drinks and snacks.', 'Grand Baie', '{"adult": 2500, "child": 1200, "currency": "MUR"}'::jsonb, ARRAY['https://images.unsplash.com/photo-1544551763-46a42a46e865?auto=format&fit=crop&w=800&q=80'], true, NOW(), NOW()),
('Airport Private Transfer', 'transfer', 'transport', 'Comfortable air-conditioned private transfer to any hotel on the island.', 'SSR International Airport', '{"car": 1800, "van": 2500, "suv": 3500, "currency": "MUR"}'::jsonb, ARRAY['https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80'], false, NOW(), NOW()),
('Seven Coloured Earth Tour', 'activity', 'land', 'Visit the famous Chamarel Seven Coloured Earth, waterfall, and rum distillery.', 'Chamarel', '{"adult": 3500, "child": 1750, "currency": "MUR"}'::jsonb, ARRAY['https://images.unsplash.com/photo-1589405822346-68b325253818?auto=format&fit=crop&w=800&q=80'], true, NOW(), NOW()),
('Full Day South Tour', 'activity', 'land', 'Explore the sacred lake, tea plantations, and wild coast of the south.', 'South Mauritius', '{"adult": 3000, "child": 1500, "currency": "MUR"}'::jsonb, ARRAY['https://images.unsplash.com/photo-1570701564993-e00652af8aa7?auto=format&fit=crop&w=800&q=80'], true, NOW(), NOW());

-- 5. CONVERTED SAMPLE HOTELS (From original seed.sql)
DO $$
DECLARE
    v_hotel_id UUID;
BEGIN
    -- Grand Baie Luxury Resort
    INSERT INTO services (name, type, location, category, pricing, images, amenities, is_featured, rating, created_at, updated_at)
    VALUES (
        'Grand Baie Luxury Resort',
        'hotel',
        'Grand Baie, Mauritius',
        'hotels',
        '{"base_price": 15000, "currency": "MUR"}'::jsonb,
        ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80'],
        '{"wifi": true, "pool": true, "gym": true, "spa": true, "restaurant": true}'::jsonb,
        true,
        4.8,
        NOW(), NOW()
    ) RETURNING id INTO v_hotel_id;

    INSERT INTO hotel_rooms (service_id, type, name, price_per_night, total_units, features)
    VALUES 
    (v_hotel_id, 'room', 'Deluxe Ocean View', 15000, 5, '{"view": "ocean", "bed": "king", "balcony": true}'::jsonb),
    (v_hotel_id, 'suite', 'Presidential Suite', 45000, 1, '{"view": "panoramic", "pool": "private", "butler": true}'::jsonb),
    (v_hotel_id, 'room', 'Standard Garden Room', 8000, 10, '{"view": "garden", "bed": "queen"}'::jsonb);

    -- Le Morne Beach Villa
    INSERT INTO services (name, type, location, category, pricing, images, amenities, is_featured, rating, created_at, updated_at)
    VALUES (
        'Le Morne Beach Villa',
        'hotel',
        'Le Morne, Mauritius',
        'hotels',
        '{"base_price": 22000, "currency": "MUR"}'::jsonb,
        ARRAY['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'],
        '{"wifi": true, "pool": true, "parking": true, "kitchen": true, "beach_access": true}'::jsonb,
        true,
        4.9,
        NOW(), NOW()
    ) RETURNING id INTO v_hotel_id;

     INSERT INTO hotel_rooms (service_id, type, name, price_per_night, total_units, features)
    VALUES 
    (v_hotel_id, 'villa', 'Beachfront Villa', 22000, 3, '{"view": "beach", "kitchen": "full", "bedrooms": 3}'::jsonb);

    -- Belle Mare Plage Hotel
    INSERT INTO services (name, type, location, category, pricing, images, amenities, is_featured, rating, created_at, updated_at)
    VALUES (
        'Belle Mare Plage Hotel',
        'hotel',
        'Belle Mare, Mauritius',
        'hotels',
        '{"base_price": 8500, "currency": "MUR"}'::jsonb,
        ARRAY['https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80'],
        '{"wifi": true, "pool": true, "breakfast": true}'::jsonb,
        true,
        4.5,
        NOW(), NOW()
    ) RETURNING id INTO v_hotel_id;

    INSERT INTO hotel_rooms (service_id, type, name, price_per_night, total_units, features)
    VALUES 
    (v_hotel_id, 'room', 'Standard Room', 8500, 20, '{"view": "pool", "bed": "double"}'::jsonb);
END $$;

-- 6 NEW SEED DATA (20260211)

-- 6.1 ACTIVITIES
INSERT INTO services (name, type, description, location, pricing, images, duration, rating, amenities, category, created_at, updated_at)
VALUES
('Catamaran Cruise to Ile aux Cerfs', 'activity', 'Full day catamaran cruise to the stunning Ile aux Cerfs with BBQ lunch and snorkeling.', 'Trou d''Eau Douce',
 '{"base_price": 3500, "currency": "MUR"}'::jsonb,
 ARRAY['https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200&auto=format&fit=crop'],
 'Full Day',
 4.8,
 '["Lunch", "Snorkeling", "BBQ", "Drinks"]'::jsonb,
 'Water Activities',
 NOW(), NOW()),

('Undersea Walk', 'activity', 'Walk on the ocean floor and experience marine life up close with this unique underwater adventure.', 'Grand Baie',
 '{"base_price": 4000, "currency": "MUR"}'::jsonb,
 ARRAY['https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=1200&auto=format&fit=crop'],
 '3 Hours',
 4.7,
 '["Equipment", "Photos", "Transport", "Guide"]'::jsonb,
 'Water Activities',
 NOW(), NOW()),

('Dolphin Watching & Swimming', 'activity', 'Swim with wild dolphins in their natural habitat off the coast of Tamarin.', 'Tamarin',
 '{"base_price": 3000, "currency": "MUR"}'::jsonb,
 ARRAY['https://images.unsplash.com/photo-1570534064391-7f9ee161b18c?q=80&w=1200&auto=format&fit=crop'],
 'Half Day',
 4.9,
 '["Boat", "Snorkeling Gear", "Guide", "Breakfast"]'::jsonb,
 'Wildlife',
 NOW(), NOW()),

('Zip Lining Adventure', 'activity', 'Soar through the treetops on an exhilarating zip line adventure at Casela Nature Park.', 'Casela',
 '{"base_price": 2200, "currency": "MUR"}'::jsonb,
 ARRAY['https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?q=80&w=1200&auto=format&fit=crop'],
 '3 Hours',
 4.9,
 '["Safety Harness", "Guide", "Return Transfer"]'::jsonb,
 'Land Activities',
 NOW(), NOW()),

('Parasailing', 'activity', 'Experience the thrill of parasailing with stunning aerial views of the coastline.', 'Belle Mare',
 '{"base_price": 1200, "currency": "MUR"}'::jsonb,
 ARRAY['https://images.unsplash.com/photo-1471922694854-ff1b63b20054?q=80&w=1200&auto=format&fit=crop'],
 '15 Mins',
 4.6,
 '["Safety Briefing", "Life Jacket", "Boat Ride"]'::jsonb,
 'Water Activities',
 NOW(), NOW()),

('Hiking Le Morne', 'activity', 'Challenging hike to the summit of Le Morne Brabant, a UNESCO World Heritage Site.', 'Le Morne',
 '{"base_price": 1800, "currency": "MUR"}'::jsonb,
 ARRAY['https://images.unsplash.com/photo-1589182373726-e4f6d65d8f03?q=80&w=1200&auto=format&fit=crop'],
 '4 Hours',
 4.9,
 '["Guide", "Snacks", "Water"]'::jsonb,
 'Land Activities',
 NOW(), NOW()),

('Scuba Diving', 'activity', 'Explore the underwater world with a guided scuba diving experience for all levels.', 'Flic en Flac',
 '{"base_price": 2500, "currency": "MUR"}'::jsonb,
 ARRAY['https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200&auto=format&fit=crop'],
 '2 Hours',
 4.8,
 '["Full Equipment", "Dive Master", "Boat Trip"]'::jsonb,
 'Water Activities',
 NOW(), NOW());

-- 6.2 CRUISES
INSERT INTO services (name, type, description, location, pricing, images, duration, ports, rating, highlights, category, created_at, updated_at)
VALUES
('Mediterranean Grand Voyage', 'cruise', 'Experience the wonders of the Mediterranean with stops at iconic ports across Europe and the Middle East.', 'Barcelona, Rome, Athens, Istanbul', 
 '{"base_price": 115000, "currency": "MUR"}'::jsonb,
 ARRAY['https://images.unsplash.com/photo-1548574505-5e239809ee19?q=80&w=1200&auto=format&fit=crop'],
 '14 Days',
 'Barcelona, Rome, Athens, Istanbul',
 4.9,
 '["All meals included", "Shore excursions", "Entertainment"]'::jsonb,
 'Mediterranean',
 NOW(), NOW()),

('Caribbean Paradise Cruise', 'cruise', 'Sail through crystal-clear Caribbean waters with stops at tropical paradise islands.', 'Miami, Bahamas, Jamaica, Cayman Islands',
 '{"base_price": 85000, "currency": "MUR"}'::jsonb,
 ARRAY['https://images.unsplash.com/photo-1599640845513-534431838eb2?q=80&w=1200&auto=format&fit=crop'],
 '7 Days',
 'Miami, Bahamas, Jamaica, Cayman Islands',
 4.8,
 '["Private island access", "Water sports", "Casino & spa"]'::jsonb,
 'Caribbean',
 NOW(), NOW()),

('Alaska Wilderness Explorer', 'cruise', 'Discover the untamed beauty of Alaska with glacier viewing and wildlife encounters.', 'Seattle, Juneau, Skagway, Glacier Bay',
 '{"base_price": 150000, "currency": "MUR"}'::jsonb,
 ARRAY['https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format&fit=crop'],
 '10 Days',
 'Seattle, Juneau, Skagway, Glacier Bay',
 5.0,
 '["Glacier viewing", "Wildlife tours", "Premium dining"]'::jsonb,
 'Alaska',
 NOW(), NOW()),

('Asian Coastal Discovery', 'cruise', 'Explore the diverse cultures and stunning coastlines of Southeast Asia.', 'Singapore, Thailand, Vietnam, Hong Kong',
 '{"base_price": 125000, "currency": "MUR"}'::jsonb,
 ARRAY['https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1200&auto=format&fit=crop'],
 '12 Days',
 'Singapore, Thailand, Vietnam, Hong Kong',
 4.7,
 '["Cultural excursions", "Cooking classes", "Spa treatments"]'::jsonb,
 'Asia',
 NOW(), NOW()),

('Norwegian Fjords Journey', 'cruise', 'Journey through Norway''s majestic fjords with breathtaking natural scenery.', 'Copenhagen, Bergen, Geiranger, Oslo',
 '{"base_price": 135000, "currency": "MUR"}'::jsonb,
 ARRAY['https://images.unsplash.com/photo-1506307129524-7b0a70823555?q=80&w=1200&auto=format&fit=crop'],
 '9 Days',
 'Copenhagen, Bergen, Geiranger, Oslo',
 4.9,
 '["Fjord viewpoints", "Northern lights", "Local cuisine"]'::jsonb,
 'Europe',
 NOW(), NOW()),

('South Pacific Explorer', 'cruise', 'Ultimate luxury cruise through the pristine islands of the South Pacific.', 'Sydney, Fiji, Bora Bora, Tahiti',
 '{"base_price": 200000, "currency": "MUR"}'::jsonb,
 ARRAY['https://images.unsplash.com/photo-1580541631950-7282082b53ce?q=80&w=1200&auto=format&fit=crop'],
 '15 Days',
 'Sydney, Fiji, Bora Bora, Tahiti',
 5.0,
 '["Beach excursions", "Snorkeling gear", "Luxury cabins"]'::jsonb,
 'Pacific',
 NOW(), NOW());

-- 6.3 EXCURSIONS
INSERT INTO services (name, type, description, location, pricing, images, duration, highlights, created_at, updated_at)
VALUES
('North Island Tour', 'excursion', 'Discover the highlights of northern Mauritius including Grand Baie, Pamplemousses Garden, and Cap Malheureux.', 'North Mauritius',
 '{"base_price": 3500, "currency": "MUR"}'::jsonb,
 ARRAY['https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=1200&auto=format&fit=crop'],
 'Full Day',
 '["Grand Baie", "Pamplemousses Garden", "Cap Malheureux", "Port Louis"]'::jsonb,
 NOW(), NOW()),

('South Island Discovery', 'excursion', 'Explore the natural wonders of southern Mauritius including the 7 Colored Earth and Chamarel Waterfall.', 'South Mauritius',
 '{"base_price": 4000, "currency": "MUR"}'::jsonb,
 ARRAY['https://images.unsplash.com/photo-1551244072-5d12893278ab?q=80&w=1200&auto=format&fit=crop'],
 'Full Day',
 '["7 Colored Earth", "Chamarel Waterfall", "Black River Gorges", "Rhumerie"]'::jsonb,
 NOW(), NOW()),

('Ile aux Cerfs Tour', 'excursion', 'Full day catamaran tour to the paradise island of Ile aux Cerfs with BBQ lunch and water activities.', 'East Coast',
 '{"base_price": 4500, "currency": "MUR"}'::jsonb,
 ARRAY['https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200&auto=format&fit=crop'],
 'Full Day',
 '["Catamaran", "BBQ Lunch", "Snorkeling", "Beach Time"]'::jsonb,
 NOW(), NOW()),

('Port Louis & Shopping', 'excursion', 'Half day tour of the capital city with visits to the Central Market, Caudan Waterfront, and shopping opportunities.', 'Port Louis',
 '{"base_price": 2500, "currency": "MUR"}'::jsonb,
 ARRAY['https://images.unsplash.com/photo-1555400038-63f5ba517a47?q=80&w=1200&auto=format&fit=crop'],
 'Half Day',
 '["Central Market", "Caudan Waterfront", "Fort Adelaide", "Shopping"]'::jsonb,
 NOW(), NOW());

-- 6.4 PREMIUM HOTELS (20260211)
DO $$
DECLARE
    v_hotel_id UUID;
BEGIN
    -- LUX* Belle Mare
    INSERT INTO services (name, type, location, star_rating, rating, description, pricing, images, amenities, category)
    VALUES (
        'LUX* Belle Mare', 
        'hotel', 
        'Belle Mare, East Coast', 
        5, 
        4.9, 
        'Experience the vibrant energy and hospitality of LUX* Belle Mare. A forward-thinking resort on the east coast of Mauritius, boasting a pristine white sandy beach and a stunning crystal-clear lagoon.',
        '{"base_price": 16000}',
        ARRAY['https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1200&auto=format&fit=crop'],
        '[{"name": "Private Beach", "icon": "Waves"}, {"name": "5 Restaurants", "icon": "Utensils"}, {"name": "Café LUX*", "icon": "Coffee"}, {"name": "Fitness Center", "icon": "Dumbbell"}, {"name": "Free WiFi", "icon": "Wifi"}, {"name": "Free Parking", "icon": "Car"}, {"name": "Smart TV", "icon": "Tv"}, {"name": "Air Conditioning", "icon": "Wind"}]'::jsonb,
        'Luxury Resort'
    ) RETURNING id INTO v_hotel_id;

    INSERT INTO hotel_rooms (service_id, name, size, bed, view, price_per_night, image_url, features, type) VALUES
    (v_hotel_id, 'Junior Suite', '60 m²', 'King Size Bed', 'Garden View', 16000, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800&auto=format&fit=crop', '["Balcony", "Minibar", "Bathtub", "Walk-in Shower"]'::jsonb, 'suite'),
    (v_hotel_id, 'Pool View Junior Suite', '60 m²', 'King Size Bed', 'Pool View', 19000, 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800&auto=format&fit=crop', '["Pool View", "Balcony", "Coffee Machine", "Lounge Area"]'::jsonb, 'suite'),
    (v_hotel_id, 'Ocean Suite', '90 m²', 'King Size Bed', 'Ocean View', 29000, 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=800&auto=format&fit=crop', '["Ocean View", "Large Terrace", "Separate Living Room", "Butler Service"]'::jsonb, 'suite');

    -- Shangri-La Le Touessrok
    INSERT INTO services (name, type, location, star_rating, rating, description, pricing, images, amenities, category)
    VALUES (
        'Shangri-La Le Touessrok', 
        'hotel', 
        'Trou d''Eau Douce, East Coast', 
        5, 
        5.0, 
        'Located on the untouched eastern coast of the island nation, Shangri-La Le Touessrok is a private hideaway offering luxury and tranquility.',
        '{"base_price": 19000}',
        ARRAY['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop'],
        '[{"name": "Private Island", "icon": "Waves"}, {"name": "7 Restaurants", "icon": "Utensils"}, {"name": "Gym & Spa", "icon": "Dumbbell"}, {"name": "Golf Course", "icon": "MapPin"}, {"name": "High-Speed WiFi", "icon": "Wifi"}, {"name": "Butler Service", "icon": "CheckCircle"}, {"name": "Breakfast included", "icon": "Coffee"}, {"name": "Climate Control", "icon": "Wind"}]'::jsonb,
        'Luxury Resort'
    ) RETURNING id INTO v_hotel_id;

    INSERT INTO hotel_rooms (service_id, name, size, bed, view, price_per_night, image_url, features, type) VALUES
    (v_hotel_id, 'Deluxe Ocean View', '54 m²', 'King or Twin Beds', 'Ocean View', 19000, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop', '["Ocean View", "Balcony", "Nespresso Machine", "Rain Shower"]'::jsonb, 'room'),
    (v_hotel_id, 'Frangipani Junior Suite', '65 m²', 'King Size Bed', 'Sea View', 32000, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800&auto=format&fit=crop', '["Private Island Access", "Exclusive Pool", "Free Mini Bar", "Champagne on Arrival"]'::jsonb, 'suite');

    -- Beachcomber Paradis
    INSERT INTO services (name, type, location, star_rating, rating, description, pricing, images, amenities, category)
    VALUES (
        'Beachcomber Paradis', 
        'hotel', 
        'Le Morne, South West', 
        4, 
        4.8, 
        'Situated on Mauritius'' finest coast, Paradis Beachcomber Golf Resort & Spa offers superb accommodation, cuisine and a wide array of land and water sports.',
        '{"base_price": 12500}',
        ARRAY['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&auto=format&fit=crop'],
        '[{"name": "Beachfront", "icon": "Waves"}, {"name": "4 Restaurants", "icon": "Utensils"}, {"name": "Sports Center", "icon": "Dumbbell"}, {"name": "18-hole Golf", "icon": "MapPin"}, {"name": "Free WiFi", "icon": "Wifi"}, {"name": "Helipad", "icon": "Car"}, {"name": "Bar", "icon": "Coffee"}, {"name": "AC", "icon": "Wind"}]'::jsonb,
        'Golf Resort'
    ) RETURNING id INTO v_hotel_id;

    INSERT INTO hotel_rooms (service_id, name, size, bed, view, price_per_night, image_url, features, type) VALUES
    (v_hotel_id, 'Ocean Room', '50 m²', 'King Bed', 'Ocean View', 12500, 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=800&auto=format&fit=crop', '["Sea View", "Terrace", "Walk-in Closet", "Bathtub"]'::jsonb, 'room');

    -- Heritage The Villas
    INSERT INTO services (name, type, location, star_rating, rating, description, pricing, images, amenities, category)
    VALUES (
        'Heritage The Villas', 
        'hotel', 
        'Bel Ombre, South', 
        5, 
        4.9, 
        'Heritage The Villas offers an exclusive selection of luxury villas with private pools, set within the Heritage Bel Ombre estate.',
        '{"base_price": 22000}',
        ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop'],
        '[{"name": "Private Pool", "icon": "Waves"}, {"name": "12 Restaurants", "icon": "Utensils"}, {"name": "Wellness Spa", "icon": "Dumbbell"}, {"name": "Championship Golf", "icon": "MapPin"}, {"name": "Fiber WiFi", "icon": "Wifi"}, {"name": "Concierge 24/7", "icon": "CheckCircle"}, {"name": "Golf Cart", "icon": "Car"}, {"name": "Full Kitchen", "icon": "Wind"}]'::jsonb,
        'Luxury Villa'
    ) RETURNING id INTO v_hotel_id;

    INSERT INTO hotel_rooms (service_id, name, size, bed, view, price_per_night, image_url, features, type) VALUES
    (v_hotel_id, '2 Bedroom Pool Villa', '200 m²', '2 King Beds', 'Golf & Ocean', 22000, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800&auto=format&fit=crop', '["Private Infinity Pool", "Woven Hammock", "BBQ Area", "Fully Equipped Kitchen"]'::jsonb, 'villa');

    -- Rodrigues Hotels
    -- Cotton Bay Hotel
    INSERT INTO services (name, type, location, star_rating, rating, description, pricing, images, amenities, category)
    VALUES (
        'Cotton Bay Hotel', 
        'hotel', 
        'Pointe Coton', 
        4, 
        4.8, 
        'Located on one of the finest beaches of Rodrigues, Cotton Bay Hotel offers a blend of tranquility and adventure.',
        '{"base_price": 8500}',
        ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop'],
        '[{"name": "Beachfront", "icon": "Waves"}, {"name": "Restaurant", "icon": "Utensils"}, {"name": "Fitness Room", "icon": "Dumbbell"}, {"name": "Free WiFi", "icon": "Wifi"}, {"name": "Parking", "icon": "Car"}, {"name": "TV", "icon": "Tv"}, {"name": "AC", "icon": "Wind"}, {"name": "Bar", "icon": "Coffee"}]'::jsonb,
        'Rodrigues'
    ) RETURNING id INTO v_hotel_id;

    INSERT INTO hotel_rooms (service_id, name, size, bed, view, price_per_night, image_url, features, type) VALUES
    (v_hotel_id, 'Superior Room', '35 m²', 'King Size Bed', 'Sea View', 8500, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800&auto=format&fit=crop', '["Sea View", "Balcony", "Mini Bar", "Safe"]'::jsonb, 'room');

    -- Rodrigues Island Resort
    INSERT INTO services (name, type, location, star_rating, rating, description, pricing, images, amenities, category)
    VALUES (
        'Rodrigues Island Resort', 
        'hotel', 
        'Anse Aux Anglais', 
        5, 
        4.9, 
        'A luxury resort offering the best of Rodrigues hospitality with modern amenities and stunning ocean views.',
        '{"base_price": 10000}',
        ARRAY['https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop'],
        '[{"name": "Private Beach", "icon": "Waves"}, {"name": "Fine Dining", "icon": "Utensils"}, {"name": "Spa & Gym", "icon": "Dumbbell"}, {"name": "High-Speed WiFi", "icon": "Wifi"}, {"name": "Room Service", "icon": "CheckCircle"}, {"name": "Valet Parking", "icon": "Car"}, {"name": "Smart TV", "icon": "Tv"}, {"name": "Climate Control", "icon": "Wind"}]'::jsonb,
        'Rodrigues'
    ) RETURNING id INTO v_hotel_id;

    INSERT INTO hotel_rooms (service_id, name, size, bed, view, price_per_night, image_url, features, type) VALUES
    (v_hotel_id, 'Ocean Suite', '50 m²', 'King Size Bed', 'Ocean Front', 10000, 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800&auto=format&fit=crop', '["Panoramic View", "Jacuzzi", "Living Area", "Breakfast Included"]'::jsonb, 'suite');

    -- Sunset Hotel Rodrigues
    INSERT INTO services (name, type, location, star_rating, rating, description, pricing, images, amenities, category)
    VALUES (
        'Sunset Hotel Rodrigues', 
        'hotel', 
        'Grand Baie', 
        4, 
        4.6, 
        'Enjoy breathtaking sunsets and warm Rodriguan hospitality at this charming hotel overlooking the lagoon.',
        '{"base_price": 6800}',
        ARRAY['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&auto=format&fit=crop'],
        '[{"name": "Lagoon View", "icon": "Waves"}, {"name": "Creole Restaurant", "icon": "Utensils"}, {"name": "Free WiFi", "icon": "Wifi"}, {"name": "Parking", "icon": "Car"}, {"name": "TV", "icon": "Tv"}, {"name": "AC", "icon": "Wind"}, {"name": "Tea/Coffee", "icon": "Coffee"}, {"name": "Daily Housekeeping", "icon": "CheckCircle"}]'::jsonb,
        'Rodrigues'
    ) RETURNING id INTO v_hotel_id;

    INSERT INTO hotel_rooms (service_id, name, size, bed, view, price_per_night, image_url, features, type) VALUES
    (v_hotel_id, 'Standard Room', '30 m²', 'Queen Bed', 'Garden View', 6800, 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=800&auto=format&fit=crop', '["Garden View", "Terrace", "Shower", "Work Desk"]'::jsonb, 'room');

    -- Blue Lagoon Hotel
    INSERT INTO services (name, type, location, star_rating, rating, description, pricing, images, amenities, category)
    VALUES (
        'Blue Lagoon Hotel', 
        'hotel', 
        'Port Sud-Est', 
        4, 
        4.7, 
        'Nestled in a lush tropical garden, Blue Lagoon Hotel is the perfect getaway for nature lovers and peace seekers.',
        '{"base_price": 9000}',
        ARRAY['https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?q=80&w=1200&auto=format&fit=crop'],
        '[{"name": "Pool", "icon": "Waves"}, {"name": "Restaurant & Bar", "icon": "Utensils"}, {"name": "Free WiFi", "icon": "Wifi"}, {"name": "Near Hiking Trails", "icon": "MapPin"}, {"name": "Bike Rental", "icon": "Car"}, {"name": "TV", "icon": "Tv"}, {"name": "AC", "icon": "Wind"}, {"name": "Excursion Desk", "icon": "CheckCircle"}]'::jsonb,
        'Rodrigues'
    ) RETURNING id INTO v_hotel_id;

    INSERT INTO hotel_rooms (service_id, name, size, bed, view, price_per_night, image_url, features, type) VALUES
    (v_hotel_id, 'Garden Villa', '45 m²', 'King Bed', 'Garden', 9000, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800&auto=format&fit=crop', '["Private Terrace", "Outdoor Shower", "Mini Fridge", "Hammock"]'::jsonb, 'villa');
END $$;
