const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser"); // Middleware for authentication
const Note = require("../modules/Notes");
const { body, validationResult } = require("express-validator");

// ✅ Route 1: Fetch all notes (GET)
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    console.log("Fetching notes for user:", req.user.id);
    const notes = await Note.find({ user: req.user.id });

    if (!notes) {
      return res.status(404).json({ error: "No notes found" });
    }

    console.log("Notes found:", notes);
    res.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



// ✅ Route 2: Add a new note (POST)
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Title is required").notEmpty(),
    body("description", "Description must be at least 5 characters").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const { title, description, tag } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });

      const savedNote = await note.save();
      res.json(savedNote);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// ✅ Route 3: Delete a note (DELETE)
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Ensure user owns the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await Note.findByIdAndDelete(req.params.id);
    res.json({ success: "Note deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// ✅ Route 4: Update a note (PUT)
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;
  const updatedNote = {};

  if (title) updatedNote.title = title;
  if (description) updatedNote.description = description;
  if (tag) updatedNote.tag = tag;

  try {
    let note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: "Note not found" });

    // Ensure user owns the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    note = await Note.findByIdAndUpdate(req.params.id, { $set: updatedNote }, { new: true });
    res.json(note);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
