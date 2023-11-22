const express = require('express');
const app = express();
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('dotenv');
const UserRoute = require('./Routes/userRoute');
const AuthRoute = require('./Routes/authRoute');
const PostRoute = require('./Routes/postRoute');
const path = require('path');
const multer = require('multer');

// PORT
const PORT = 5000;

env.config();

mongoose.connect(process.env.MONGO_URL, () => {
  console.log('DB connected');
});

app.use('/Assets', express.static(path.join(__dirname, 'public/Assets')));
// Middleware
app.use(express.json());
app.use(morgan('common'));
app.use(helmet());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/Assets');
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage });

app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    res.status(200).json('File uploaded Successfully');
  } catch (error) {
    console.log(error);
  }
});

app.use('/api/users', UserRoute);
app.use('/api/auth', AuthRoute);
app.use('/api/posts', PostRoute);

app.get('/', (req, res) => {
  res.send('Welcome to Homepage');
});

app.listen(PORT, () => {
  console.log('Server is listening on port 5000');
});
