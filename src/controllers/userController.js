import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { httpsErrors } from "../../errors/httpsErrors.js";

export const register = async (req, res, next) => {
  
  try {
    const { email, username, password } = req.body;

    if (!email || !password || !username) {
      return next(new httpsErrors(400));
    }

    

        const passwordRegex = /^(?=.*\d).{10,}$/;
    if (!passwordRegex.test(password)) {
      return next(
        new httpsErrors(
          400,
          "Password must be at least 10 characters long and include at least one number"
        )
      );
    }

    const findEmail = await User.findOne({ email });

    if (findEmail) {
      return next(new httpsErrors(409, ": email"));
    }

    const findUsername = await User.findOne({ username });

    if (findUsername) {
      return next(new httpsErrors(409, ": username"));
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const registerUser = await User.create({
      username,
      email,
      password: passwordHash,
    });

    const token = jwt.sign({ id: registerUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "user created successfully!!",
      token,
    });
  } catch (error) {
    next(new httpsErrors(500));
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new httpsErrors(400));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new httpsErrors(400, ": invalid email or password"));
    }

    if (!user.password) {
  return next(
    new httpsErrors(
      400,
      ": This account was created with Google. Please login using Google."
    )
  );
}

    let token;

    if (user && (await bcrypt.compare(password, user.password))) {
      token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    } else {
      return next(new httpsErrors(400, ": invalid email or password"));
    }

    return res.status(200).json({
      message: "logged in successfully!!",
      token,
    });
  } catch (error) {
    next(new httpsErrors(500,error));
  }
};

export const logout = (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    next(new httpsErrors(500, error.message));
  }
};

export const searchUsers = async (req, res, next) => {
  try {
    const fromId = req.user._id;

    const findAllUsers = await User.find({
      _id: { $ne: fromId },
    })
      .select("_id username avatar avatarColor")
      .lean();

    res.status(200).json(findAllUsers);
  } catch (error) {
    next(httpsErrors(500, ": error getting users"));
  }
};
