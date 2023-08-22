const Book = require('../models/Book');

exports.getAllBooks = (req, res, next) => {
    Book.find().then(
      (books) => {
        res.status(200).json(books);
      }
    ).catch(
      (error) => {
        res.status(400).json({
          error: error
        });
      }
    );
  };

exports.getOnebook = (req, res, next) => {
    Book.findOne({
        _id: req.params.id
      }).then(
        (book) => {
          res.status(200).json(book);
        }
      ).catch(
        (error) => {
          res.status(404).json({
            error: error
          });
        }
      );
  };

exports.getBestRatedBooks = (req, res, next) => {
    
    
};

exports.createNewBook = (req, res, next) => {
    const book = new Book({
        userId: req.body.userId,
        title: req.body.title,
        author: req.body.author,
        imageUrl: req.body.imageUrl,
        year: req.body.year,
        genre: req.body.genre 
    });
    book.save().then(
      () => {
        res.status(201).json({
          message: 'Post saved successfully!'
        });
      }
    ).catch(
      (error) => {
        res.status(400).json({
          error: error
        });
      }
    );
  };

exports.modifyBook = (req, res, next) => {
    const book = new Book({
        _id: req.params.id,
        userId: req.body.userId,
        title: req.body.title,
        author: req.body.author,
        imageUrl: req.body.imageUrl,
        year: req.body.year,
        genre: req.body.genre 
    });
    Thing.updateOne({_id: req.params.id}, thing).then(
      () => {
        res.status(201).json({
          message: 'Thing updated successfully!'
        });
      }
    ).catch(
      (error) => {
        res.status(400).json({
          error: error
        });
      }
    );
  };

exports.deleteOneBook = (req, res, next) => {
    Book.deleteOne({_id: req.params.id}).then(
      () => {
        res.status(200).json({
          message: 'Deleted!'
        });
      }
    ).catch(
      (error) => {
        res.status(400).json({
          error: error
        });
      }
    );
  };