const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
require("dotenv").config();

const region = process.env.AWS_REGION;
const sesClient = new SESClient({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Sends an email using Amazon SES.
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - Email body in HTML format
 * @param {string} fromName - Name of the sender
 * @param {string} [text] - Optional plain text version of the email
 * @returns {Promise<object>} - The response from SES
 * @throws {Error} - If there's an error sending the email
 */
async function sendEmail(to, subject, html, fromName, text) {
  if (!to || !subject || !html || !fromName) {
    throw new Error(
      "Missing required parameters: to, subject, html, and fromName are required"
    );
  }

  const params = {
    Destination: {
      ToAddresses: Array.isArray(to) ? to : [to],
    },
    Message: {
      Body: {
        Html: { Data: html },
        ...(text && { Text: { Data: text } }),
      },
      Subject: { Data: subject },
    },
    Source: `${fromName} <${process.env.EMAIL_FROM}>`,
  };

  try {
    const response = await sesClient.send(new SendEmailCommand(params));
    console.log("Email sent successfully. MessageId:", response.MessageId);
    return response;
  } catch (error) {
    console.error("Error sending email:", error);

    if (error.name === "CredentialsProviderError") {
      console.error(
        "Invalid AWS credentials. Please check your environment variables."
      );
    } else if (error.name === "InvalidParameterValue") {
      console.error(
        "Invalid email address or other parameters. Please check your input."
      );
    } else {
      console.error("Unexpected error:", error.message);
    }

    throw error;
  }
}

module.exports = sendEmail;
