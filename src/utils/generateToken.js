import jwt from "jsonwebtoken";

export let generateToken = async (payload, expiresTime) => {
  try {
    const token = await jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: expiresTime,
    });
    return token;
  } catch (error) {
    throw error;
  }
};
