const cors = require("cors");
const cookieParser = require("cookie-parser");

const express = require("express");
const app = express();


app.use(   // use ( Mostly use in Middleware , config 
  cors({
    origin: process.env.CORS_ORIGIN, // update this to your own domain if you want to enable CORS for other domains
    credentials: true,
  })
);

app.use(express.json({ limit: "32kb" })); // to support JSON-encoded bodies
app.use(express.urlencoded({ extended: true, limit: "32kb" })); // to support URL-encoded  [ extended = use obj inside of obj ]
app.use(express.static("public")); // all static files will be served from the public folder or uploaded file go to static
app.use(cookieParser()); // parse Access cookies

// routes

const apiRouter = require("./src/routes/index.routes.js");

app.use("/", apiRouter);

module.exports = app;
