
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();
console.log(process.env.MONGO_URI);

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // For parsing JSON requests

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Sample Route
app.get('/', (req, res) => {
  res.send('Welcome to the MERN Backend!');
});

// Start the server
app.listen(5000, () => {
  console.log(`Server running on http://localhost:5000`);
});

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);
