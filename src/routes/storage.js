// routes/storage.js
const express = require('express');
const { setJSON } =  require("../services/storageService"); // Adjust the path as needed

const router = express.Router();

router.post("/set-storage", (req, res) => {
  const { key, data } = req.body;

  if (!key || typeof data === "undefined") {
    return res.status(400).json({ message: "Key and data are required." });
  }

  try {
    setJSON(key, data);
    res.status(200).json({ message: "Data stored successfully." });
  } catch (error) {
    console.error("Error setting data:", error);
    res.status(500).json({ message: "Failed to store data." });
  }
});

module.exports = router;
