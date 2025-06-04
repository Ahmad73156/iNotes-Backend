const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');
connectToMongo();

const app = express();
const port = 3000;

//This is the middleware
app.use(express.json());
app.use(cors());

// Available Routes
app.use('/api/Auth', require('./Routes/Auth'));
app.use('/api/notes', require('./Routes/Routesnotes'));


app.listen(port, () => {
    console.log(`iNoteBook backened is running at http://localhost:${port}`);
});
