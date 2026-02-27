/* eslint-disable no-console */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const dummyCustomers = [
    { name: 'Alice Smith', email: 'alice@example.com', phone: '+1234567890' },
    { name: 'Bob Johnson', email: 'bob@example.com', phone: '+1987654321' },
    { name: 'Charlie Davis', email: 'charlie@example.com', phone: '+1122334455' },
    { name: 'Diana Prince', email: 'diana@example.com', phone: '+1555666777' },
    { name: 'Evan Wright', email: 'evan@example.com', phone: '+1999888777' },
];

async function seedBookings() {
    console.log('Seeding bookings across product categories...');

    // Get active products from 'services' table
    const { data: products, error: productError } = await supabase
        .from('services')
        .select('id, name, category, pricing');

    if (productError) {
        console.error('Error fetching products from services table:', productError);
        return;
    }

    if (!products || products.length === 0) {
        console.log('No active products found in services table.');
        return;
    }

    // Create one or two bookings for each product category we find
    const bookingsToInsert = [];

    // Group products by category
    const productsByCategory = {};
    for (const product of products) {
        const cat = product.category || 'misc';
        if (!productsByCategory[cat]) {
            productsByCategory[cat] = [];
        }
        productsByCategory[cat].push(product);
    }

    let customerIndex = 0;

    for (const category in productsByCategory) {
        const list = productsByCategory[category];

        // Take up to 2 products per category
        const productsToSeed = list.slice(0, 2);

        for (const product of productsToSeed) {
            const customer = dummyCustomers[customerIndex % dummyCustomers.length];

            // Determine a random future date
            const checkIn = new Date();
            checkIn.setDate(checkIn.getDate() + Math.floor(Math.random() * 30) + 5);
            const checkOut = new Date(checkIn);
            checkOut.setDate(checkOut.getDate() + Math.floor(Math.random() * 7) + 2);

            const travelers = Math.floor(Math.random() * 4) + 1;
            // Price is inside 'pricing' JSONB
            const basePrice = product.pricing?.basePrice || 1000;

            const booking = {
                service_id: product.id,
                service_type: category,
                booking_details: {
                    service_name: product.name,
                    travelers: travelers,
                    checkIn: checkIn.toISOString().split('T')[0],
                    checkOut: checkOut.toISOString().split('T')[0],
                    message: `Mock booking for ${product.name} (${category}).`
                },
                customer_info: customer,
                total_price: Math.floor(basePrice * travelers),
                status: Math.random() > 0.4 ? 'confirmed' : 'pending',
                payment_status: 'pending',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            bookingsToInsert.push(booking);
            customerIndex++;
        }
    }

    console.log(`Generated ${bookingsToInsert.length} bookings for ${Object.keys(productsByCategory).length} categories.`);

    const { error: insertError } = await supabase
        .from('bookings')
        .insert(bookingsToInsert);

    if (insertError) {
        console.error('Error inserting bookings:', insertError);
    } else {
        console.log('Bookings seeded successfully!');
    }
}

seedBookings();
