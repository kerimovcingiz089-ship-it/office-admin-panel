const jwt = require('jsonwebtoken');

// Local-friendly auth middleware: verify JWT and attach payload user
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : null;

    if (!token) {
      return res.status(401).json({ message: 'Token tələb olunur!' });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your_super_secret_jwt_key_here'
    );

    // Prefer user object inside token if present; otherwise fallback to basic fields
    req.user = decoded.user || {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role || 'user',
      status: 'active'
    };

    return next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Token etibarsızdır!' });
  }
};

module.exports = auth;
