const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config({ path: './.env' });

connectDB();

const app = express();

app.use(cors());
app.use(express.json()); 

app.use('/api/crm', require('./routes/crm.routes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));