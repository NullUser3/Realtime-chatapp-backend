import mongoose from "mongoose";

const colors = ["blue", "teal", "green", "yellow", "orange", "red", "purple"];

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      match: [/^[a-zA-Z0-9_]+$/, "Invalid username format"],
      trim: true,
      unique: true,
      minlength: [5, "Min username length is 5"],
      maxlength: [20, "Max username lenght is 20"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
password: {
  type: String,
  required: function () {
    return !this.googleId; // only required if NOT Google user
  },
  validate: {
    validator: function (v) {
      // Minimum 10 characters, at least one number
      return /^(?=.*\d).{10,}$/.test(v);
    },
    message:
      "Password must be at least 10 characters long and include at least one number",
  }},
    avatar: {
      type: String,
      default: null,
      trim: true,
    },
    avatarColor: {
      type: String,
      enum: colors,
      default: () => colors[Math.floor(Math.random() * colors.length)],
    },
    googleId: { type: String, unique: true, sparse: true },
    lastSeen: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
