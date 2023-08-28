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
    const bookImageFilePath = req.file.path; // Chemin vers le fichier image
    const outputImagePath = `${req.file.destination}/webp/${req.file.filename.replace(/\.[^/.]+$/, "")}.webp`;
  
    // Utilisez Sharp pour redimensionner et convertir l'image en WebP
    sharp(bookImageFilePath)
      .resize(355) // Redimensionnez l'image à une largeur maximale de 355 pixels (vous pouvez ajuster la taille selon vos besoins)
      .toFile(outputImagePath, (err, info) => {
        if (err) {
          console.error("Error processing image:", err);
          return res.status(400).json({ error: "Error processing image" });
        }
  
        // Une fois que l'image a été traitée avec succès
        console.log("Image processed successfully:", info);
  
        // Créez le nouveau livre
        const bookObject = JSON.parse(req.body.book);
        delete bookObject._id;
        delete bookObject._userId;
        const book = new Book({
          ...bookObject,
          userId: req.auth.userId,
          imageUrl: `${req.protocol}://${req.get('host')}/images/webp/${req.file.filename.replace(/\.[^/.]+$/, "")}.webp`
        });
  
        // Enregistrez le livre dans la base de données
        book.save()
          .then(() => {
            console.log("Book saved successfully");
  
            // Supprimez le fichier original
            fs.unlinkSync(bookImageFilePath);
  
            // Répondez avec un message de succès
            res.status(201).json({ message: 'Objet enregistré !' });
          })
          .catch(error => {
            console.error("Error saving book:", error);
  
            // Supprimez le fichier WebP si une erreur se produit lors de l'enregistrement
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
              .resize(800)
              .toFile(outputImagePath, (err, info) => {
                if (err) {
                  console.error('Error processing image:', err);
                  return res.status(400).json({ error: 'Error processing image' });
                }
        
                // Supprimez l'ancienne image WebP
                if (book.imageUrl) {
                  const oldWebPImagePath = `${req.file.destination}/webp/${book.imageUrl.split('/').pop()}`;
                  fs.unlinkSync(oldWebPImagePath);
                }
        
                bookObject.imageUrl = `${req.protocol}://${req.get('host')}/images/webp/${req.file.filename.replace(/\.[^/.]+$/, '')}.webp`;
        
                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                  .then(() => {
                    fs.unlinkSync(req.file.path); // Supprimez le fichier original
        
                    res.status(200).json({ message: 'Objet modifié!' });
                  })
                  .catch((error) => {
                    fs.unlinkSync(outputImagePath); // Supprimez le fichier WebP si une erreur se produit
                    res.status(401).json({ error });
                  });
              });
            } else {
              // Mettre à jour les propriétés du livre, y compris la note
              const updatedBookObject = { ...bookObject, _id: req.params.id };
            
              // Ajoutez la nouvelle note à l'objet du livre
              if (req.body.rating) {
                const newRating = parseFloat(req.body.rating);
                if (!isNaN(newRating)) {
                  updatedBookObject.rating = newRating;
                } else {
                  return res.status(400).json({ error: 'Invalid rating value' });
                }
              }
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