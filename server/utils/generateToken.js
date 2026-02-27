const jwt = require('jsonwebtoken');

// Generate JWT token — role is optional, defaults to 'user'
const generateToken = (id, role = 'user') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
