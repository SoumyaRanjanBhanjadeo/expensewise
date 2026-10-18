/**
 * Welcome Email Template for ExpenseWise
 */
const getWelcomeTemplate = (username) => {
  const currentYear = new Date().getFullYear();
  const displayName = username || "there";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ExpenseWise</title>
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
    .feature-card {
      background-color: #F8FAF9;
      border: 1px solid #E6EFEA;
      border-radius: 14px;
      padding: 16px 18px;
      margin-bottom: 12px;
    }
    .feature-title {
      font-size: 14px;
      font-weight: 700;
      color: #0F4634;
      margin: 0 0 4px 0;
    }
    .feature-desc {
      font-size: 13px;
      color: #52796F;
      margin: 0;
      line-height: 1.45;
    }
    .cta-container {
      margin-top: 28px;
      text-align: center;
    }
    .cta-banner {
      display: inline-block;
      background: linear-gradient(135deg, #0F4634 0%, #155E47 100%);
      color: #FFFFFF;
      padding: 12px 28px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      letter-spacing: 0.3px;
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
          <p class="app-subtitle">Master Your Money with Ease</p>
        </td>
      </tr>

      <!-- BODY CONTENT -->
      <tr>
        <td class="content">
          <h2 class="greeting">Welcome aboard, ${displayName}!</h2>
          <p class="message-text">
            We are excited to have you join <strong>ExpenseWise</strong>. Your account has been set up and you're ready to take full control of your personal finances.
          </p>

          <!-- FEATURES -->
          <div class="feature-card">
            <div class="feature-title">📊 Track Every Penny</div>
            <p class="feature-desc">Log your daily incomes and expenses in seconds with categorized breakdowns.</p>
          </div>

          <div class="feature-card">
            <div class="feature-title">🎯 Set Smart Budgets</div>
            <p class="feature-desc">Create personalized spending caps to curb unnecessary expenses and save more.</p>
          </div>

          <div class="feature-card">
            <div class="feature-title">📈 Visual Analytics</div>
            <p class="feature-desc">Gain instant clarity into your financial habits through dynamic charts and monthly insights.</p>
          </div>

          <div class="cta-container">
            <div class="cta-banner">
              Ready to Explore? Open ExpenseWise
            </div>
          </div>
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td class="footer">
          <p style="margin: 0 0 6px 0;">
            Sent with care by <span class="footer-brand">ExpenseWise</span>
          </p>
          <p style="margin: 0;">
            &copy; ${currentYear} ExpenseWise. All rights reserved.
          </p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `;
};

module.exports = { getWelcomeTemplate };
