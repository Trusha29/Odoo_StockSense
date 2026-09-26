const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  return jwt.sign(
    {
      userId: userId
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d"
    }
  );
};

module.exports = generateToken;