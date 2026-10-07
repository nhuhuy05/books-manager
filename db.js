const mongoose = require('mongoose');
require('dotenv').config();

// Kết nối bằng tài khoản Read
const readConnection = mongoose.createConnection(process.env.MONGODB_READ_URI);

// Kết nối bằng tài khoản Write
const writeConnection = mongoose.createConnection(process.env.MONGODB_WRITE_URI);

readConnection.on('connected', () => console.log('Connected to MongoDB with READ privilege'));
readConnection.on('error', (err) => console.error('MongoDB READ connection error:', err.message));

writeConnection.on('connected', () => console.log('Connected to MongoDB with WRITE privilege'));
writeConnection.on('error', (err) => console.error('MongoDB WRITE connection error:', err.message));

module.exports = { readConnection, writeConnection };
