const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user');
const bookRoutes = require('./routes/book');
const ratingRoutes = require('./routes/rating');
const path = require('path');


mongoose.connect('mongodb+srv://Boris:5eaR3dHgdiUOnQ09@cluster0.kbhf8jk.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

app.use(express.json());

app.use('/api/auth', userRoutes); 

app.use('/api/books', bookRoutes);

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/books', ratingRoutes);

module.exports = app;
