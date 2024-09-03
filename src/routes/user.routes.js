const express = require("express");
const userRouter = express.Router();

const userController = require("../controller/user.controller");

const verifyJWT = require("../middleware/auth.middleware");
const { upload } = require("../middleware/multer.middleware");

userRouter.post(
  "/registerUser",
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  userController.registerUser
);

userRouter.post("/login", userController.loginUser);
userRouter.post("/logout", verifyJWT, userController.logoutUser);
userRouter.post("/refresh-token", userController.refreshAccessToken);
userRouter.post(
  "/change-password",
  verifyJWT,
  userController.changeCurrentPassword
);
userRouter.get("/current-user", verifyJWT, userController.getCurrentUser);
userRouter.patch(
  "/update-account",
  verifyJWT,
  userController.updateAccountDetails
);
userRouter.patch(
  "/avatar",
  upload.single("avatar"),
  verifyJWT,
  userController.updateUserAvatar
);
userRouter.patch(
  "/cover-image",
  upload.single("coverImage"),
  verifyJWT,
  userController.updateUserCoverImage
);
userRouter.get(
  "/channel/:username",
  verifyJWT,
  userController.getUserChannelProfile
);
userRouter.get("/history", verifyJWT, userController.getWatchHistory);

module.exports = userRouter;
