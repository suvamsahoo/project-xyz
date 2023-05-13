import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { connectDB } from "./src/config/db.js";
let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// DB Connection:-
connectDB(process.env.DB_URI);

// Root route:-
app.get("/", (req, res) => {
  res.send("Hello 14-05-2023");
});

// Add error handling middleware to handle errors that may occur during request processing:-
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
