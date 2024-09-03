const mongoose = require("mongoose");
const Like = require("../models/like.model.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const asyncHandler = require("../utils/asyncHandler.js");

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video ID!");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found!");
  }

  const loggedInUser = req.user?._id;

  const videoIsLiked = await Like.findByIdAndDelete({
    likedBy: loggedInUser,
    video: video,
  });

  if (videoIsLiked) {
    return res
      .status(200)
      .json(new ApiResponse(200, "Unliked the video successfully!"));
  }

  if (!videoIsLiked) {
    const videoLike = await Like.create({
      likedBy: loggedInUser,
      video,
    });

    const createdLikedVideo = await Like.findById(videoLike._id);

    if (!createdLikedVideo) {
      throw new ApiError(500, "Something went wrong while liking this video");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, createdLikedVideo, "video Liked successfully")
      );
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid Comment ID provided!");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "No such comment exists");
  }
  const loggedInUser = req.user?._id;

  const commentIsLiked = await Like.findByIdAndDelete({
    likedBy: loggedInUser,
    comment: comment,
  });

  if (commentIsLiked) {
    return res
      .status(200)
      .json(new ApiResponse(200, "Unliked the comment successfully!"));
  }

  if (!commentIsLiked) {
    const commentLike = await Like.create({
      likedBy: loggedInUser,
      comment,
    });

    const createdLikedVideo = await Like.findById(commentLike._id);

    if (!createdLikedVideo) {
      throw new ApiError(500, "Something went wrong while liking this comment");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, createdLikedVideo, "comment Liked successfully")
      );
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "This Tweet does not exist");
  }

  const loggedInUser = req.user?._id;
  const tweetIsLiked = await Like.findOneAndDelete({
    likedBy: loggedInUser,
    tweet: tweet,
  });

  if (tweetIsLiked) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, "Your like has been removed, from this tweet")
      );
  }

  if (!tweetIsLiked) {
    const tweetLike = await Like.create({
      likedBy: loggedInUser,
      tweet,
    });

    const createdLikedTweet = await Like.findById(tweetLike._id);

    if (!createdLikedTweet) {
      throw new ApiError(500, "Something went wrong while liking this tweet");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, createdLikedTweet, "Tweet Liked successfully")
      );
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const userId = req.user?._id;

  const getLikedVideos = await Like.aggregate([
    {
      $match: {         // check 
        video: { $exists: true },
        likedBy: mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        video: {
          $first: "$video",
        },
      },
    },
  ]);

  if (!getLikedVideos?.length) {
    throw new ApiError(404, "You haven't liked any videos yet");
  }

  return res
    .status(200)
    .json(200, getLikedVideos, "Liked videos fetched successfully");
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
