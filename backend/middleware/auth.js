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

      // Fetch user from DB or create if doesn't exist (syncing Firebase to MongoDB)
      const User = (await import('../models/User.js')).default;
      let dbUser = await User.findOne({ email: decoded.email });
      
      if (!dbUser) {
        dbUser = await User.create({
          name: decoded.name || (decoded.email ? decoded.email.split('@')[0] : 'Unknown'),
          email: decoded.email,
          googleId: decoded.user_id || decoded.sub,
          role: 'client' // default role
        });
      }

      req.user = dbUser;
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
