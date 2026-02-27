/* eslint-disable no-console */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectBookings() {
    const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching bookings:', error);
    } else if (data && data.length > 0) {
        console.log('Columns in bookings table:', JSON.stringify(Object.keys(data[0]), null, 2));
        console.log('Sample record:', JSON.stringify(data[0], null, 2));
    } else {
        // If empty, try to get column names from information_schema if possible, 
        // but usually select * limit 1 is enough if there is data.
        // If no data, we might need a different approach.
        console.log('No data in bookings table.');
    }
}

inspectBookings();
