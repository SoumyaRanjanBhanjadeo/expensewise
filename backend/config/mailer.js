const nodemailer = require("nodemailer");

// SMTP transporter built from the values stored in the .env file
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // use TLS on port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Sends a welcome email to a newly created Google user
const sendWelcomeEmail = async (email, username) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: "Welcome to ExpenseWise",
    html: `<p>Hi ${username},</p>
      <p>Your ExpenseWise account has been created successfully.</p>
      <p>Start tracking your expenses today!</p>`,
  };

  await transporter.sendMail(mailOptions);
};

// Sends the 6-digit code needed to reset a password
const sendOtpEmail = async (email, username, otp) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: "ExpenseWise password reset OTP",
    html: `<p>Hi ${username},</p>
      <p>Your password reset code is: <strong>${otp}</strong></p>
      <p>This code expires in 10 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendWelcomeEmail, sendOtpEmail };