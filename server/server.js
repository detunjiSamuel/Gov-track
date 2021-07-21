
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const routes = require("./server/routes");
const http = require("http");
const cors = require("cors");
const {MONGO_URI} =  process.env;

const app = express();

//cors
app.use(cors());
// bodyparser
app.use(express.json({ extended: false }));
console.log(MONGO_URI)
const connectDB = async () => {
  try {
    await mongoose.connect(
      MONGO_URI,
      {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
      }
    );
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

connectDB();

// Server
const server = http.createServer(app);

// Routes
app.use("/", routes);

// Handles any requests that do not match the ones above

const PORT = process.env.PORT || 5000;

server.listen(PORT, (err) => {
  if (!err) {
    console.log("site is live");
  } else {
    console.log(err);
  }
});
