const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const asyncHandler = require("../utils/asyncHandler.js");

const healthcheck = asyncHandler(async (req, res) => {
  //TODO: build a healthcheck response that simply returns the OK status as json with a message
  try {
    await User.findOne();
    return res.status(200).json(new ApiResponse(200, "Ok"));
  } catch (error) {
    throw new ApiError(500, "Not Ok");
  }
});
