const mongoose = require("mongoose");
const User = require("../models/user.model.js");
const Subscription = require("../models/subscription.model.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const asyncHandler = require("../utils/asyncHandler.js");

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel id");
  }

  const channel = await User.findById(channelId);

  if (!channel) {
    throw new ApiError(404, "This channel does not exist");
  }

  const loggedInUser = req.user?._id;
  const userSubscribed = await Subscription.findOneAndDelete({
    subscriber: loggedInUser,
    channel: channel,
  });

  if (userSubscribed) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, "You have been unsubscribed from this channel")
      );
  }

  if (!userSubscribed) {
    const subscription = await Subscription.create({
      subscriber: loggedInUser,
      channel,
    });

    const createdSubscription = await Subscription.findById(subscription._id);

    if (!createdSubscription) {
      throw new ApiError(
        500,
        "something went wrong while subscribing to this channel"
      );
    }

    return res
      .status(201)
      .json(
        new ApiResponse(
          200,
          createdSubscription,
          "channel subscribed successfully"
        )
      );
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel ID");
  }

  if (req.user?._id.toString() != channelId) {
    throw new ApiError(
      400,
      "You are not the owner of this channel to get subscribers list"
    );
  }
  const getSubscribers = await Subscription.aggregate([
    {
      $match: {
        channel: mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $facet: {
        subscribers: [
          {
            $lookup: {
              from: "users",
              localField: "subscriber",
              foreignField: "_id",
              as: "subscriber",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                    createdAt: 1,
                    updatedAt: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              subscriber: {
                $first: "$subscriber",
              },
            },
          },
        ],
        subscribersCount: [{ $count: "subscribers" }],
      },
    },
  ]);

  if (!getSubscribers) {
    throw new ApiError(400, "Can't get the list of subscribers");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        getSubscribers[0],
        "Get List Of Subscribers Successfully"
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber  ID");
  }

  const getSubscribedChannels = await Subscription.aggregate([
    {
      $match: {
        channel: mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $facet: {
        channelsSubscribedTo: [
          {
            $lookup: {
              from: "users",
              localField: "channel",
              foreignField: "_id",
              as: "channel",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                    createdAt: 1,
                    updatedAt: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              channel: {
                $first: "$channel",
              },
            },
          },
        ],
        channelsSubscribedToCount: [{ $count: "channel" }],
      },
    },
  ]);

  if (!getSubscribedChannels) {
    throw new ApiError(400, "Can't get the list of channels");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        getSubscribedChannels,
        "Channel subscribed by the user fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
