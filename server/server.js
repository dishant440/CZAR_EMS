const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const { connectToDB } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5002;


app.use(cors({
  origin: ['http://localhost:3000', 'https://czarcore.netlify.app', /\.netlify\.app$/],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api', routes);

// Error handler
app.use(errorHandler);

await connectToDB();

app.listen(PORT, () => {
  console.log(`🚀 CzarCore server running on port ${PORT}`);
});
