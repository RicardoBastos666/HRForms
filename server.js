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
const { MongoClient } = require('mongodb');

const authRoutes = require('./routes/auth');
//const formRoutes = require('./routes/form');

const initializePassport = require('./passport-config');
const { PORT, MONGODB_URI, SESSION_SECRET } = process.env;

(async () => {
  const client = await MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true });
  const db = client.db();
  const users = db.collection('users');
  await initializePassport(passport, users);

  app.set('view-engine', 'ejs');
  app.use(express.urlencoded({ extended: false }));
  app.use(flash());
  app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(methodOverride('_method'));

  app.use('/', authRoutes);
  //app.use('/form', formRoutes);

  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
})();
