const router = require("express").Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

// GET /api/users — list all users except self
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("username avatar isOnline lastSeen")
      .sort({ isOnline: -1, username: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
