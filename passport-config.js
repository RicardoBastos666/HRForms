const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { connectToDb } = require('./db');
const ObjectId = require('mongodb').ObjectId;

function initialize(passport, user, email, password) {
  const authenticateUser = async (email, password, done) => {
    const { db, users } = await connectToDb();
    const user = await users.findOne({ email: email });
    console.log(email);
    if (user == null) {
      return done(null, false, { message: 'No user with that email' });
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user, email, password);
      } else {
        return done(null, false, { message: 'Password incorrect' });
      }
    } catch (e) {
      return done(e);
    }
  };

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {

    const db = await connectToDb();
    console.log(id);

    console.log("test");
    try {
      var str1 = "ObjectId(\"" + id + "\")";
      var str = new ObjectId(id);
      console.log(str);
      const user = await db.users.findOne({ _id: str });
      console.log(user)
      return done(null, user);
    } catch (e) {
      return done(e);
    }
  });
}

module.exports = initialize;
