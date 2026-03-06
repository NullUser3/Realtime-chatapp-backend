import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const authRoute = express.Router();


authRoute.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);


authRoute.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {

    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(process.env.FRONTEND_URL);
  }
);

export default authRoute;