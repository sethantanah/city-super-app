import WaitList from "../models/waitlist.js";

// Create (Add to waitlist)
export const addToWaitList = async (intent, email) => {
  try {
    const newEntry = new WaitList({
      intent,
      email,
    });
    const savedEntry = await newEntry.save();
    return savedEntry;
  } catch (error) {
    throw new Error(`Error adding to waitlist: ${error.message}`);
  }
};

// Read (List all waitlist entries)
export const getAllWaitListEntries = async () => {
  try {
    const entries = await WaitList.find().sort({ createdAt: -1 });
    return entries;
  } catch (error) {
    throw new Error(`Error fetching waitlist entries: ${error.message}`);
  }
};

// Read (Get single entry by ID)
export const getWaitListEntryById = async (id) => {
  try {
    const entry = await WaitList.findById(id);
    if (!entry) {
      throw new Error("Waitlist entry not found");
    }
    return entry;
  } catch (error) {
    throw new Error(`Error fetching waitlist entry: ${error.message}`);
  }
};

// Update (Modify an existing entry)
export const updateWaitListEntry = async (id, updates) => {
  try {
    const updatedEntry = await WaitList.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!updatedEntry) {
      throw new Error("Waitlist entry not found");
    }
    return updatedEntry;
  } catch (error) {
    throw new Error(`Error updating waitlist entry: ${error.message}`);
  }
};

// Delete (Remove an entry from waitlist)
export const removeFromWaitList = async (id) => {
  try {
    const deletedEntry = await WaitList.findByIdAndDelete(id);
    if (!deletedEntry) {
      throw new Error("Waitlist entry not found");
    }
    return deletedEntry;
  } catch (error) {
    throw new Error(`Error removing from waitlist: ${error.message}`);
  }
};

// Additional utility functions

// Get entries by intent
export const getWaitListEntriesByIntent = async (intent) => {
  try {
    const entries = await WaitList.find({ intent }).sort({ createdAt: -1 });
    return entries;
  } catch (error) {
    throw new Error(
      `Error fetching waitlist entries by intent: ${error.message}`
    );
  }
};

// Check if email exists in waitlist
export const checkEmailExists = async (email) => {
  try {
    const entry = await WaitList.findOne({ email });
    return !!entry;
  } catch (error) {
    throw new Error(`Error checking email existence: ${error.message}`);
  }
};
