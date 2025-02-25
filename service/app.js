const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const ciRoutes = require('./routes/CIRoutes');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('Hello, Express!');
});

// CI Routes
app.use('/api/ci', ciRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});