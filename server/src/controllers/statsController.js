const Score = require('../models/scoreModel');

// Get all stats
exports.getStats = async (req, res) => {
  try {
    const stats = await Score.find({});
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving stats', error });
  }
};

// Create a new score
exports.createScore = async (req, res) => {
  const newScore = new Score(req.body);
  try {
    const savedScore = await newScore.save();
    res.status(201).json(savedScore);
  } catch (error) {
    res.status(400).json({ message: 'Error creating score', error });
  }
};

// Update a score
exports.updateScore = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedScore = await Score.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedScore) {
      return res.status(404).json({ message: 'Score not found' });
    }
    res.status(200).json(updatedScore);
  } catch (error) {
    res.status(400).json({ message: 'Error updating score', error });
  }
};

// Delete a score
exports.deleteScore = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedScore = await Score.findByIdAndDelete(id);
    if (!deletedScore) {
      return res.status(404).json({ message: 'Score not found' });
    }
    res.status(200).json({ message: 'Score deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting score', error });
  }
};