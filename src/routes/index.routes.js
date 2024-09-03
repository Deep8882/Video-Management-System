const express = require("express");
const apiRouter = express.Router();

// import all routes
const userRouter = require("./user.routes.js");

apiRouter.use("/user", userRouter);

module.exports = apiRouter;
