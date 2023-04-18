const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { connectToDb } = require('./db');
const ObjectId = require('mongodb').ObjectId;

async function authenticateUser(email, password, done) {
  try {
    const { db, client } = await connectToDb();
    const users = db.collection('users');
    const user = await users.findOne({ email });

    if (!user) {
      return done(null, false, { message: 'No user with that email' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      return done(null, { ...user, email, password });
    } else {
      return done(null, false, { message: 'Password incorrect' });
    }
  } catch (error) {
    done(error);
  }
}

function initialize(passport) {
  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
  
  passport.serializeUser((user, done) => done(null, user._id));
  
  passport.deserializeUser(async (id, done) => {
    try {
      const { db, client } = await connectToDb();
      const users = db.collection('users');
      const user = await users.findOne({ _id: new ObjectId(id) });
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}

module.exports = initialize;
