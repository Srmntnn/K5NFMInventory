const express = require('express');
const Router = express.Router();

const {createManufacturer, updateManufacturer, deleteManufacturer, getAllManufacturers, getManufacturerById} = require('../controllers/companyController.js');
const userAuth = require('../middlewares/userAuth.js');

Router.post('/create-manufacturer', userAuth, createManufacturer);
Router.get('/get-manufacturer', userAuth, getAllManufacturers);
Router.get('/get-manufacturer/:id', userAuth, getManufacturerById);
Router.put('/update-manufacturer/:id', userAuth, updateManufacturer);
Router.delete('/delete-manufacturer/:id', userAuth, deleteManufacturer);

module.exports = Router;