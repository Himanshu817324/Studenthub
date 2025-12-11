// Minimal server test - check what's failing
import express from 'express';
import dotenv from 'dotenv';

console.log('1. Starting minimal server test...');

// Load environment variables
dotenv.config();
console.log('2. Environment loaded');

console.log('3. Creating Express app...');
const app = express();
const PORT = process.env.PORT || 5000;

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Minimal server working!' });
});

console.log('4. Starting server...');
app.listen(PORT, () => {
    console.log(`✅ Minimal server running on port ${PORT}`);
    console.log(`Test: http://localhost:${PORT}/health`);
});
