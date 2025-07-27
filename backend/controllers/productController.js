const Item = require('../models/itemModel');
const History = require('../models/historyModel');
const Location = require('../models/locationModel');

// Create Item
const createItem = async (req, res) => {
  try {
    const {
      itemName,
      description,
      serialNo,
      manufacturer,
      model,
      dateOfPurchase,
      user,
      quantity,
      status,
      location,
      condition,
    } = req.body;

    if (!itemName || !serialNo || !model || !user) {
      return res.status(400).json({ message: "Required fields missing." });
    }

    const newItem = new Item({
      itemName,
      description,
      serialNo,
      manufacturer,
      model,
      dateOfPurchase,
      user,
      quantity,
      status,
      location,
      condition,
      createdBy: req.user._id,
    });

    const savedItem = await newItem.save();

    const populatedItem = await Item.findById(savedItem._id)
      .populate("manufacturer", "companyName description")
      .populate("location", "name description");

    res.status(201).json({
      message: "Item added successfully.",
      item: populatedItem,
    });
  } catch (error) {
    console.error("Error adding item:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const getAllItems = async (req, res) => {
  try {
    const items = await Item.find()
      .populate('manufacturer') // Populate manufacturer details
      .populate('location');    // Populate location details (array of objects)

    res.status(200).json({ success: true, items });
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getItemsByid = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("createdBy");
    console.log("item", item);
    if (!item) {
      return res.status(404).json({ success: false, error: "Item not found" });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ succes: false, error: error.message });
  }
}

const getItemHistory = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate("createdBy")
      .populate({
        path: "history",
        populate: {
          path: "location",
        },
      })
      .populate("manufacturer");

    console.log("item", item);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: true, message: 'Item not found' });
    }
    res.status(200).json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Item
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      itemName,
      description,
      serialNo,
      manufacturer,
      model,
      dateOfPurchase,
      user,
      quantity,
      status,
      location,
      condition, 
    } = req.body;

    const updatedItem = await Item.findByIdAndUpdate(
      id,
      {
        itemName,
        description,
        serialNo,
        manufacturer,
        model,
        dateOfPurchase,
        user,
        quantity,
        status,
        location,
        condition,
      },
      { new: true }
    )
      .populate("manufacturer")
      .populate("location");

    if (!updatedItem) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    res.status(200).json({ success: true, message: "Item updated successfully", item: updatedItem });
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



module.exports = {
  createItem,
  getAllItems,
  getItemsByid,
  getItemHistory,
  deleteItem,
  updateItem
};