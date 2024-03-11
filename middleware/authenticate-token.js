const jwt = require('jsonwebtoken');

require('dotenv').config(); // Load environment variables from .env file

const TOKEN_SECRET = process.env.TOKEN_SECRET;

function generateToken(userId) {
    const token = jwt.sign({ userId }, TOKEN_SECRET, { expiresIn: '1h' });
    return token;
}

function authenticateToken(req, res, next) {
    // Retrieve the JWT token from the request headers or query parameters
    //const token = req.headers['authorization'] || req.query.token;
    const header = req.header("Authorization") || "";
    const token = header.split(" ")[1];

    // Check if the token is present
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Verify the token
    try {
        const payload = jwt.verify(token, TOKEN_SECRET);
        req.id = payload.userId;
        console.log(`User ID: ${req.id}`);
        next();
      } catch (error) {
        return res.status(403).json({ message: "Token not valid" });
      }
    // jwt.verify(token, TOKEN_SECRET, (err, decodedToken) => {
    //     if (err) {
    //         return res.status(403).json({ message: 'Invalid token.' });
    //     }
        
    //     // Attach the decoded token to the request object for further use
    //     req.decodedToken = decodedToken;
    //     next(); // Proceed to the next middleware
    // });
}

module.exports = { generateToken, authenticateToken };
