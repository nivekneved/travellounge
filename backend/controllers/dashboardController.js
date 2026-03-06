const supabase = require('../config/supabase');

/**
 * @desc    Get all table statistics
 * @route   GET /api/dashboard/stats
 * @access  Public (for now)
 */
exports.getTableStats = async (req, res) => {
    try {
        const tables = [
            'services', 'hotel_rooms', 'room_daily_prices', 'categories',
            'site_settings', 'hero_slides', 'promotions', 'testimonials',
            'team_members', 'pages', 'page_content', 'menus', 'flights',
            'reviews', 'bookings', 'media', 'newsletter_subscribers',
            'email_templates', 'audit_logs', 'admins', 'seo_metadata'
        ];

        const stats = await Promise.all(tables.map(async (table) => {
            const { count, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            return {
                table,
                count: error ? 0 : count,
                status: error ? 'Error' : 'Healthy',
                lastUpdated: new Date().toISOString()
            };
        }));

        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            data: stats
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
