const jwt = require('jsonwebtoken');
const JWT_SECRET = "yourJWTSecretKey"; // Secret key for JWT

const fetchuser = (req, res, next) => {
    // Get the user from JWT token and add the user id to the request body
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({ error: "Please authenticate by using a valid Token" });
    }

    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;  // Ensure data.user contains the user info, including id
        next();
    } catch (error) {
        return res.status(401).send({ error: "Please authenticate by using a valid Token" });
    }
}

module.exports = fetchuser;
