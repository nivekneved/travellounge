const supabase = require('../config/supabase');

exports.getAuditLogs = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*, admins(username, email)')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching audit logs' });
    }
};
