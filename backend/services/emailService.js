const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});


const sendOtpEmail = async (email, otp) => {

  const mailOptions = {

    from: `"StockSense" <${process.env.EMAIL_USER}>`,

    to: email,

    subject: "StockSense Password Reset OTP",

    text: `Your StockSense password reset OTP is ${otp}.

This OTP is valid for 5 minutes.

If you did not request a password reset, please ignore this email.`

  };


  await transporter.sendMail(mailOptions);

};


module.exports = {
  sendOtpEmail
};