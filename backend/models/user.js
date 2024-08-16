const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
      minlength: 3,
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^\S+@\S+\.\S+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address!`,
      },
    },
    password: {
      type: String,
      required: true,
      maxLength: 256,
      minLength: 8,
    },
    address: { type: String, default: "" },
    company: { type: String, default: "" },
    phone: { type: String, default: "" },
    photo: { type: String },
    role: {
      type: [String],
      default: ["Buyer"],
      enum: ["Buyer", "Seller", "Admin"],
    },
    enquiredProperties: [{ type: Schema.Types.ObjectId, ref: "Ad" }],
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Ad" }],
    resetCode: { type: String, default: "" },
    resetCodeExpires: { type: Date },
  },
  { timestamps: true }
);

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.password;
    delete returnedObject.resetCode;
  },
});

module.exports = model("User", userSchema);
