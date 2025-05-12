// middleware/auth.js
const jwt = require('jsonwebtoken');
const { accessTokenSecret } = require('../config/jwtConfig'); // Update with your correct path

// middleware/auth.js
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Token missing, please log in" });
    }

    jwt.verify(token, accessTokenSecret, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token, please log in" });
        }

        // Log the decoded user object for debugging
        // console.log('Decoded JWT user:', user);

        req.user = user;
        next();
    });
}


module.exports = authenticateToken;
