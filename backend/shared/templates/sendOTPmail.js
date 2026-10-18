/**
 * Password Reset OTP Email Template for ExpenseWise
 */
const getOtpTemplate = (username, otp) => {
  const currentYear = new Date().getFullYear();
  const displayName = username || "there";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Verification Code - ExpenseWise</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F4F9F6;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1F382C;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-spacing: 0;
    }
    td {
      padding: 0;
    }
    img {
      border: 0;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #F4F9F6;
      padding-top: 40px;
      padding-bottom: 40px;
    }
    .main-table {
      background-color: #FFFFFF;
      margin: 0 auto;
      width: 100%;
      max-width: 580px;
      border-radius: 20px;
      border: 1px solid #E3EDE7;
      overflow: hidden;
      box-shadow: 0 4px 18px rgba(15, 70, 52, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #093728 0%, #0F4634 60%, #155E47 100%);
      padding: 36px 30px;
      text-align: center;
    }
    .logo-badge {
      display: inline-block;
      width: 64px;
      height: 64px;
      background-color: #FFFFFF;
      border-radius: 18px;
      padding: 6px;
      box-sizing: border-box;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
      margin-bottom: 12px;
    }
    .logo-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 12px;
    }
    .app-title {
      color: #FFFFFF;
      font-size: 24px;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .app-subtitle {
      color: #A7E8D0;
      font-size: 13px;
      margin-top: 4px;
      margin-bottom: 0;
      font-weight: 500;
      letter-spacing: 0.3px;
    }
    .content {
      padding: 36px 32px 30px 32px;
    }
    .greeting {
      font-size: 20px;
      font-weight: 700;
      color: #0F4634;
      margin-top: 0;
      margin-bottom: 12px;
    }
    .message-text {
      font-size: 14px;
      line-height: 1.6;
      color: #4A6B5D;
      margin-top: 0;
      margin-bottom: 24px;
    }
    .otp-container {
      background: #F4FAF7;
      border: 1.5px dashed #10B981;
      border-radius: 16px;
      padding: 24px 20px;
      text-align: center;
      margin: 24px 0;
    }
    .otp-label {
      font-size: 11px;
      font-weight: 700;
      color: #0F4634;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      margin-bottom: 8px;
    }
    .otp-code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 36px;
      font-weight: 800;
      color: #0F4634;
      letter-spacing: 10px;
      padding-left: 10px;
      margin: 0;
    }
    .timer-badge {
      display: inline-block;
      margin-top: 10px;
      background-color: #E8F6F0;
      color: #059669;
      font-size: 12px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 20px;
    }
    .security-notice {
      background-color: #FEF9E7;
      border: 1px solid #F9E79F;
      border-radius: 12px;
      padding: 14px 16px;
      margin-top: 24px;
      font-size: 13px;
      line-height: 1.5;
      color: #7D6608;
    }
    .footer {
      background-color: #F8FAF9;
      border-top: 1px solid #EBF2EE;
      padding: 24px 30px;
      text-align: center;
      font-size: 12px;
      color: #8FA89B;
      line-height: 1.5;
    }
    .footer-brand {
      font-weight: 600;
      color: #0F4634;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main-table" align="center" cellpadding="0" cellspacing="0">
      <!-- HEADER -->
      <tr>
        <td class="header">
          <div class="logo-badge">
            <img src="cid:applogo@expensewise" alt="ExpenseWise" class="logo-img">
          </div>
          <h1 class="app-title">ExpenseWise</h1>
          <p class="app-subtitle">Password Reset Verification</p>
        </td>
      </tr>

      <!-- BODY CONTENT -->
      <tr>
        <td class="content">
          <h2 class="greeting">Hello, ${displayName}!</h2>
          <p class="message-text">
            We received a request to reset the password for your <strong>ExpenseWise</strong> account. Please use the 6-digit one-time verification code below to verify your request:
          </p>

          <!-- OTP CODE BOX -->
          <div class="otp-container">
            <div class="otp-label">One-Time Verification Code</div>
            <p class="otp-code">${otp}</p>
            <div class="timer-badge">⏱️ Expires in 10 minutes</div>
          </div>

          <p class="message-text" style="font-size: 13px; margin-bottom: 0;">
            Enter this code in your ExpenseWise app screen to create your new password.
          </p>

          <!-- SECURITY NOTICE -->
          <div class="security-notice">
            <strong>Security Alert:</strong> If you did not request a password reset, please ignore this email. Your password will remain unchanged and your account remains safe.
          </div>
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td class="footer">
          <p style="margin: 0 0 6px 0;">
            Sent securely by <span class="footer-brand">ExpenseWise Security</span>
          </p>
          <p style="margin: 0;">
            &copy; ${currentYear} ExpenseWise. Never share your verification code with anyone.
          </p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `;
};

module.exports = { getOtpTemplate };
