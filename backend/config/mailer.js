require("dotenv").config();
const path = require("path");
const nodemailer = require("nodemailer");
const { getWelcomeTemplate } = require("../shared/templates/welcome");
const { getOtpTemplate } = require("../shared/templates/sendOTPmail");
const {
  getResetPasswordTemplate,
} = require("../shared/templates/resetPassword");

// Application logo embedded inline via Content-ID (CID)
const LOGO_ATTACHMENT = {
  filename: "expenseicon.png",
  path: path.join(__dirname, "../assets/expenseicon.png"),
  cid: "applogo@expensewise",
};

// Creates SMTP transporter using environment variables
const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: false, // TLS on port 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Sends a welcome email with ExpenseWise logo and modern template
const sendWelcomeEmail = async (email, username) => {
  const transporter = getTransporter();
  const mailOptions = {
    from: `"ExpenseWise" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Welcome to ExpenseWise - Master Your Money",
    html: getWelcomeTemplate(username),
    attachments: [LOGO_ATTACHMENT],
  };

  await transporter.sendMail(mailOptions);
};

// Sends the 6-digit code needed to reset a password with custom OTP template
const sendOtpEmail = async (email, username, otp) => {
  const transporter = getTransporter();
  const mailOptions = {
    from: `"ExpenseWise Security" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `${otp} is your ExpenseWise verification code`,
    html: getOtpTemplate(username, otp),
    attachments: [LOGO_ATTACHMENT],
  };

  await transporter.sendMail(mailOptions);
};

// Sends confirmation email notifying that the password was reset
const sendResetPasswordEmail = async (email, username) => {
  const transporter = getTransporter();
  const mailOptions = {
    from: `"ExpenseWise Security" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Your ExpenseWise password was successfully reset",
    html: getResetPasswordTemplate(username),
    attachments: [LOGO_ATTACHMENT],
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendWelcomeEmail, sendOtpEmail, sendResetPasswordEmail };