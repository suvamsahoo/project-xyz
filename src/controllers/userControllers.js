import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Proj_CheckOtpMail from "../models/Proj_CheckOtpMail_Model.js";
import Proj_User from "../models/Proj_User_Model.js";
import { generateOTP } from "../utils/generateOTP.js";
import { sendMail } from "../utils/sendMail.js";
import { generateToken } from "../utils/generateToken.js";
import { decryptData, encryptData } from "../utils/encryptAndDecryptData.js";

export let getAllUsers = async (req, res) => {
  try {
    const users = await Proj_User.find().select("-password");
    if (users) {
      res.status(200).json(users);
    } else {
      res.status(404).json({ message: "No users found" });
    }
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      controllerPath: "getAllUsers",
      error: err,
    });
  }
};

export let createUserByMail = async (req, res) => {
  try {
    const { name, email, phone, password, userName } = req?.body;
    if (!name || !email || !password || !phone || !userName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const checkOtpUsers = await Proj_CheckOtpMail.find({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });
    if (checkOtpUsers?.length >= 5) {
      return res.status(201).json({
        message:
          "In this email ID, you have sent lot of request so try after some time.",
      });
    }

    const user = await Proj_User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });
    if (user) {
      return res
        .status(401)
        .json({ message: "User is already created in this email ID" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const otp = generateOTP();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let mailBody = {
      emailTo: email,
      subject: `OTP verifications for your account`,
      htmlBody: `<div style="border: 1px solid #ccc; padding: 20px; border-radius: 10px; background-color: #fff; box-shadow: 0px 0px 10px 2px rgba(0,0,0,0.1);">
        <h2 style="font-size: 24px; margin-top: 0;">Hello ${name}!</h2>
        <p style="font-size: 18px; margin-bottom: 30px;">Thank you for choosing project X. Please use the OTP below to complete your sign up procedures and verify your account.</p>
        <div style="display: inline-block; background-color: #007bff; color: #fff; font-size: 18px; font-weight: bold; padding: 10px; border-radius: 5px; box-shadow: 0px 5px 10px rgba(0,0,0,0.2);">
            ${otp}
        </div>
        <p style="font-size: 18px; margin-top: 30px;">Remember, never share this OTP with anyone, not even if project X asks you to.</p>
    </div>`,
    };
    sendMail(mailBody)
      .then(async (result) => {
        if (typeof result === "object") {
          res.status(500).json({
            message: "Not able to send mail, try again after some time",
          });
        } else {
          const newOtpObj = new Proj_CheckOtpMail({
            ...req?.body,
            password: hashedPassword,
            otp,
            mailId: result,
          });
          await newOtpObj.save();
          res.status(200).json({
            message: "Verification email sent",
            mailId: result,
          });
        }
      })
      .catch((error) => {
        throw new Error("Not able to send mail", error);
      });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      controllerPath: "createUserByMail",
      error: err,
    });
  }
};

export let verifyUserByMail = async (req, res) => {
  try {
    const { email, otp } = req?.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ message: "Missing email or otp, required fields" });
    }

    const user = await Proj_User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });
    if (user) {
      return res.status(401).json({
        message: "User is already created in this email ID, do login",
      });
    }

    const otpDoc = await Proj_CheckOtpMail.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
      otp,
    });
    if (!otpDoc) {
      return res.status(400).json({ error: "Invalid OTP" });
    } else {
      const { name, email, phone, password, userName } = otpDoc;
      const newUser = new Proj_User({ name, email, phone, password, userName });
      const savedUser = await newUser.save();
      savedUser
        ? res.status(201).json({ message: "User created successfully" })
        : res.status(400).json({ message: "User not able to created" });
    }
  } catch (err) {
    if (err?.message?.includes("duplicate")) {
      res.status(400).json({ message: "Email address already exists" });
    } else {
      res.status(500).json({
        message: "Server error",
        controllerPath: "signupUser",
        error: err,
      });
    }
  }
};

