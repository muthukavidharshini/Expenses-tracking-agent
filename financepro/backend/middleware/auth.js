const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
        return res.status(401).json({ success: false, error: 'No authorization token, access denied' });
    }

    // Support both "Bearer <token>" and direct "<token>"
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

    if (!token) {
        return res.status(401).json({ success: false, error: 'No authorization token, access denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'finance_pro_secret_key_2026');
        req.user = decoded;
        next();
    } catch (err) {
        console.error('JWT Token Verification Error:', err.message);
        res.status(401).json({ success: false, error: 'Token is invalid or expired' });
    }
};
