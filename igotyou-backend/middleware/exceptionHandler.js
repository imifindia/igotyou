const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (res.headersSent) {
    return next(err);
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Invalid data', details: err.errors });
  }

  if (err.name === 'MongoError' && err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate key error', details: err.keyValue });
  }

  res.status(500).json({ error: 'Internal server error', message: err.message });
};

module.exports = errorHandler;
