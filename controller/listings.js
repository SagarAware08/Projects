const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geoCodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  let allListings = await Listing.find().populate("reviews");
  res.render("./listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("./listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exists");
    res.redirect("/listings");
  }
  res.render("./listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  let response = await geoCodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  console.log(newListing);
  newListing.owner = req.user._id;
  newListing.image = {
    url,
    filename,
  };

  newListing.geometry = response.body.features[0].geometry;

  let savedListing = await newListing.save();
  console.log(savedListing);
  req.flash("success", "New Listing Created");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exists");
    res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
  res.render("./listings/edit.ejs", { listing, originalImageUrl });
};

// module.exports.updatelisting = async (req, res) => {
//   console.log(req.params);
//   let { id } = req.params;
//   let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

//   if (typeof req.file !== "undefined") {
//     let url = req.file.path;
//     let filename = req.file.filename;
//     listing.image = { url, filename };
//     await listing.save();
//   }

//   req.flash("success", "Listing updated");
//   res.redirect(`/listings/${id}`);
// };

module.exports.updatelisting = async (req, res, next) => {
  const id = req.params.id;

  // Update the listing with the new data
  let temp = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true }
  );

  // Update the image if a new one is provided
  if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;
    temp.image = { url, filename };
  }

  // Geocode the new location to get the coordinates
  if (req.body.listing.location) {
    let response = await geoCodingClient
      .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
      .send();

    if (response.body.features.length > 0) {
      temp.geometry = response.body.features[0].geometry;
    }
  }
  console.log(temp);
  // Save the updated listing
  await temp.save();

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted");
  res.redirect(`/listings`);
  // console.log(deletedListing);
};
