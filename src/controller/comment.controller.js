import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page, limit } = req.query;

  const pageNum = Number(page);
  const limitNum = Number(limit);

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  if (!pageNum || !limitNum || pageNum === 0) {
    throw new ApiError(400, "Please provide a valid input");
  }

  const getComments = await Comment.aggregate([
    {
      $match: {
        video: mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $skip: (pageNum - 1) * limitNum,
    },
    {
      $limit: limitNum, 
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "totalLikesOnComment",
      },
    },
    {
      $addFields: {
        likedByUser: {
          $in: [req.user?._id, "$totalLikesOnComment.likedByUser"],
        },
      },
    },
    {
      $group: {
        _id: "$_id",
        content: { $first: "$content" },
        video: { $first: "$video" },
        owner: { $first: "$owner" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        totalLikesOnComment: { $sum: { $size: "$totalLikesOnComment" } },
        likedByUser: { $first: "$likedByUser" },
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
        isOwner: {
          $cond: {
            if: { $eq: [req.user?._id, { $arrayElemAt: ["$owner._id", 0] }] },
            then: true,
            else: false,
          },
        },
      },
    },
  ]);

  if (!getComments?.length) {
    throw new ApiError(
      404,
      "No comments found for this video. Or, you may try a lower page number."
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, getComments, "Comments fetched successfully"));
});
                    
const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }
  if (!content || content.trim() === "") {
    throw new ApiError(400, "Content cannot be empty");
  }

  const video = await VideoColorSpace.findByTd(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const comment = await Comment.create({
    content,
    video,
    owner: req.user?._id,
  });

  const postedComment = await Comment.findById(comment._id);

  if (!postedComment) {
    throw new ApiError(500, "Something went wrong while posting a comment");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, postedComment, "Comment posted successfully."));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }
  if (!content || content.trim() === "") {
    throw new ApiError(400, "Content cannot be empty");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment does not exist");
  }

  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You do not have permission to edit this comment.");
  }
  try {
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
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
      .json(
        new ApiResponse(200, comment, "Comment has been updated successfully.")
      );
  } catch (error) {
    throw new ApiError(500, "Unable to update comment");
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "This comment does not exist");
  }

  if (comment.owner.toString() != req.user?._id.toString()) {
    throw new ApiError(400, "You are not the owner of this comment to delete");
  }

  try {
    await Comment.findByIdAndDelete(commentId);
    // Delete likes of deleted comment
    await Like.deleteMany({ comment: comment._id });

    return res
      .status(200)
      .json(new ApiResponse(200, "comment deleted successfully"));
  } catch (error) {
    throw new ApiError(500, "Unable to delete comment");
  }
});

export { getVideoComments, addComment, updateComment, deleteComment };
