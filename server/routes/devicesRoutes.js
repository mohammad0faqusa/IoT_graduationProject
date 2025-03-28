const express = require('express')
const devicesControllers = require('./../controllers/devicesControllers')
const router = express.Router(); 


// Handle GET and POST requests on '/'
router.get('/', devicesControllers.getAllDevices); // GET request
router.post('/', devicesControllers.addDevice);   // POST request
router.get('/addDevice', devicesControllers.getAddDevicePage); // GET request

module.exports = router; 