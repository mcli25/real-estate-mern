const express = require("express");
const emailRouter = require("express").Router();
const Ad = require("../models/ad");
const User = require("../models/user"); // Assuming you have a User model
const sendEmail = require("../utils/sendEmail");

emailRouter.post("/", async (req, res, next) => {
  const { adId, name, phone, message } = req.body;
  const email = req.user.email;

  if (!adId || !name || !phone || !message) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const ad = await Ad.findById(adId).populate("user", "email");
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    if (!ad.user || !ad.user.email) {
      return res.status(404).json({ message: "Seller email not found" });
    }

    const subject = `New inquiry about your ad: ${ad.title}`;
    const htmlContent = `
      <h2>New message about your ad (ID: ${adId})</h2>
      <p><strong>From:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <h3>Message:</h3>
      <p>${message}</p>
    `;
    const textContent = `
      New message about your ad (ID: ${adId}):

      From: ${name}
      Email: ${email}
      Phone: ${phone}

      Message: ${message}
    `;

    await sendEmail(
      ad.user.email,
      subject,
      htmlContent,
      "Property Listing Service",
      textContent
    );

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error in /send-email route:", error);
    res
      .status(500)
      .json({ message: "Failed to send email", error: error.message });
  }
});

module.exports = emailRouter;
