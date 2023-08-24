const express = require('express');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config')

const router = express.Router();

const bookCtrl = require('../controllers/book');

router.get('/' + '', bookCtrl.getAllBooks);

router.get('/:id', bookCtrl.getOnebook);

router.get('/bestrating ', bookCtrl.getBestRatedBooks);

router.post('/', auth, multer, bookCtrl.createNewBook);

router.put('/:id', auth, multer, bookCtrl.modifyBook);

router.delete('/:id', auth, bookCtrl.deleteOneBook);

module.exports = router;  