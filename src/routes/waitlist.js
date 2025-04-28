import express from 'express';
import {
  addToWaitList,
  getAllWaitListEntries,
  getWaitListEntryById,
  updateWaitListEntry,
  removeFromWaitList,
  getWaitListEntriesByIntent,
  checkEmailExists
} from '../services/waitListService.js'; // Adjust the import path

const router = express.Router();

// Add to waitlist
router.post('/', async (req, res) => {
  try {
    const { intent, email } = req.body;
    if (!intent || !email) {
      return res.status(400).json({ error: 'Intent and email are required' });
    }
    const newEntry = await addToWaitList(intent, email);
    res.status(201).json(newEntry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all waitlist entries
router.get('/', async (req, res) => {
  try {
    const entries = await getAllWaitListEntries();
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single entry by ID
router.get('/:id', async (req, res) => {
  try {
    const entry = await getWaitListEntryById(req.params.id);
    res.status(200).json(entry);
  } catch (error) {
    if (error.message === 'Waitlist entry not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update an entry
router.put('/:id', async (req, res) => {
  try {
    const updatedEntry = await updateWaitListEntry(req.params.id, req.body);
    res.status(200).json(updatedEntry);
  } catch (error) {
    if (error.message === 'Waitlist entry not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete an entry
router.delete('/:id', async (req, res) => {
  try {
    const deletedEntry = await removeFromWaitList(req.params.id);
    res.status(200).json(deletedEntry);
  } catch (error) {
    if (error.message === 'Waitlist entry not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// Additional routes

// Get entries by intent
router.get('/intent/:intent', async (req, res) => {
  try {
    const entries = await getWaitListEntriesByIntent(req.params.intent);
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if email exists
router.get('/check-email/:email', async (req, res) => {
  try {
    const exists = await checkEmailExists(req.params.email);
    res.status(200).json({ exists });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;