const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingcontroller = require("../controller/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router
  .route("/")
  ./* Index Route */ get(wrapAsync(listingcontroller.index)) /* Create Route */
  .post(
    isLoggedIn,

    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingcontroller.createListing)
  );

// New route
router.get("/new", isLoggedIn, listingcontroller.renderNewForm);

router
  .route("/:id")
  /* show routes */
  .get(wrapAsync(listingcontroller.showListing))
  /* update routes */ .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingcontroller.updatelisting)
  );

// Edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingcontroller.renderEditForm)
);

// Delete Route
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(listingcontroller.deleteListing)
);

module.exports = router;
