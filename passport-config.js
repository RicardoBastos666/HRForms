const bcrypt = require('bcrypt');
const { connectToDb } = require('./db');
//const ObjectId = require('mongodb').ObjectId;
const passport = require('passport');
const { ObjectId } = require('mongodb');
const LocalStrategy = require('passport-local').Strategy;

module.exports = function(db) {
  function authenticateUser(username, password, done) {
    const user = db.collection('users').findOne({ username: username }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (password !== user.password) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }

  passport.use(new LocalStrategy({ usernameField: 'username' }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser((id, done) => {
    const user = db.collection('users').findOne({ _id: new ObjectId(id) }, function (err, user) {
      if (err) {
        return done(err);
      }
      done(null, user);
    });
  });
};
