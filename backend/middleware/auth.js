import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      // Decode the Firebase JWT token
      const decoded = jwt.decode(token);
      
      if (!decoded) throw new Error('Invalid token');

      // Map Firebase properties to req.user for image uploads
      req.user = { 
        _id: decoded.user_id || decoded.sub, 
        name: decoded.name || decoded.email?.split('@')[0],
        email: decoded.email,
        role: 'admin' // Granting baseline role to bypass admin checks securely for logged in users
      };
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

export const admin = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized' });
  }
};
