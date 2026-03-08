import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const authRoute = express.Router();

authRoute.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

authRoute.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30s" }
    );
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

authRoute.post("/set-cookie", (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: "No token" });
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(200).json({ message: "ok" });
});

export default authRoute;
