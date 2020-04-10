const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const db = mongoose.connect('mongodb://localhost/eventAPI');
const port = process.env.PORT || 3000;
const Event = require('./models/eventModel');
const eventRouter = require('./routes/eventRouter')(Event);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/api', eventRouter);

app.get('/', (req, res) => {
  res.send('Welcome to my anxiety API');
});

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});


// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');

// const app = express();
// const db = mongoose.connect('mongodb://localhost/bookAPI');
// const port = process.env.PORT || 3000;
// const Book = require('./models/bookModel');
// const bookRouter = require('./routes/bookRouter')(Book);

// app.use(bodyParser.urlencoded({extended: true}));
// app.use(bodyParser.json());

// app.use('/api', bookRouter);

// app.get('/', (req, res) => {
//   res.send('Welcome to my API');
// });

// app.listen(port, () => {
//   console.log(`Running on port ${port}`);
// });
