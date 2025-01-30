const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('Missing required email environment variables.');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtp = async (emailOrPhone, otp) => {
  try {
    if (!emailOrPhone.includes('@')) {
      throw new Error('Only email OTPs are supported.');
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emailOrPhone,
      subject: 'Admin Login OTP',
      text: `Your OTP is: ${otp}`,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('OTP email sent:', result.response);
    return result;
  } catch (err) {
    console.error('Error sending OTP:', err.message);
    throw err;
  }
};

module.exports = { sendOtp };
