const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');

// Connect to MongoDB
connectToMongo();

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', require('./Routes/Auth'));
app.use('/api/notes', require('./Routes/Routesnotes'));

app.listen(port, () => {
    console.log(`✅ iNotebook backend is running at http://localhost:${port}`);
});
