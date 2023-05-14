import nodemailer from "nodemailer";

export const sendMail = async (mailBody) => {
  try {
    // Create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.NODEMAILER_EMAIL_USERNAME,
        pass: process.env.NODEMAILER_EMAIL_PASSWORD,
      },
    });

    // Send email with password reset link to the user's email address
    const mailOptions = {
      from: process.env.NODEMAILER_EMAIL_USERNAME,
      to: mailBody?.emailTo,
      subject: mailBody?.subject,
      html: mailBody?.htmlBody,
    };

    const info = await transporter?.sendMail(mailOptions);
    return info.messageId;
  } catch (error) {
    return error;
  }
};
