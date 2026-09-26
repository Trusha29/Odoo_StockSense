const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const normalizePhone = (phone) => {
  const normalizedPhone = String(phone)
    .trim()
    .replace(/[()\s.-]/g, "")
    .replace(/^00/, "+");

  if (!/^\+[1-9]\d{7,14}$/.test(normalizedPhone)) {
    throw new Error("SMS recipient must include a valid international country code.");
  }

  return normalizedPhone;
};

const sendOtpSms = async (phone, otp) => {

  const message = await client.messages.create({

    body: `Your StockSense password reset OTP is ${otp}. It is valid for 5 minutes.`,

    from: process.env.TWILIO_PHONE_NUMBER,

    to: normalizePhone(phone)

  });


  console.log("SMS sent:", message.sid);

};


module.exports = {
  sendOtpSms
};