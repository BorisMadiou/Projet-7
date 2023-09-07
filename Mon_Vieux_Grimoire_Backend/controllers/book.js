const Book = require('../models/Book');
const fs = require('fs');
const sharp = require('sharp');

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

  exports.createNewBook = (req, res, next) => {
    const bookImageFilePath = req.file.path;
    const outputImagePath = `${req.file.destination}/webp/${req.file.filename.replace(/\.[^/.]+$/, "")}.webp`;

    sharp(bookImageFilePath)
      .resize(355)
      .toFile(outputImagePath, (err, info) => {
        if (err) {
          console.error("Error processing image:", err);
          return res.status(400).json({ error: "Error processing image" });
        }

        console.log("Image processed successfully:", info);

        const bookObject = JSON.parse(req.body.book);
        delete bookObject._id;
        delete bookObject._userId;
        const book = new Book({
          ...bookObject,
          userId: req.auth.userId,
          imageUrl: `${req.protocol}://${req.get('host')}/images/webp/${req.file.filename.replace(/\.[^/.]+$/, "")}.webp`
        });
  
        book.save()
          .then(() => {
            console.log("Book saved successfully");
  
            fs.unlinkSync(bookImageFilePath);
  
            res.status(201).json({ message: 'Objet enregistré !' });
          })
          .catch(error => {
            console.error("Error saving book:", error);
  
            fs.unlinkSync(outputImagePath);
            res.status(400).json({ error });
          });
      });
  };
  

  exports.modifyBook = (req, res, next) => {
    const bookObject = req.file
      ? {
          ...JSON.parse(req.body.book),
          imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        }
      : { ...req.body };
  
    delete bookObject._userId;
  
    Book.findOne({ _id: req.params.id })
      .then((book) => {
        if (book.userId != req.auth.userId) {
          res.status(401).json({ message: 'Not authorized' });
        } else {
          const updateBook = async () => {
            if (req.file) {
              const outputImagePath = `${req.file.destination}/webp/${req.file.filename.replace(/\.[^/.]+$/, '')}.webp`;
          
              sharp(req.file.path)
                .resize(355)
                .toFile(outputImagePath, (err, info) => {
                  if (err) {
                    console.error('Error processing image:', err);
                    return res.status(400).json({ error: 'Error processing image' });
                  }

                  if (book.imageUrl) {
                    const oldWebPImagePath = `${req.file.destination}/webp/${book.imageUrl.split('/').pop()}`;
                    fs.unlinkSync(oldWebPImagePath);
                  }
          
                  bookObject.imageUrl = `${req.protocol}://${req.get('host')}/images/webp/${req.file.filename.replace(/\.[^/.]+$/, '')}.webp`;
          
                  Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                    .then(() => {
                      fs.unlinkSync(req.file.path);
          
                      res.status(200).json({ message: 'Objet modifié!' });
                    })
                    .catch((error) => {
                      fs.unlinkSync(outputImagePath);
                      res.status(401).json({ error });
                    });
                });
            } else {
              Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Objet modifié!' }))
                .catch((error) => res.status(401).json({ error }));
            }
          };
  
          updateBook();
        }
      })
      .catch((error) => {
        res.status(400).json({ error });
      });
  };

 exports.deleteOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({message: 'Not authorized'});
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
 };