// const jwt = require('jsonwebtoken');
// const User = require('../model/userModel');
// const Admin = require('../model/adminModel')


// const verifyToken = (req, res, next) => {
//   const token = req.header('Authorization')?.replace('Bearer ', '');
//   if (!token) return res.status(401).json({ message: 'No token provided' });

//   try {
//     req.user = jwt.verify(token, process.env.JWT_SECRET || 'czarcore_secret_key');
//     next();
//   } catch {
//     res.status(401).json({ message: 'Invalid or expired token' });
//   }
// };

// // const verifyAdmin = async (req, res, next) => {
// //   console.log(req.user.userId);

// //   const user = await Admin.findById(req.user.userId);
// //   // console.log(user.role === 'admin');
// //   console.log("user : ", user);

// //   if ( user.role === 'admin') 
// //   {
// //     next();
// //     return
// //   }
// // //  return res.status(403).json({ message: 'Admin access required' });
// // };
//        const verifyAdmin = async (req, res, next) => {
//          try {
//            console.log(req.user.id);

//            const user = await Admin.findOne(req.user.id);
//            console.log("user : ", user);

//            if (!user || user.role !== 'admin') {
//              return res.status(403).json({ message: 'Admin access required' });
//            }

//            next();
//          } catch (error) {
//            console.error('Admin verification error:', error);
//            return res.status(500).json({ message: 'Internal server error' });
//          }
//        };



// module.exports = { verifyToken, verifyAdmin };

const jwt = require('jsonwebtoken');
const Admin = require('../model/adminModel');

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    req.user = jwt.verify(token, 'czarcore_secret_key');
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const verifyAdmin = async (req, res, next) => {
  try {
    // Debug log to see exactly what is in the token
    console.log("verifyAdmin - req.user:", req.user);

    const { userId, role, email } = req.user;

    // 1. Check Token Content
    if (!userId) {
      console.error("verifyAdmin - Missing userId in token");
      return res.status(403).json({ message: 'Access Forbidden: Invalid token payload' });
    }

    if (role !== 'admin') {
      console.error(`verifyAdmin - Role is ${role}, expected admin`);
      return res.status(403).json({ message: 'Access Forbidden: Admin privileges required' });
    }

    // 2. Check Database
    // First try by ID (if logged in via adminLogin)
    let user = await Admin.findById(userId);

    // If not found, try by email (if logged in via regular login where userId = user._id)
    if (!user && email) {
      console.log("verifyAdmin - Admin not found by ID (likely User ID), trying email:", email);
      user = await Admin.findOne({ email: email });
    }

    if (!user) {
      console.error("verifyAdmin - User not found in Admin collection (by ID or Email)");
      return res.status(403).json({ message: 'Access Forbidden: Admin account not found' });
    }

    if (user.role !== 'admin') {
      console.error("verifyAdmin - User exists but role is not admin in DB");
      return res.status(403).json({ message: 'Access Forbidden: User is not an admin' });
    }

    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { verifyToken, verifyAdmin };
