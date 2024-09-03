const mongoose = require("mongoose");
const Tweet = require("../models/tweet.model.js");
const User = require("../models/user.model.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const asyncHandler = require("../utils/asyncHandler.js");

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;

  if (!content || content.trim() == "") {
    throw new ApiError(400, "Content can't be empty");
  }
  //   const user = await User.findOne({
  //     refreshToken: req.cookies.refreshToken,
  //   });

  const tweet = await Tweet.Create({
    content,
    owner: req.User?._id,
  });

  const createdTweet = await Tweet.findById(tweet._id);

  if (!createdTweet) {
    throw new ApiError(500, "Something went wrong while creating the tweet");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        createdTweet,
        "Your tweet has been posted successfully"
      )
    );
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(401, "Invalid request");
  }

  const tweet = await Tweet.aggregate([
    {
      $match: {
        owner: mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "tweet",
        as: "tweetLikedBy",
      },
    },
    {
      $group: {
        _id: "$_id",
        owner: { $first: "$owner" },
        content: { $first: "$content" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        likesCount: { $sum: { $size: "$tweetLikedBy" } },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  if (!tweet) {
    throw new ApiError(404, "No tweet found");
  }
  const tweetedBy = await User.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(userId),
      },
    },
    {
      $addFields: {
        isTweetOwner: {
          $cond: {
            if: { $eq: [req.user?._id.toString(), userId] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        username: 1,
        fullName: 1,
        avatar: 1,
        createdAt: 1,
        updatedAt: 1,
        isTweetOwner: 1,
      },
    },
  ]);

  const tweetAndDetails = {
    tweet,
    tweetedBy,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, tweetAndDetails, "tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Content can't be empty");
  }
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid Tweet ID");
  }

  const tweetOwner = await Tweet.findById(tweetId);

  if (!tweetOwner) {
    throw new ApiError(404, "Tweet id does not exist");
  }

  if (tweetOwner.owner.toString() != req.user?._id.toString()) {
    throw new ApiError(400, "You are not the owner of this tweet to edit");
  }

  const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content: content,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid Tweet ID");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "No Tweet with that ID found");
  }

  if (tweet.owner.toString() != req.user?._id.toString()) {
    throw new ApiError(400, "You are not the owner of this tweet to delete");
  }
  try {
    await Tweet.findByIdAndDelete(tweetId);
    await Like.deleteMany({ tweet: tweet._id });
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Tweet Deleted Successfully"));
  } catch (error) {
    throw new ApiError(500, "Unable to delete tweet");
  }
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };

Subscription;
Tweet;
User;
Video;
Dashboard;
