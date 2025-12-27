const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const { connectToDB } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5002;


app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://192.168.0.221:5173', 
    'http://192.168.29.66:5173',
    'http://192.168.0.197:5173'
  ],
  // credentials: true
}));

app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';

  if (contentType.includes('multipart/form-data')) {
    return next();
  }

  if (contentType.includes('application/json')) {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => {
      data = data.trim();
      try {
        req.body = JSON.parse(data);
        next();
      } catch (err) {
        next(err);
      }
    });
  } else {
    next();
  }
});

app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/uploads', cors({
  origin: [
    'http://localhost:5173',
    'http://192.168.0.221:5173',
    'http://192.168.29.66:5173'
  ],
  credentials: true
}), express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api', routes);

// Error handler
app.use(errorHandler);

const startServer = async () => {
  await connectToDB();
  app.listen(PORT, '0.0.0.0', () => console.log(`server running on port ${PORT}`));
};

startServer();
