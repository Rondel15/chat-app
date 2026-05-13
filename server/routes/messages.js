const router = require("express").Router();
const Message = require("../models/Message");
const authMiddleware = require("../middleware/auth");

// GET /api/messages/global?limit=50&before=<timestamp>
router.get("/global", authMiddleware, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const query = { roomId: "global" };
    if (req.query.before) query.createdAt = { $lt: new Date(req.query.before) };

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("sender", "username avatar");

    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/messages/dm/:userId?limit=50
router.get("/dm/:userId", authMiddleware, async (req, res) => {
  try {
    const roomId = [req.user._id.toString(), req.params.userId].sort().join("-");
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const query = { roomId };
    if (req.query.before) query.createdAt = { $lt: new Date(req.query.before) };

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("sender", "username avatar");

    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
