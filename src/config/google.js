import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import generateUsername from "../../utility/generateUsername.js";



export function registerGoogleStrategy() {
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("No email"), null);

        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.findOne({ email });
          if (user) {
            user.googleId = profile.id;
            await user.save();
          } else {
            const username = await generateUsername(profile.displayName, User);
            const avatar = profile.photos?.[0]?.value || null;
            user = await User.create({ googleId: profile.id, email, username ,avatar });
          }
        }

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  ));
}