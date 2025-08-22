const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Ställ in den statiska mappen
app.use(express.static(path.join(__dirname, 'public')));

// Route för root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Starta servern
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
