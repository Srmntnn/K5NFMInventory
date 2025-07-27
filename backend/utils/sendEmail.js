const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});;

const sendWelcomeEmail = async (toEmail, name) => {
  await transporter.sendMail({
    from: process.env.SENDER_EMAIL, // Your sender email
    to: toEmail,
    subject: 'Welcome to Inventory System',
    html: `<h2>Hello ${name},</h2><p>Your account has been created successfully!</p>`
  });
};

module.exports = { sendWelcomeEmail };
