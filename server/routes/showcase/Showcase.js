const express = require('express');
const mongoose = require('mongoose');

const showcaseRouter = express.Router();

const { Showcase } = require('../../db/index');

// READ: all showcases, for the homepage/browse list (title, curator, dates)
showcaseRouter.get('/get', (req, res) => {
  Showcase.find({})
    .then((showcases) => {
      res.status(200).send(showcases);
    })
    .catch((err) => {
      console.error('Showcase find all: Failed ', err);
      res.sendStatus(500);
    });
});

// READ: single showcase detail, art pieces populated for the slideshow view
showcaseRouter.get('/get/:id', (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: 'bad id' });
    return;
  }
  Showcase.fingById(id)
    .populate('artPieces')
    .then((showcase) => {
      if (showcase) {
        res.status(200).send(showcase);
      } else {
        res.sendStatus(404);
      }
    })
    .catch((err) => {
      console.error('Showcase find by id: Failed ', err);
      res.sendStatus(500);
    });
});

// READ: showcases belonging to the logged-in user, for their setup/edit list
showcaseRouter.get('/mine', (req, res) => {
  const { _id } = req.user.doc;
  Showcase.find({ curator: _id })
    .then((showcases) => {
      res.status(200).send(showcases);
    })
    .catch((err) => {
      console.error('Showcase find mine: Failed ', err);
      res.sendStatus(500);
    });
});

// CREATE: new showcase draft
showcaseRouter.post('/create', (req, res) => {
  const { _id, name } = req.user.doc;
  const {
    title,
    message,
    musicUrl,
    artPieces,
    startDate,
    endDate,
    auctionDate,
  } = req.body;

  Showcase.create({
    curator: _id,
    curatorName: name,
    title,
    message,
    musicUrl,
    artPieces,
    startDate,
    endDate,
    auctionDate,
  })
    .then((newShowcase) => {
      res.status(201).send(newShowcase);
    })
    .catch((err) => {
      console.error('Showcase create: Failed ', err);
      res.sendStatus(500);
    });
});

// UPDATE: edit draft fields / add-remove art pieces
showcaseRouter.patch('/update/:id', (req, res) => {
  const { id } = req.params;
  const { _id } = req.user.doc;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: 'bad id' });
    return;
  }

  Showcase.findOneAndUpdate({ _id: id, curator: _id }, req.body, { new: true })
    .then((updated) => {
      if (updated) {
        res.status(200).send(updated);
      } else {
        res.sendStatus(404);
      }
    })
    .catch((err) => {
      console.error('Showcase update: Failed ', err);
      res.sendStatus(500);
    });
});

// DELETE: remove showcase (curator only)
showcaseRouter.delete('/delete/:id', (req, res) => {
  const { id } = req.params;
  const { _id } = req.user.doc;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: 'bad id' });
    return;
  }

  Showcase.findOneAndDelete({ _id: id, curator: _id })
    .then((deleted) => {
      if (deleted) {
        res.sendStatus(200);
      } else {
        res.sendStatus(404);
      }
    })
    .catch((err) => {
      console.error('Showcase delete: Failed ', err);
      res.sendStatus(500);
    });
});

module.exports = { showcaseRouter };
