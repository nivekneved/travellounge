const supabase = require('../backend/config/supabase');

const verifyEnrichment = async () => {
    try {
        const { data, error } = await supabase
            .from('services')
            .select('id, name, inclusions, itinerary')
            .in('id', [
                '3c69743b-b939-44f2-9b53-819f57456976',
                'a00e5789-b03c-4ef9-b797-3aa26d217ab5',
                '218a2abd-e39f-41ee-b7eb-b014266083b3',
                '0f48e087-c62d-450b-99e0-7303cb9cb164',
                'bcf49739-9131-48d7-ab0b-55c3e9f485db'
            ]);

        if (error) throw error;

        data.forEach(s => {
            console.log(`--- ${s.name} ---`);
            console.log(`Inclusions: ${JSON.stringify(s.inclusions)}`);
            console.log(`Itinerary Days: ${s.itinerary ? s.itinerary.length : 0}`);
        });
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

verifyEnrichment();
