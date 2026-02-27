/* eslint-disable no-console */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTable() {
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching services:', error);
    } else if (data && data.length > 0) {
        console.log('Full columns in services table:', JSON.stringify(Object.keys(data[0]), null, 2));
        console.log('Sample record fields:', JSON.stringify(data[0], null, 2).substring(0, 500));
    } else {
        console.log('No data in services table.');
    }
}

inspectTable();
