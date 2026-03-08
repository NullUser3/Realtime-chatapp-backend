import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { httpsErrors } from "../../errors/httpsErrors.js";

const protect = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith("Bearer ") &&
        req.headers.authorization.split(" ")[1]);

        console.log("TOKEN:", token);  // add this
    console.log("JWT_SECRET:", process.env.JWT_SECRET ? "exists" : "MISSING");

    if (!token) return next(new httpsErrors(401, "Not authorized, no token"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) return next(new httpsErrors(401, "User not found"));

    req.user = user;
    next();
  } catch (error) {
    next(new httpsErrors(401, "Token invalid or expired"));
  }
};

export default protect;
