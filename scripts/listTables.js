const supabase = require('../backend/config/supabase');

const listTables = async () => {
    try {
        const { data, error } = await supabase.rpc('get_tables'); // Custom RPC if it exists

        if (error) {
            // Fallback: try raw query via execute_sql if I had it, but I'll try to just check if 'services' exists to verify connection
            console.log('RPC failed, checking services table...');
            const { data: services, error: sError } = await supabase.from('services').select('count');
            if (sError) throw sError;
            console.log('Services table found.');

            // Try hero_slides again but with schema reload? Actually I can't force it easily via JS.
            // Let's try to query information_schema if possible
            const { data: tables, error: tError } = await supabase.from('pg_tables').select('*'); // This won't work usually
            console.log('Tables check:', tables, tError?.message);
        } else {
            console.log('Tables:', data);
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

listTables();
