const express = require('express');

const blackMarketRouter = express.Router();
// import models
const {
  User,
  Art,
  Vault,
  BlackMarketArt,
} = require('../db/index');

// POST- a new Black Market listing should be posted whenever art is sold to the Black Market
blackMarketRouter.post('/sell/:_id', (req, res) => {
  const { _id } = req.params;
  const userId = req.user.doc._id;

  Vault.findOneAndUpdate({ owner: userId }, { $pull: { artGallery: _id } })
    .then(() => Art.findByIdAndUpdate(_id, { userGallery: { name: null, googleId: null } }))
    .then(() => BlackMarketArt.create({ artwork: _id, status: 'active', price: 5000 }))
    .then((newListing) => {
      User.findByIdAndUpdate(userId, { $inc: { wallet: 50 } })
        .then(() => res.status(201).send(newListing));
    })
    .catch((err) => {
      console.error('Failed to sell to Black Market', err);
      res.sendStatus(500);
    });
});

// GET route that allows for the black market listings to be viewed
blackMarketRouter.get('/', (req, res) => {
  BlackMarketArt.aggregate([
    // $match: filters the documents to only include those 'active'
    { $match: { status: 'active' } },
    // $sample: randomly picks a specific number of documents (3, in this case)
    { $sample: { size: 3 } },
    {
      // $lookup: performs a "join" with arts collection. finds full art details
      $lookup: {
        from: 'arts',
        localField: 'artwork',
        foreignField: '_id',
        as: 'artworkDetails',
      },
    },
    // $unwind: flattens that array into a single object
    { $unwind: '$artworkDetails' },
  ])
    .then((listings) => res.status(200).send(listings))
    .catch((err) => {
      console.error('Failed to retrieve Black Market Art listings', err);
      res.sendStatus(500);
    });
});

// PATCH route that updates a user's voucher number when they use or obtain a voucher
blackMarketRouter.patch('/voucher', (req, res) => {
  const userId = req.user.doc._id;

  User.findById(userId)
    .then((user) => {
      if (user.vouchers < 1) return res.sendStatus(400);

      return User.findByIdAndUpdate(userId, { $inc: { vouchers: -1, wallet: 1000 } }, { new: true })
        .then((updatedUser) => res.status(200).send(updatedUser));
    })
    .catch((err) => {
      console.error('Failed to redeem voucher', err);
      res.sendStatus(500);
    });
});

// PATCH route that allows a user to haggle
// after each haggle the price will increase or decrease depending on success or fail
blackMarketRouter.patch('/haggle', (req, res) => {
  const { listingIds } = req.body;

  if (!listingIds || !listingIds.length) {
    return res.sendStatus(400);
  }

  // 50/50 chance for success or failure
  const isSuccess = Math.random() >= 0.5;
  // on success = 75% of cost, -25% discount
  // on fail = 125% of cost, +25% increase
  const multiplier = isSuccess ? 0.75 : 1.25;

  return BlackMarketArt.find({ _id: { $in: listingIds } })
    .then((listings) => {
      const updatePromises = listings.map((listing) => {
        // use default 5000 if price isn't set yet
        const currentPrice = listing.price || 5000;
        let newPrice = Math.floor(currentPrice * multiplier);
        // lowest discount can go is to $10
        if (newPrice < 10) newPrice = 10;

        return BlackMarketArt.findByIdAndUpdate(
          listing._id,
          { price: newPrice },
          { new: true },
        ).populate('artwork');
      });

      return Promise.all(updatePromises);
    })
    .then((updatedListings) => {
      res.status(200).send({
        success: isSuccess,
        listings: updatedListings,
      });
    })
    .catch((err) => {
      console.error('Failed to haggle batch', err);
      res.sendStatus(500);
    });
});

// DELETE: Purchase an artwork and remove it from the Black Market
blackMarketRouter.delete('/buy/:_id', (req, res) => {
  const { _id } = req.params;
  const userId = req.user.doc._id;
  const { name, googleId } = req.user.doc;

  BlackMarketArt.findById(_id)
    .then((listing) => {
      if (!listing) return res.sendStatus(404);

      return User.findById(userId).then((user) => {
        if (user.wallet < listing.price) return res.sendStatus(400);

        return User.findByIdAndUpdate(userId, { $inc: { wallet: -listing.price } })
          .then(() => Vault.findOneAndUpdate(
            { owner: userId },
            { $push: { artGallery: listing.artwork } },
          ))
          .then(() => Art.findByIdAndUpdate(listing.artwork, { userGallery: { name, googleId } }))
          .then(() => BlackMarketArt.findByIdAndDelete(_id))
          .then(() => res.sendStatus(200));
      });
    })
    .catch((err) => {
      console.error('Failed to purchase art', err);
      res.sendStatus(500);
    });
});

module.exports = blackMarketRouter;
