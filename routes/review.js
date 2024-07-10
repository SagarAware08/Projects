const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
// const ExpressErrors = require("../utils/expressErrors.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const {
  validatereview,
  isLoggedIn,
  isReviewAuthor,
} = require("../middleware.js");
const { createReview, deleteReview } = require("../controller/reviews.js");

const reviewController = require("../controller/reviews");

// Reviews Post Route

router.post(
  "/",
  isLoggedIn,
  validatereview,
  wrapAsync(reviewController.createReview)
);

// delete Route
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewController.deleteReview)
);

module.exports = router;
