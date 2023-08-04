const jwt = require("jsonwebtoken");

// Generate JWT token
function generateToken(user) {
  const token = jwt.sign(
    { id: user.id, email: user.email },
    "your-secret-key",
    { expiresIn: "1h" }
  );
  return token;
}

// Verify JWT token
function verifyToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).send({ auth: false, message: "No token provided." });
  }

  jwt.verify(token, "your-secret-key", function (err, decoded) {
    if (err) {
      return res
        .status(500)
        .send({ auth: false, message: "Failed to authenticate token." });
    }

    req.userId = decoded.id;
    next();
  });
}

module.exports = { generateToken, verifyToken };
