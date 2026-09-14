import jwt from 'jsonwebtoken'

export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ message: 'Authentication required' })
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET)
    if (req.admin.role !== 'admin') return res.status(401).json({ message: 'Administrator access required' })
    next()
  } catch { res.status(401).json({ message: 'Invalid or expired token' }) }
}
