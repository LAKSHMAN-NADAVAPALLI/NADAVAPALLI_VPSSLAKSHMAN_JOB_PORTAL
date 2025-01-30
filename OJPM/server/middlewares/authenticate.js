const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).send({ message: 'No token, authorization denied' });
  }
  
  try {
    const decoded = jwt.verify(token, 'your_secret_key');
    req.user = decoded;  // Add user info to the request
    next();
  } catch (err) {
    res.status(401).send({ message: 'Token is not valid' });
  }
};

module.exports = authenticate;
