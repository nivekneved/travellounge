const supabase = require('../config/supabase');
const notificationService = require('../utils/notificationService');

// @desc    Create a booking request
// @route   POST /api/bookings
// @access  Public
exports.createBooking = async (req, res) => {
    try {
        const { customer, service_id, room_id, booking_details, consent } = req.body;
        const { checkIn, checkOut } = booking_details;

        if (!consent) return res.status(400).json({ message: 'Consent is required' });

        // 1. Fetch Room & Inventory Data
        const { data: inventory, error: invError } = await supabase
            .from('room_daily_prices')
            .select('*')
            .eq('room_id', room_id)
            .gte('date', checkIn)
            .lt('date', checkOut); // Exclude checkout day price usually

        if (invError || !inventory || inventory.length === 0) {
            return res.status(400).json({ message: 'Pricing not set for these dates' });
        }

        // 2. Scenario 101/105: Strict Availability & Conflict Check
        const isBlocked = inventory.some(day => day.is_blocked || (day.available_units !== undefined && day.available_units <= 0));
        if (isBlocked) {
            return res.status(400).json({ message: 'Conflict: One or more dates are fully booked' });
        }

        // 3. Robust Price Calculation
        const totalPrice = inventory.reduce((sum, day) => sum + Number(day.price), 0);

        // 4. Create Booking
        const { data: booking, error: bookError } = await supabase
            .from('bookings')
            .insert([{
                customer,
                service_id: service_id,
                booking_details,
                total_price: totalPrice,
                status: 'pending',
                consent
            }])
            .select('*')
            .single();

        if (bookError) throw bookError;

        // 5. Decrement Inventory (Scenario 111)
        // Note: For simplicity, we use upsert to decrement. 
        // In highly concurrent environments, a DB function would be better.
        const updates = inventory.map(day => ({
            ...day,
            available_units: (day.available_units || 1) - 1,
            is_blocked: (day.available_units || 1) - 1 <= 0
        }));

        await supabase.from('room_daily_prices').upsert(updates, { onConflict: 'room_id,date' });

        // 6. Notifications
        try {
            const { data: service } = await supabase.from('services').select('name').eq('id', service_id).single();
            await notificationService.sendEmail(customer.email, 'Paradise Confirmed!', `Total: ${totalPrice} MUR. Property: ${service?.name}`);
            await notificationService.sendEmail('admin@travellounge.mu', 'INCOME ALERT!', `Reservation for ${service?.name}. Value: ${totalPrice} MUR`);
        } catch (e) {
            console.error('Notification failed', e);
        }

        res.status(201).json({ ...booking, totalPrice });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
exports.getBookings = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('*, services(name, type)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private/Admin
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status, admin_notes } = req.body;
        const { data, error } = await supabase
            .from('bookings')
            .update({ status, admin_notes })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error || !data) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Audit Log
        await supabase.from('audit_logs').insert([{
            admin_id: req.user?.id,
            action: 'UPDATE_BOOKING_STATUS',
            target_type: 'BOOKING',
            target_id: req.params.id,
            details: { newStatus: status, admin_notes }
        }]);

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a custom package request (Package Builder)
// @route   POST /api/bookings/package-request
// @access  Public
exports.createPackageRequest = async (req, res) => {
    try {
        const { customer, package_details, consent } = req.body;

        if (!consent) return res.status(400).json({ message: 'Consent is required' });

        const { data, error } = await supabase
            .from('bookings')
            .insert([{
                customer,
                booking_details: package_details,
                status: 'pending',
                total_price: 0, // Quote to be provided
                consent,
                is_custom: true
            }])
            .select('*')
            .single();

        if (error) throw error;

        // Notifications
        try {
            await notificationService.sendEmail(customer.email, 'Bespoke Package Request Received!', 'Our agents will review your vision and contact you with a tailormade quote.');
            await notificationService.sendEmail('admin@travellounge.mu', 'NEW PACKAGE BUILDER REQUEST', `Customer ${customer.name} wants a custom ${package_details.duration} trip to ${package_details.destination}`);
        } catch (e) {
            console.error('Notification failed', e);
        }

        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Trigger email notification (without creating booking)
// @route   POST /api/bookings/notify
// @access  Public (should be protected in prod, but public for now to match flow)
exports.notifyBooking = async (req, res) => {
    try {
        const { booking_id, customer, productName, totalPrice } = req.body;

        // Notifications
        try {
            await notificationService.sendEmail(customer.email, 'Paradise Confirmed!', `Total: ${totalPrice} MUR. Property: ${productName}`);
            await notificationService.sendEmail('admin@travellounge.mu', 'INCOME ALERT!', `Reservation #${booking_id} for ${productName}. Value: ${totalPrice} MUR`);
            res.json({ success: true, message: 'Notifications sent' });
        } catch (e) {
            console.error('Notification failed', e);
            res.status(500).json({ message: 'Notification failed' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
