const express = require('express');
const router = express.Router();

const bookCtrl = require('../controllers/book');

router.get('/' + '', bookCtrl.getAllBooks);

router.get('/:id', bookCtrl.getOnebook);

router.get('/bestrating ', bookCtrl.getBestRatedBooks);

router.post('/', bookCtrl.createNewBook);

router.put('/:id', bookCtrl.modifyBook);

router.delete('/:id', bookCtrl.deleteOneBook);

module.exports = router;  