const nodemailer = require('nodemailer');

const sendMail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'lovepreetkang002@gmail.com',
      pass: 'bluw uxqb vuoo wnyi'
    }
  });

  const mailOptions = {
    from: 'lovepreetkang002@gmail.com',
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return { status: true, message: "Email sent" };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Error sending email");
  }
};

module.exports = sendMail;
