const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token; //create a variable to store token
//Checking If Token Exists
  if (
    req.headers.authorization &&//Does authorization header exist?
    req.headers.authorization.startsWith("Bearer") //Does it start with "Bearer"?
  ) {
    try {
      //If header is:Bearer abcdef12345
      //split(" ")=["Bearer", "abcdef12345"]
      //So [1] gives the actual token.
      token = req.headers.authorization.split(" ")[1];

      //Is token valid?,Was it signed using "secretkey"?
      const decoded = jwt.verify(token, "secretkey");

      req.user = { id: decoded.id };

      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
};

module.exports = protect;


//1️⃣ Get token from header
//2️⃣ Verify token
//3️⃣ Attach user to req
//4️⃣ Call next()