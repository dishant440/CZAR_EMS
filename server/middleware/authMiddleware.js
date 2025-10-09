const jwt = require('jsonwebtoken');
const User = require('../model/userModel');

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'czarcore_secret_key');
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const verifyAdmin = async (req, res, next) => {
  const user = await User.findById(req.user.userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

module.exports = { verifyToken, verifyAdmin };
