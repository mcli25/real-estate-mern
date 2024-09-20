const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const mongoosePaginate = require("mongoose-paginate-v2");

const adSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["sell", "rent"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    builtyear: {
      type: Number,
      min: 1800,
      max: new Date().getFullYear(),
    },
    category: {
      type: String,
      enum: [
        "terrace",
        "detached",
        "semi-detached",
        "bungalow",
        "apartment",
        "other",
      ],
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    bedrooms: {
      type: Number,
      min: 0,
    },
    bathrooms: {
      type: Number,
      min: 0,
    },
    landSize: String,
    carpark: {
      type: Number,
      min: 0,
    },
    images: [String],
    rentPeriod: {
      type: String,
      enum: ["month"],
      required: function () {
        return this.type === "rent";
      },
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Create a 2dsphere index on the location field to improve performance
adSchema.index({ location: "2dsphere" });

adSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

adSchema.pre("save", function (next) {
  if (!this.location) {
    return next(new Error("Location is required"));
  }
  if (!this.location.type || this.location.type !== "Point") {
    return next(new Error('Location type must be "Point"'));
  }
  if (
    !Array.isArray(this.location.coordinates) ||
    this.location.coordinates.length !== 2
  ) {
    return next(new Error("Coordinates must be an array of two numbers"));
  }
  const [longitude, latitude] = this.location.coordinates;
  if (typeof longitude !== "number" || typeof latitude !== "number") {
    return next(new Error("Coordinates must be numbers"));
  }
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return next(new Error("Coordinates out of valid range"));
  }
  next();
});

adSchema.plugin(mongoosePaginate);
module.exports = model("Ad", adSchema);
