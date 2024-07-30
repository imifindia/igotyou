const notFoundHandler = (req, res, next) => {
    res.status(404).json({ error: 'Not Found', message: 'The requested resource could not be found' });
  };
  
  module.exports = notFoundHandler;
  