

const GioTag = require('../models/GioTag');

// Create a new user validations in validator folder
exports.createGioTag = async (req, res) => {
    const tag = req.body;
    try {
        const gioTag = new GioTag(tag);
        await gioTag.save();
        res.status(201).json(tag);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all users
exports.getGioTags = async (req, res) => {
    try {
        const tags = await GioTag.find();
        res.status(200).json(tags);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all users

exports.getGioTag = async (req, res) => {
    try {
        console.log(req.params.id);
        const tag = await GioTag.findById(req.params.id);
        if (!tag) return res.status(404).json({ message: 'Gio Tag not found' });
        res.status(200).json(tag);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateGioTag = async (req, res) => {
    const tag = req.body;
    const paramId = req.params.id;
    if (!tag || !paramId) return res.status(404).json({ message: 'ID can not be empty' });
    try {
        const updatedGioTag = await GioTag.findByIdAndUpdate(paramId, tag, { new: true });
        if (!updatedGioTag) {
            return res.status(404).json({ message: 'GioTag not found.' });
        }
        res.status(200).json(updatedGioTag);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

