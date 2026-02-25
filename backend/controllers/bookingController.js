const supabase = require('../config/supabase');
const notificationService = require('../utils/notificationService');
const Joi = require('joi');

const bookingSchema = Joi.object({
    customer_info: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.string().required()
    }).required(),
    service_id: Joi.string().allow(null, '').optional(),
    service_type: Joi.string().required(),
    room_id: Joi.string().allow(null, '').optional(),
    booking_details: Joi.object({
        checkIn: Joi.date().iso().required(),
        checkOut: Joi.date().iso().min(Joi.ref('checkIn')).required(),
        travelers: Joi.number().integer().min(1).default(1),
        message: Joi.string().allow('', null).optional(),
        productName: Joi.string().allow('', null).optional(),
        estimatedTotal: Joi.alternatives().try(Joi.string(), Joi.number()).optional()
    }).required(),
    consent: Joi.boolean().valid(true).required(),
    estimated_total: Joi.number().optional()
});

// @desc    Create a booking request
// @route   POST /api/bookings
// @access  Public
exports.createBooking = async (req, res) => {
    try {
        const { error: validationError } = bookingSchema.validate(req.body);
        if (validationError) {
            return res.status(400).json({ message: validationError.details[0].message });
        }

        const { customer_info, service_id, service_type, room_id, booking_details, consent, estimated_total } = req.body;
        const { checkIn, checkOut } = booking_details || {};

        if (!consent) return res.status(400).json({ message: 'Consent is required' });

        let finalPrice = 0;

        if (room_id) {
            // Room specific booking
            const { data: inventory, error: invError } = await supabase
                .from('room_daily_prices')
                .select('*')
                .eq('room_id', room_id)
                .gte('date', checkIn)
                .lt('date', checkOut); // Exclude checkout day price usually

            if (invError || !inventory || inventory.length === 0) {
                return res.status(400).json({ message: 'Pricing not set for these dates' });
            }

            // Strict Availability & Conflict Check
            const isBlocked = inventory.some(day => day.is_blocked || (day.available_units !== undefined && day.available_units <= 0));
            if (isBlocked) {
                return res.status(400).json({ message: 'Conflict: One or more dates are fully booked' });
            }

            finalPrice = inventory.reduce((sum, day) => sum + Number(day.price), 0);

            // Decrement Inventory
            const updates = inventory.map(day => ({
                ...day,
                available_units: (day.available_units || 1) - 1,
                is_blocked: (day.available_units || 1) - 1 <= 0
            }));
            await supabase.from('room_daily_prices').upsert(updates, { onConflict: 'room_id,date' });

        } else if (service_id && service_id !== 'static-inquiry') {
            // General service booking
            const { data: service, error: svcError } = await supabase
                .from('services')
                .select('pricing')
                .eq('id', service_id)
                .single();

            if (svcError || !service) {
                return res.status(400).json({ message: 'Service not found or pricing unavailable' });
            }

            const basePrice = service.pricing?.price || service.pricing?.base_price || service.pricing?.adult || 0;
            const start = new Date(checkIn);
            const end = new Date(checkOut);
            let nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            if (isNaN(nights) || nights < 1) nights = 1;

            finalPrice = basePrice * nights;
        } else {
            // Static inquiry or custom package fallback
            finalPrice = estimated_total || 0;
        }

        // Validate that calculated front-end matches back-end exactly (prevent manipulation)
        if (estimated_total !== undefined && finalPrice > 0) {
            if (Math.abs(finalPrice - estimated_total) > 100) {
                return res.status(400).json({ message: `Price mismatch detected. Expected ${finalPrice}, but received ${estimated_total}. Please refresh and try again.` });
            }
        }

        // Create Booking
        const { data: booking, error: bookError } = await supabase
            .from('bookings')
            .insert([{
                customer_info,
                service_id,
                service_type,
                booking_details,
                total_price: finalPrice,
                consent,
                status: 'pending'
            }])
            .select('*')
            .single();

        if (bookError) throw bookError;

        // Notifications
        try {
            const customerEmail = customer_info?.email || req.body.customer?.email; // Fallback
            const productName = booking_details?.productName || 'Service';

            if (customerEmail) {
                await notificationService.sendEmail(customerEmail, 'Paradise Confirmed!', `Total: ${finalPrice} MUR. Property: ${productName}`);
            }
            // Centralize admin notifications
            await notificationService.sendEmail('admin@travellounge.mu', 'INCOME ALERT: New Booking Request', `A new reservation has been received for ${productName}. Value: ${finalPrice} MUR. Customer: ${customer_info?.name || 'Unknown'}`);
        } catch (e) {
            console.error('Notification failed', e);
        }

        res.status(201).json({ ...booking, finalPrice });
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
            await notificationService.sendEmail('admin@travellounge.mu', 'NEW PACKAGE BUILDER REQUEST', `Customer ${customer.name} wants a custom ${package_details.duration} trip to ${package_details.destination}. Please review and provide a quote.`);
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
            await notificationService.sendEmail('admin@travellounge.mu', 'INCOME ALERT: Booking Notification', `Manual notification triggered for Reservation #${booking_id} (${productName}). Value: ${totalPrice} MUR`);
            res.json({ success: true, message: 'Notifications sent' });
        } catch (e) {
            console.error('Notification failed', e);
            res.status(500).json({ message: 'Notification failed' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
