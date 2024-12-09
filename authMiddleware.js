const jwt = require("jsonwebtoken");

const authenticateJWT = (req, res, next) => {
  const token = req.headers["authorization"];

  if (token) {
    jwt.verify(token.split(" ")[1], process.env.SECRET_KEY, (err, user) => {
      if (err) return res.status(403).json({ message: "Token is invalid" });
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: "No token provided" });
  }
};

module.exports = authenticateJWT;
