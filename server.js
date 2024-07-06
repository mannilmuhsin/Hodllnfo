require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

console.log(MONGODB_URI);

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Create a schema for the cryptocurrency data
const cryptoSchema = new mongoose.Schema({
  name: String,
  last: Number,
  buy: Number,
  sell: Number,
  volume: Number,
  base_unit: String,
});

const Crypto = mongoose.model('Crypto', cryptoSchema);

// Function to fetch data from WazirX API and store in the database
async function fetchAndStoreData() {
  try {
    console.log("Fetching data from WazirX API...");
    const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
    const tickers = Object.values(response.data);
    
    // Sort tickers by volume in descending order and get top 10
    const top10 = tickers.sort((a, b) => b.volume - a.volume).slice(0, 10);

    // Clear existing data in the database
    console.log("Clearing existing data...");
    await Crypto.deleteMany({});

    // Store new data
    console.log("Storing new data...");
    const cryptoPromises = top10.map(ticker => {
      const crypto = new Crypto({
        name: ticker.name,
        last: parseFloat(ticker.last),
        buy: parseFloat(ticker.buy),
        sell: parseFloat(ticker.sell),
        volume: parseFloat(ticker.volume),
        base_unit: ticker.base_unit,
      });
      return crypto.save();
    });

    await Promise.all(cryptoPromises);

    console.log("Data updated successfully");
  } catch (error) {
    console.error('Error fetching and storing data:', error);
  }
}

// Route to get cryptocurrency data
app.get('/api/crypto', async (req, res) => {
  try {
    console.log("Fetching data from MongoDB...");
    const cryptoData = await Crypto.find().sort({ volume: -1 }).limit(10);
    res.json(cryptoData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Error fetching data' });
  }
});

// Fetch and store data every 5 minutes
setInterval(fetchAndStoreData, 5 * 60 * 1000);

// Initial fetch when the server starts
fetchAndStoreData();

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
