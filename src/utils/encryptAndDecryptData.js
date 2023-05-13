import crypto from "crypto";

const algorithm = process.env.ENC_AND_DEC_ALGO;
const keySize = parseInt(process.env.ENC_AND_DEC_KEY_LENGTH);
const ivSize = parseInt(process.env.ENC_AND_DEC_IV_LENGTH);
const key = crypto.randomBytes(keySize);
const iv = crypto.randomBytes(ivSize);

export let encryptData = (data) => {
  let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString("hex"), encryptedData: encrypted.toString("hex") };
};

export let decryptData = (data) => {
  let iv = Buffer.from(data.iv, "hex");
  let encryptedData = Buffer.from(data.encryptedData, "hex");
  let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedData);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};
