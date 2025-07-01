import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET || 'supersecret';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Kein Token übergeben' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded; 
    next();
  } catch {
    res.status(403).json({ error: 'Ungültiger Token' });
  }
};
