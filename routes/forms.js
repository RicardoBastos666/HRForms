const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { connectToDb } = require('../db');

// Define the roles that are authorized to access each form
const formRoles = {
  'form1': ['admin', 'manager'],
  'form2': ['admin'],
  'form3': ['admin', 'manager', 'employee']
};

// Route to render the forms page
router.get('/', async (req, res) => {
  const { db } = await connectToDb();
  const collection = db.collection('forms');

  try {
    const forms = await collection.find().toArray();
    const role = req.user ? req.user.role : null;

    // Filter the forms based on the user's role
    const filteredForms = forms.filter(form => {
      const authorizedRoles = formRoles[form.name];
      return !authorizedRoles || !role || authorizedRoles.includes(role);
    });

    res.render('forms', { forms: filteredForms });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;