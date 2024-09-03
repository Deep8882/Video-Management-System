const { ApiError } = require("../utils/ApiError .js");
const { asyncHandler } = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");
const User = require("../module/user.model.js");

const verifyToken = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // console.log(token);
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

module.exports = verifyToken;

// const jwt = require("jsonwebtoken");
// const db = require("../models");
// const CONSTANT = require("../common/constant");

// const verifyToken = (req, res, next) => {
//     let token =
//         typeof req.headers["x-access-token"] !== "undefined"
//             ? req.headers["x-access-token"]
//             : req.headers["authorization"];
//     if (token) token = token.includes("Bearer ") === true ? token.replace("Bearer ", "") : token;
//     if (token) token = token.includes("Basic ") === true ? token.replace("Basic ", "") : token;

//     if (!token) return res.status(401).send({
//         status:  401,
//         message: "Unauthorized",
//     });
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
//         if (error)
//             res.status(401).send({
//                 status: 401,
//                 message: "Invalid Access Token",
//             });

//         // Add userId to req obj
//         req.userId = decoded.id;

//         User
//             .findByPk(req.userId)
//             .then((user) => {
//                 console.log("user", user);
//                 console.log(
//                     "==================================||=====AUTHORIZED=====||==========================="
//                 );
//                 // Add user to req obj
//                 req.user = user;
//                 next();
//             })
//             .catch((error) => {
//                 console.error(error);c
//                 res.status(401).send({
//                     status: CONSTANT.FAIL,
//                     message: CONSTANT.UNAUTHORIZED,
//                 });
//             });
//     });
// };

// module.exports = { verifyToken };
