if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const flash = require('express-flash');
const session = require('express-session');
const passport = require('passport');
const passportConfig = require('./passport-config')(db);

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Set the views directory to your views folder
app.set('views', __dirname + '/views');

require('dotenv').config();

const authRoutes = require('./routes/auth.js');
const formRoutes = require('./routes/forms.js');

require('./passport-config')(passport);

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Register routes
app.use('/', authRoutes);
app.use('/form', formRoutes);

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/form', (req, res) => {
  res.render('form');
});

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/backoffice', (req, res) => {
  res.render('backoffice');
});


// Catch-all for unknown routes
app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});