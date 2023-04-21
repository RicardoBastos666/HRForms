const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');

const { connectToDb } = require('../db');

async function getUserByEmail(email) {
  const { db } = await connectToDb();
  const collection = db.collection('users');
  const user = await collection.findOne({ email: email });
  return user;
}

const usersPromise = connectToDb(); // create a promise for the users collection

router.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs', { name: req.user.name })
});

router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

router.post('/register', checkNotAuthenticated, async (req, res) => {
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

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      req.flash('error', 'User already exists');
      return res.redirect('/register');
    }
    
    try {
      const result = await users.insertOne(user); // insert new user into the users collection
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

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
}

module.exports = router;