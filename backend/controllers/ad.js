const express = require("express");
const multer = require("multer");
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");
const Ad = require("../models/ad");
const adRouter = express.Router();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const upload = multer({ storage: multer.memoryStorage() });

const uploadToS3 = async (file) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `ads/${uuidv4()}-${file.originalname}`,
    Body: file.buffer,
    ACL: "public-read",
    ContentType: file.mimetype,
  };

  try {
    const command = new PutObjectCommand(params);
    const data = await s3Client.send(command);
    return `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
  } catch (err) {
    console.error("Error uploading to S3:", err);
    throw err;
  }
};

const deleteFromS3 = async (key) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  };

  try {
    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
  } catch (err) {
    console.error("Error deleting from S3:", err);
    throw err;
  }
};

adRouter.post(
  "/upload-image",
  upload.array("images", 5),
  async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const uploadPromises = req.files.map((file) => uploadToS3(file));
      const uploadedUrls = await Promise.all(uploadPromises);

      res.json({ urls: uploadedUrls });
    } catch (error) {
      console.error("Error uploading images:", error);
      next(error);
    }
  }
);

adRouter.delete("/remove-image", async (req, res, next) => {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({ message: "Image key is required" });
    }

    const s3Key = key.startsWith("http")
      ? key.split("/").slice(-2).join("/")
      : key;

    await deleteFromS3(s3Key);

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    if (error.name === "NoSuchKey") {
      return res.status(404).json({ message: "Image not found" });
    }
    next(error);
  }
});

adRouter.post("/add-ad", async (req, res, next) => {
  try {
    const {
      type,
      title,
      description,
      builtyear,
      category,
      address,
      price,
      bedrooms,
      bathrooms,
      landSize,
      carpark,
      images,
      rentPeriod,
      location,
    } = req.body;

    if (!location || !location.type || !location.coordinates) {
      return res.status(400).json({ error: "Invalid location data" });
    }

    const [longitude, latitude] = location.coordinates;
    if (isNaN(latitude) || isNaN(longitude)) {
      return res
        .status(400)
        .json({ error: "Coordinates must be valid numbers" });
    }

    const newAd = new Ad({
      type,
      title,
      description,
      builtyear,
      category,
      address,
      price,
      bedrooms,
      bathrooms,
      landSize,
      carpark,
      images,
      rentPeriod: type === "rent" ? rentPeriod : undefined,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      user: req.user._id,
      viewCount: 0,
    });

    const savedAd = await newAd.save();

    res.status(201).json(savedAd);
  } catch (error) {
    next(error);
  }
});

adRouter.delete("/:id", async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const adId = req.params.id;
    const ad = await Ad.findById(adId);

    if (!ad) {
      return res.status(404).json({ error: "Ad not found" });
    }

    if (ad.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "You can only delete your own ads" });
    }

    if (ad.images && ad.images.length > 0) {
      for (const imageUrl of ad.images) {
        try {
          const key = imageUrl.split(
            `${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`
          )[1];
          if (key) {
            await deleteFromS3(key);
            console.log(`Successfully deleted image: ${key}`);
          } else {
            console.error(`Failed to extract key from URL: ${imageUrl}`);
          }
        } catch (error) {
          console.error(`Error deleting image from S3: ${imageUrl}`, error);
        }
      }
    }

    await Ad.findByIdAndDelete(adId);

    res.status(200).json({ message: "Ad deleted successfully" });
  } catch (error) {
    console.error("Error deleting ad:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid ad ID" });
    }
    next(error);
  }
});
adRouter.put("/:id", async (req, res, next) => {
  try {
    const ad = await Ad.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({ error: "Ad not found" });
    }

    if (ad.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You can only edit your own ads" });
    }

    const {
      type,
      title,
      description,
      builtyear,
      category,
      address,
      price,
      bedrooms,
      bathrooms,
      landSize,
      carpark,
      images,
      rentPeriod,
      location,
    } = req.body;

    if (location) {
      if (!location.type || !location.coordinates) {
        return res.status(400).json({ error: "Invalid location data" });
      }

      const [longitude, latitude] = location.coordinates;
      if (isNaN(latitude) || isNaN(longitude)) {
        return res
          .status(400)
          .json({ error: "Coordinates must be valid numbers" });
      }
    }

    const updateData = {
      type,
      title,
      description,
      builtyear,
      category,
      address,
      price,
      bedrooms,
      bathrooms,
      landSize,
      carpark,
      images,
      rentPeriod: type === "rent" ? rentPeriod : undefined,
      location: location
        ? {
            type: "Point",
            coordinates: [location.coordinates[0], location.coordinates[1]],
          }
        : ad.location, // Keep the existing location if not provided
    };

    const updatedAd = await Ad.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
      context: "query",
    }).populate("user", { username: 1, name: 1 });

    res.json(updatedAd);
  } catch (error) {
    console.error("Error updating ad:", error);
    next(error);
  }
});

adRouter.get("/user", async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    let query = { user: req.user._id };
    if (req.query.type && ["rent", "sell"].includes(req.query.type)) {
      query.type = req.query.type;
    }

    const ads = await Ad.find(query).sort({ createdAt: -1 });
    console.log("Found ads:", ads.length);
    res.json(ads);
  } catch (error) {
    console.error("Error in /user route:", error);
    next(error);
  }
});

adRouter.get("/", async (request, response, next) => {
  try {
    const { type, page = 1, limit = 9 } = request.query;
    let query = {};

    if (type === "rent" || type === "sell") {
      query.type = type;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: { path: "user", select: "username name" },
      sort: { createdAt: -1 },
    };

    const result = await Ad.paginate(query, options);

    response.json({
      ads: result.docs,
      currentPage: result.page,
      totalPages: result.totalPages,
      totalAds: result.totalDocs,
    });
  } catch (error) {
    next(error);
  }
});

adRouter.get("/:id", async (request, response, next) => {
  try {
    const shouldIncrementView = request.headers["x-increment-view"] === "true";

    let ad;
    if (shouldIncrementView) {
      ad = await Ad.findByIdAndUpdate(
        request.params.id,
        { $inc: { viewCount: 1 } },
        { new: true, runValidators: true }
      ).populate("user", {
        username: 1,
        name: 1,
      });
    } else {
      ad = await Ad.findById(request.params.id).populate("user", {
        username: 1,
        name: 1,
      });
    }

    if (ad) {
      response.json(ad);
    } else {
      response.status(404).json({ error: "Ad not found" });
    }
  } catch (error) {
    console.error("Error fetching ad:", error);
    next(error);
  }
});

module.exports = adRouter;
