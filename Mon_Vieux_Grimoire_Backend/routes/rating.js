const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const ratingCtrl = require('../controllers/rating');

router.post('/:id/rating', auth, ratingCtrl.addRating);

module.exports = router;