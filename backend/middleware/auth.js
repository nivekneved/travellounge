const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');


const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const { data: admin, error } = await supabase
                .from('admins')
                .select('id, username, email, role')
                .eq('id', decoded.id)
                .single();

            if (error || !admin) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            req.admin = admin;
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.admin.role)) {
            return res.status(403).json({
                message: `Role ${req.admin.role} is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
