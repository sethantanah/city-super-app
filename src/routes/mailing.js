
import express from 'express';
import nodemailer from "nodemailer";
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Route to handle form submission and send email
router.post("/send-email", (req, res) => {
  const { name, email, message } = req.body;

  // Create a transporter object
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // or 'STARTTLS'
    auth: {
      user: process.env.FROM_EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  // Message object
  let mailOptions = {
    from: process.env.FROM_EMAIL,
    to: process.env.TO_EMAIL,
    subject: `Message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
    res.status(200).send({status: "success", message: "Email sent successfully!"});
  });
});

export default router;