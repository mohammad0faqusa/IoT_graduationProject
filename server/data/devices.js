const DeviceModel = require('./../models/Device');

// Async function to fetch devices
async function getDevices() {
    try {
        const devices = await DeviceModel.find({}).lean();
        return devices; // Return the data
    } catch (error) {
        console.error('Error fetching devices:', error);
        return [];
    }
}

// Export the function (not the variable)
module.exports = { getDevices };
