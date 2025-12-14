const express = require('express');
const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to the database
mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Database connected successfully');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });