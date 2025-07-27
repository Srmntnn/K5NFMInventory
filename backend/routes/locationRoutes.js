const express = require('express');
const Router = express.Router();

const { createLocation, getAllLocations, updateLocation, deleteLocation, getLocationById } = require('../controllers/locationController.js');
const userAuth = require('../middlewares/userAuth.js');

Router.post('/new', userAuth, createLocation);
Router.get('/get-location/:id', userAuth, getLocationById);
Router.get('/get-locations', userAuth, getAllLocations);
Router.delete('/delete-location/:id', userAuth, deleteLocation);
Router.put('/update-location/:id', userAuth, updateLocation);




module.exports = Router;