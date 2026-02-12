const supabase = require('../backend/config/supabase');

const enrichmentData = {
    '3c69743b-b939-44f2-9b53-819f57456976': { // Full Day South Tour
        inclusions: [
            "Private Hotel Pickup & Drop-off",
            "Professional Licensed Driver/Guide",
            "Trou aux Cerfs Crater visit",
            "Grand Bassin (Ganga Talao) tour",
            "Black River Gorges entrance fee",
            "Seven Coloured Earth entrance fees",
            "Chamarel Waterfall visit"
        ],
        exclusions: [
            "Lunch and drinks",
            "Gratuities for the guide",
            "Personal expenses"
        ],
        itinerary: [
            { day: 1, title: "Southern Highlights", description: "Discover the natural wonders of Mauritius' South including Trou aux Cerfs, Grand Bassin, and the magical Chamarel.", activities: "9:00 AM Pickup. 10:00 AM Trou aux Cerfs Crater. 11:30 AM Grand Bassin Sacred Lake. 1:00 PM Black River Gorges view point. 2:00 PM Chamarel Seven Coloured Earth. 5:00 PM Return." }
        ],
        highlights: [
            "Walk on the edge of a dormant volcano at Trou aux Cerfs",
            "Experience the spiritual atmosphere of Grand Bassin",
            "Witness the unique volcanic earth colors at Chamarel"
        ]
    },
    'a00e5789-b03c-4ef9-b797-3aa26d217ab5': { // Île aux Cerfs - Catamaran Cruise
        inclusions: [
            "Full day cruise on shared catamaran",
            "BBQ Lunch on board (Fish, Chicken, Sausages, Pasta, Salads)",
            "Unlimited alcoholic & non-alcoholic beverages",
            "Visit to Grand River South East Waterfall",
            "Snorkeling equipment",
            "Motorboat transfer to Ile aux Cerfs"
        ],
        exclusions: [
            "Parasailing and other water sports at Ile aux Cerfs",
            "Personal tipping",
            "Hotel transfers (can be added separately)"
        ],
        itinerary: [
            { day: 1, title: "East Coast Sailing", description: "A day of sun, sea, and tropical relaxation on the East coast with a visit to the famous Ile aux Cerfs.", activities: "9:30 AM Boarding. 10:30 AM GRSE Waterfall visit. 11:30 AM Lagoon snorkeling. 1:00 PM BBQ Lunch on board. 2:30 PM Ile aux Cerfs free time. 4:30 PM Return." }
        ]
    },
    '218a2abd-e39f-41ee-b7eb-b014266083b3': { // Seven Coloured Earth Tour
        inclusions: [
            "Entrance tickets to Seven Coloured Earth Park",
            "Visit to Chamarel Waterfall",
            "Access to the Giant Tortoise park",
            "Coffee shop and souvenir shop access"
        ],
        itinerary: [
            { day: 1, title: "Chronicles of Chamarel", description: "Explore the geological phenomenon of the colored dunes and the highest waterfall in Mauritius.", activities: "Walk through the geopark, enjoy panoramic views of the waterfall, and witness the unique 7 colors of the earth." }
        ]
    },
    '0f48e087-c62d-450b-99e0-7303cb9cb164': { // Sunset Catamaran Cruise
        inclusions: [
            "2-hour sunset cruise in Northern lagoon",
            "Selection of snacks and finger foods",
            "Complimentary drinks (Soft, Juice, Beer, Wine)",
            "Ambient background music"
        ],
        itinerary: [
            { day: 1, title: "Golden Hour at Sea", description: "Sail along the pristine coastline of the North as the sun dips below the horizon in a spectacular display of colors.", activities: "5:00 PM Departure. Scenic cruise towards Coin de Mire. Sunset viewing with snacks and drinks. 7:00 PM Return." }
        ]
    },
    'bcf49739-9131-48d7-ab0b-55c3e9f485db': { // Catamaran Cruise to Ile aux Cerfs
        inclusions: [
            "Catamaran excursion on the East Coast",
            "BBQ Lunch & Drinks included",
            "Visit to the Waterfall",
            "Snorkeling at leisure"
        ],
        itinerary: [
            { day: 1, title: "Turquoise Lagoon Discovery", description: "Experience the ultimate catamaran trip to the jewel of the East, Ile aux Cerfs.", activities: "Morning boarding, waterfall visit, snorkeling in the lagoon, BBQ lunch, afternoon at leisure on the island." }
        ]
    }
};

const enrichServices = async () => {
    try {
        console.log('Starting enrichment...');
        for (const [id, data] of Object.entries(enrichmentData)) {
            console.log(`Enriching service ID: ${id}`);
            const { error } = await supabase
                .from('services')
                .update({
                    inclusions: data.inclusions || [],
                    exclusions: data.exclusions || [],
                    itinerary: data.itinerary || [],
                    highlights: data.highlights || []
                })
                .eq('id', id);

            if (error) {
                console.error(`Error updating service ${id}:`, error.message);
            } else {
                console.log(`Successfully enriched service ${id}`);
            }
        }
        console.log('Enrichment complete.');
        process.exit(0);
    } catch (err) {
        console.error('Fatal Error:', err.message);
        process.exit(1);
    }
};

enrichServices();
