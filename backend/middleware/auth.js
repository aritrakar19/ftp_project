import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('Incoming Auth Token Header:', req.headers.authorization.substring(0, 20) + '...');
      
      const User = (await import('../models/User.js')).default;
      let dbUser;

      
      // Attempt 1: Verify as local backend JWT using secret
      try {
        const decodedLocal = jwt.verify(token, process.env.JWT_SECRET);
        if (decodedLocal.id) {
          dbUser = await User.findById(decodedLocal.id).select('-password');
        }
      } catch (verifyError) {
        // Ignored: Not a local token, might be a Firebase token
      }

      // Attempt 2: Fallback to Firebase JWT decoding if no dbUser yet
      if (!dbUser) {
        let decodedFirebase;
        try {
          const admin = (await import('../config/firebaseSetup.js')).default;
          decodedFirebase = await admin.auth().verifyIdToken(token);
        } catch (err) {
          throw new Error('Invalid token format or not a Firebase token');
        }

        dbUser = await User.findOne({ email: decodedFirebase.email }).select('-password');

        // Sync Firebase auth to DB if user doesn't exist
        if (!dbUser) {
          dbUser = await User.create({
            name: decodedFirebase.name || decodedFirebase.email.split('@')[0],
            email: decodedFirebase.email,
            firebaseUid: decodedFirebase.uid,
            role: 'user',
          });
        }
      }

      if (!dbUser) {
        return res.status(401).json({ message: 'User not found in system' });
      }

      req.user = dbUser;
      return next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    // No Authorization header at all
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Not authorized as admin' });
};
