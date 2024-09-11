const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");
const Ad = require("../models/ad");

usersRouter.get("/", async (request, response, next) => {
  try {
    const users = await User.find({});
    response.json(users);
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/wishlist", async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const wishlist = user.wishlist || [];
    res.json(wishlist);
  } catch (error) {
    console.error("Error in GET /wishlist:", error);
    next(error);
  }
});

usersRouter.post("/wishlist", async (req, res, next) => {
  try {
    const { adId } = req.body;
    const user = await User.findById(req.user._id);
    const ad = await Ad.findById(adId);

    if (!ad) {
      return res.status(404).json({ error: "Ad not found" });
    }

    if (!user.wishlist.includes(adId)) {
      user.wishlist.push(adId);
      await user.save();
    }

    res.status(201).json({ message: "Ad added to wishlist" });
  } catch (error) {
    next(error);
  }
});

usersRouter.delete("/wishlist/:id", async (req, res, next) => {
  try {
    const adId = req.params.id;
    const user = await User.findById(req.user._id);

    user.wishlist = user.wishlist.filter((id) => id.toString() !== adId);
    await user.save();

    res.status(200).json({ message: "Ad removed from wishlist" });
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/:username", async (request, response, next) => {
  try {
    const username = request.params.username;
    if (!username) {
      return response.status(400).json({ error: "Username is required" });
    }
    const user = await User.findOne({ username });
    response.json(user);
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/", async (request, response, next) => {
  const { username, name, password, email } = request.body;

  if (!username || !password || !email) {
    return response
      .status(400)
      .json({ error: "Username, password, and email are required" });
  }
  if (username.length < 3 || password.length < 8) {
    return response.status(400).json({
      error:
        "Username must be at least 3 characters and password at least 8 characters long",
    });
  }
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    email,
    password: passwordHash,
  });
  try {
    const savedUser = await user.save();
    response.status(201).json(savedUser);
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/:id", async (request, response, next) => {
  try {
    if (request.user._id.toString() !== request.params.id) {
      return response
        .status(403)
        .json({ error: "Not authorized to update this user" });
    }

    const { username, name, email, address, company, phone } = request.body;

    if (username && username !== request.user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return response
          .status(400)
          .json({ error: "Username is already taken" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      request.params.id,
      { username, name, email, address, company, phone },
      { new: true, runValidators: true, context: "query" }
    );

    if (!updatedUser) {
      return response.status(404).json({ error: "User not found" });
    }

    response.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

module.exports = usersRouter;
