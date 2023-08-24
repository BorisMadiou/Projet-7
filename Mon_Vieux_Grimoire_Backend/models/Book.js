const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    userId: { type: String },
    title: { type: String, required: true },
    author: { type: String, required: true },
    imageUrl: { type: String, required: true },
    year: { type: Number, required: true },
    genre: { type: String, required: true },
    ratings: [
        {
            userId: { type: String },
            grade: { type: Number }
        }
    ],
    averageRating: { type: Number }
  });
  
  module.exports = mongoose.model('Book', bookSchema);