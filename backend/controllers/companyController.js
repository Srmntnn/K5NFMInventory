const Company = require('../models/companyModel.js');

const createManufacturer = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("USER ID:", req.user._id);

    const { companyName, description } = req.body;
    const createdBy = req.user._id;

    if (!companyName || !description) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    // Optional: Check if manufacturer already exists
    const existing = await Company.findOne({ companyName });
    if (existing) {
      return res.status(400).json({ success: false, message: "Company already exists." });
    }

    const newCompany = new Company({
      companyName,
      description,
      createdBy,
    });

    const savedCompany = await newCompany.save();
    return res.status(201).json({
      success: true,
      message: "Manufacturer created successfully.",
      company: savedCompany,
    });
  } catch (error) {
    console.error("Error creating manufacturer:", error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Company already exists." });
    }

    return res.status(500).json({ success: false, message: "Server error." });
  }
};


const updateManufacturer = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyName, description } = req.body;

    if (!companyName || !description) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ message: "Manufacturer not found." });
    }

    // const existing = await Company.findOne({ companyName });
    // if (existing) {
    //   return res.status(400).json({ success: false, message: "Company already exists." });
    // }

    company.companyName = companyName;
    company.description = description;
    company.editedBy = req.user._id; // from auth middleware

    console.log("Updated company before save:", company);

    await company.save();

    const updatedCompany = await Company.findById(id)
      .populate("createdBy", "name email role") // Only return relevant fields
      .populate("editedBy", "name email role")
      .lean();

    res.status(200).json({ success: true, message: "Manufacturer updated successfully.", company: updatedCompany });
  } catch (error) {
    console.error("Error updating manufacturer:", error);
    // if (error.code === 11000) {
    //   return res.status(400).json({ success: false, message: "Company already exists." });
    // }
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const deleteManufacturer = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ success: false, message: "Manufacturer not found." });
    }

    await company.deleteOne();

    res.status(200).json({ success: true, message: "Manufacturer deleted successfully." });
  } catch (error) {
    console.error("Error deleting manufacturer:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};


const getAllManufacturers = async (req, res) => {
  try {
    const manufacturers = await Company.find()
      .populate('createdBy', 'name email role')
      .populate('editedBy', 'name');

    res.status(200).json({
      success: true,
      companies: manufacturers,
    });
  } catch (error) {
    console.error("Error fetching manufacturers:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const getManufacturerById = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findById(id)
      .populate('createdBy', 'name email role')
      .populate('editedBy', 'name');

    if (!company) {
      return res.status(404).json({ success: false, message: "Manufacturer not found." });
    }

    res.status(200).json({ success: true, company });
  } catch (error) {
    console.error("Error fetching manufacturer:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};


module.exports = {
  createManufacturer,
  updateManufacturer,
  deleteManufacturer,
  getAllManufacturers,
  getManufacturerById
};