export let signinUser = async (req, res) => {
  try {
    const { email, password } = req?.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await Proj_User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });
    if (!user) {
      return res
        .status(401)
        .json({ message: "User not found in this email ID" });
    }

    const isMatch = await bcrypt.compare(password, user?.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const payload = {
      name: user?.name,
      userId: user?._id,
      email: user?.email,
      phone: user?.phone,
      isAdmin: user?.isAdmin,
      isSuperAdmin: user?.isSuperAdmin,
    };
    const expiresTime = "1h";
    const token = await generateToken(payload, expiresTime);

    res.status(200).json({
      user: payload,
      token,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      controllerPath: "signinUser",
      error: err,
    });
  }
};

export let getUserById = async (req, res) => {
  try {
    const { userId } = req?.params;
    const user = await Proj_User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user && res.status(200).json(user);
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      controllerPath: "getUserById",
      error: err,
    });
  }
};

export let updateUserById = async (req, res) => {
  const { userId } = req?.params;
  const { name } = req?.body;

  try {
    const user = await Proj_User.findByIdAndUpdate(
      userId,
      { name },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Omit password field from the response
    const updatedUser = user?.toObject();
    delete updatedUser?.password;

    return res.status(200).json(updatedUser);
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      controllerPath: "updateUserById",
      error: err,
    });
  }
};

export let deleteUserById = async (req, res) => {
  try {
    const { userId } = req?.params;
    const deletedUser = await Proj_User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    } else {
      return res.status(200).json({ message: "User deleted successfully" });
    }
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      controllerPath: "deleteUserById",
      error: err,
    });
  }
};

export let forgotPasswordByMail = async (req, res) => {
  try {
    const { email } = req?.body;

    const user = await Proj_User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User with provided email not found" });
    }

    const payload = {
      userId: user?._id,
      email: user?.email,
    };

    const expiresTime = Date.now() + 5 * 60 * 1000; //five Minutes From Now
    const hashedToken = await generateToken(payload, expiresTime);
    if (hashedToken) {
      const { iv, encryptedData } = encryptData(hashedToken);

      user.resetPasswordToken = encryptedData;
      user.resetPasswordIv = iv;
      user.resetPasswordExpires = expiresTime;
      await user.save();

      let mailBody = {
        emailTo: email,
        subject: `Password Reset Request`,
        htmlBody: `<p>You are receiving this email because you (or someone else) has requested a password reset for your account.</p>
        <p>Click on the following link, or paste this into your browser to complete the process:</p>
        <a href="${process.env.FRONTEND_URL}/reset_password-mail/${encryptedData}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none;">Reset Password</a>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`,
      };
      sendMail(mailBody)
        .then((result) => {
          if (typeof result === "object") {
            res.status(500).json({
              message: "Not able to send mail, try again after some time",
            });
          } else {
            res.status(200).json({
              message:
                "Password reset email sent successfully, five Minutes From Now do fast",
              mailId: result,
            });
          }
        })
        .catch((error) => {
          res.status(500).json({ message: "Not able to send mail" });
        });
    } else {
      throw new Error("Failed to generate hashed token");
    }
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
      controllerPath: "forgotPassword",
      error: err,
    });
  }
};

export let resetPasswordByMail = async (req, res) => {
  try {
    const { token } = req?.params;
    const { password, confirmPassword } = req?.body;

    if (password !== confirmPassword) {
      return res
        .status(404)
        .json({ message: "password and confirmPassword are not matched" });
    }

    const user = await Proj_User.findOne({ resetPasswordToken: token });
    if (!user) {
      return res.status(404).json({ message: "Invalid reset token" });
    }

    const now = Date.now();
    if (now > user?.resetPasswordExpires) {
      return res.status(404).json({ message: "Expired reset token" });
    }

    let tokenBody = {
      iv: user?.resetPasswordIv,
      encryptedData: token,
    };
    const decryptedToken = decryptData(tokenBody);

    decryptedToken &&
      jwt.verify(
        decryptedToken,
        process.env.JWT_SECRET,
        async (err, decoded) => {
          if (err) {
            return res.status(404).json({ message: "Error in reset token" });
          } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            user.password = hashedPassword;
            user.resetPasswordToken = null;
            user.resetPasswordIv = null;
            user.resetPasswordExpires = null;
            await user.save();

            res
              .status(200)
              .json({ message: "Password reset successfully", user: decoded });
          }
        }
      );
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
      controllerPath: "resetPassword",
      error: err,
    });
  }
};
