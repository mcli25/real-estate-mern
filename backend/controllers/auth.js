const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const authRouter = require("express").Router();
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");
const { error } = require("../utils/logger");
require("dotenv").config();

function generateUsername() {
  return "user_" + crypto.randomBytes(3).toString("hex");
}
authRouter.post("/pre-register", async (request, response, next) => {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return response
        .status(400)
        .json({ error: "Email and Password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return response.status(400).json({ error: "Email already registered" });
    }

    const token = jwt.sign({ email, password }, process.env.SECRET, {
      expiresIn: "1d",
    });
    console.log("Generated token:", token);

    const name = "Real Estate App";
    const subject = "Complete Your Registration";
    const confirmationLink = `${process.env.CLIENT_URL}/confirm-registration?token=${token}`;
    const html = `
          <h1>Welcome to Our Service!</h1>
          <p>Thank you for pre-registering. To complete your registration, please click on the link below:</p>
          <a href="${confirmationLink}">Complete Registration</a>
          <p>If you didn't request this, please ignore this email.</p>
        `;

    await sendEmail(email, subject, html, name);

    response.status(200).json({
      message:
        "Pre-registration successful. Please check your email to complete registration.",
    });
  } catch (error) {
    next(error);
  }
});
authRouter.post("/register", async (request, response, next) => {
  try {
    const decodedToken = jwt.verify(request.body.token, process.env.SECRET);
    const { email, password } = decodedToken;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return response.status(400).json({ error: "User already registered" });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const user = new User({
      username: generateUsername(),
      email,
      password: passwordHash,
    });

    const savedUser = await user.save();

    const token = jwt.sign({ id: savedUser.id }, process.env.SECRET, {
      expiresIn: "1d",
    });

    const refreshToken = jwt.sign({ id: savedUser.id }, process.env.SECRET, {
      expiresIn: "7d",
    });

    response.status(201).json({ token, refreshToken, user: savedUser });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
});
authRouter.post("/forget-password", async (request, response, next) => {
  try {
    const { email } = request.body;
    if (!email) {
      return response.status(400).json({ error: "Email is required" });
    }
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return response
        .status(400)
        .json({ error: "User has not been registered" });
    }

    const code = crypto.randomBytes(3).toString("hex");
    const token = jwt.sign({ id: existingUser._id, code }, process.env.SECRET, {
      expiresIn: "1h",
    });

    existingUser.resetCode = code;
    existingUser.resetCodeExpires = Date.now() + 3600000;
    await existingUser.save();

    const name = "Real Estate App";
    const subject = "Reset Your Password";
    const confirmationLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    const html = `
        <h1>Welcome to Our Service!</h1>
        <p>Thank you for reseting your email. To complete your reset, please click on the link below:</p>
        <a href="${confirmationLink}">Reset Your Password</a>
        <p>If you didn't request this, please ignore this email.</p>
      `;

    await sendEmail(email, subject, html, name);

    response
      .status(200)
      .json({ message: "A password reset link has been sent." });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/access-account", async (request, response, next) => {
  const { token, newPassword } = request.body;
  if (!token) {
    return response.status(400).json({ error: "Token is required" });
  }
  try {
    const decodedCode = jwt.verify(token, process.env.SECRET);
    const user = await User.findOne({ _id: decodedCode.id });
    if (!user.resetCodeExpires || user.resetCodeExpires < Date.now()) {
      return response.status(401).json({ error: "Reset code has expired" });
    }
    const userForToken = {
      username: user.username,
      id: user._id,
    };

    const accessToken = jwt.sign(userForToken, process.env.SECRET, {
      expiresIn: "1d",
    });
    const refreshToken = jwt.sign(userForToken, process.env.SECRET, {
      expiresIn: "7d",
    });

    const passwordHash = await bcrypt.hash(newPassword, 10);

    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    user.password = passwordHash;
    await user.save();

    response.status(200).json({ accessToken, refreshToken, user });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/refresh-token", async (request, response, next) => {
  try {
    const { refreshToken } = request.body;
    if (!refreshToken) {
      return response.status(400).json({ error: "Refresh token is required" });
    }

    const decodedToken = jwt.verify(refreshToken, process.env.SECRET);
    const { id } = decodedToken;
    const user = await User.findById(id);
    if (!user) {
      return response.status(401).json({ error: "User not found" });
    }

    const userForToken = {
      username: user.username,
      id: user._id,
    };
    const accessToken = jwt.sign(userForToken, process.env.SECRET, {
      expiresIn: "1d",
    });
    const newRefreshToken = jwt.sign(userForToken, process.env.SECRET, {
      expiresIn: "7d",
    });

    response
      .status(200)
      .json({ token: accessToken, refreshToken: newRefreshToken, user });
  } catch (error) {
    next(error);
  }
});

authRouter.put("/update-password", async (request, response, next) => {
  try {
    const user = request.user;

    const password = request.body.password;
    if (!password) {
      return response.status(400).json({ error: "Password is required" });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    const passwordHash = await bcrypt.hash(password, 10);
    if (isMatch) {
      return response
        .status(400)
        .json({ error: "Password you entered is the same as before" });
    }

    user.password = passwordHash;

    await user.save();
    response.status(200).json({ user });
  } catch (error) {
    next(error);
  }
});

module.exports = authRouter;
