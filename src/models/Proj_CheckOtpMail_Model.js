import mongoose from "mongoose";

const Proj_CheckOtpMail_ModelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
    },
    phone: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    mailId: {
      type: String,
    },

    // After 5 minutes this data will automatically deleted
    createdAt: {
      type: Date,
      default: Date.now,
      index: { expires: 300 },
    },
  },
  {
    timestamps: true,
  }
);

const Proj_CheckOtpMail = mongoose.model(
  "Proj_CheckOtpMail",
  Proj_CheckOtpMail_ModelSchema
);

export default Proj_CheckOtpMail;
