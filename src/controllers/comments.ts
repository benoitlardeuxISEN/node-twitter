//@ts-check
const utils = require("../../lib/utils");
import mongoose from "mongoose";
const Activity = mongoose.model("Activity");
const logger = require("../middlewares/logger");

import {Request, Response} from "express";

exports.load = (req: Request, res: Response, next, id) => {
  const tweet = req.tweet;
  utils.findByParam(tweet.comments, { id: id }, (err, comment) => {
    if (err) {
      return next(err);
    }
    req.comment = comment;
    next();
  });
};

// ### Create Comment
exports.create = (req: Request, res: Response) => {
  const tweet = req.tweet;
  const user = req.user;

  if (!req.body.body) {
    return res.redirect("/");
  }
  tweet.addComment(user, req.body, err => {
    if (err) {
      logger.error(err);
      return res.render("pages/500");
    }
    const activity = new Activity({
      activityStream: "added a comment",
      activityKey: tweet.id,
      sender: user,
      receiver: req.tweet.user
    });
    logger.info(activity);
    activity.save(err => {
      if (err) {
        logger.error(err);
        return res.render("pages/500");
      }
    });
    res.redirect("/");
  });
};

// ### Delete Comment
exports.destroy = (req: Request, res: Response) => {
  // delete a comment here.
  const comment = req.comment;
  comment.remove(err => {
    if (err) {
      res.send(400);
    }
    res.send(200);
  });
};