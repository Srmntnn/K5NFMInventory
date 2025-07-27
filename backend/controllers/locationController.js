const Location = require('../models/locationModel');

const createLocation = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("USER ID:", req.user._id);

    const { locationName, description } = req.body;

    if (!locationName || !description) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const existing = await Location.findOne({ locationName });
    if (existing) {
      return res.status(400).json({ success: false, message: "Location already exists." });
    }

    const newLocation = new Location({
      locationName,
      description,
      createdBy: req.user._id, // from auth middleware
    });

    const savedLocation = await newLocation.save();
    res.status(201).json({ success: true, message: "Location created successfully.", location: savedLocation });
  } catch (error) {
    console.error("Error creating location:", error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Company already exists." });
    }

    return res.status(500).json({ success: false, message: "Server error." });
  }
}

const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find()
      .populate('createdBy', 'name email role') // include email if needed
      .populate('editedBy', 'name email');

    res.status(200).json({ success: true, locations }); // ✅ Fix here
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const location = await Location.findById(id);
    if (!location) {
      return res.status(404).json({ success: false, message: "Location not found." });
    }

    await location.deleteOne();

    res.status(200).json({ success: true, message: "Location deleted successfully." });
  } catch (error) {
    console.error("Error deleting location:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { locationName, description } = req.body;

    // Log the incoming request body for debugging
    console.log("Request Body:", req.body);

    if (!locationName || !description) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Find the location by ID
    const location = await Location.findById(id);
    if (!location) {
      return res.status(404).json({ message: "Location not found." });
    }

    // Update the location fields
    location.locationName = locationName;
    location.description = description;
    location.editedBy = req.user._id; // from auth middleware

    // Save the updated location
    await location.save();

    // Fetch the updated location with populated 'createdBy' field
    const updatedLocation = await Location.findById(id)
      .populate("createdBy", "name email role") // Ensure 'createdBy' is populated
      .populate("editedBy", "name, email role")
      .lean();

    // Log the updated location for debugging
    console.log("Updated Location:", updatedLocation);

    // Respond with the updated location
    res.status(200).json({
      success: true,
      message: "Location updated successfully.",
      location: updatedLocation,
    });
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const getLocationById = async (req, res) => {
  try {
    const { id } = req.params;

    const location = await Location.findById(id)
      .populate('createdBy', 'name email role')
      .populate('editedBy', 'name');

    if (!location) {
      return res.status(404).json({ success: false, message: "Manufacturer not found." });
    }

    res.status(200).json({ success: true, location });
  } catch (error) {
    console.error("Error fetching manufacturer:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
module.exports = {
  createLocation,
  getAllLocations,
  deleteLocation,
  updateLocation,
  getLocationById
  // Add other location-related functions here (update, delete, etc.)
};