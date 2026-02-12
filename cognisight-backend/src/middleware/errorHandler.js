export const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue);
    return res.status(400).json({
      error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
};
