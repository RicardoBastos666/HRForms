if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');

app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

const { connectToDb } = require('./db'); // import the connectToDb function from db.js

const usersPromise = connectToDb(); // create a promise for the users collection

const initializePassport = require('./passport-config');
initializePassport(
  passport,
  async (email) => {
    const users = await usersPromise;
    const user = await users.findOne({ email }); // find user by email
    return user;
  },
  async (id) => {
    const users = await usersPromise;
    const user = await users.findOne({ _id: id }); // find user by id
    return user;
  }
);

app.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs', { name: req.user.name }); // render index page with user name
});

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs');
});

app.get('/form', checkAuthenticated, (req, res) => {
  res.render('form.ejs');
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs', {errorMessage: null});
});

app.post('/register', checkNotAuthenticated, async (req, res) => {
  const { name, email, password, password2 } = req.body;

  if (password !== password2) {
    return res.status(400).render('register', { errorMessage: 'Passwords do not match' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const users = await usersPromise; // resolve the usersPromise
    const user = {
      name: name,
      email: email,
      password: hashedPassword
    };
    
    try {
      const result = await users.users.insertOne(user); // insert new user into the users collection
      console.log(`User with id: ${result.insertedId, result.name} inserted into collection`);
      res.redirect('/login');
    } catch (err) {
      console.error(err);
      res.redirect('/register');
    }
  } catch (err) {
    console.error(err);
    res.redirect('/register');
  }
});

app.delete('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect('/login');
  });
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
}

app.listen(3000, () => {
  console.log('Server started on port 3000');
});