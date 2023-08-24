const Book = require('../models/Book');

const calculateAverageRating = (ratings) => {
    
    const totalRating = ratings.reduce((sum, rating) => sum + rating.grade, 0);
    const averageRating = totalRating / ratings.length;

    return averageRating;
};

exports.addRating = (req, res, next) => {
    const userId = req.auth.userId;
    const { rating } = req.body;
    const userRating = { userId, grade: rating };
    Book.findByIdAndUpdate(
        { _id: req.params.id },
        { $push: { ratings: userRating } },
        { new: true }
    )
    .then((book) => {
        if (!book) {
            return res.status(404).json({ message: 'Livre non trouvé' });
        }
        
        const averageRating = calculateAverageRating(book.ratings);
        book.averageRating = averageRating;
        book.save();

        res.status(200).json(book);
    })
    .catch((error) => res.status(500).json({ error }));
};
