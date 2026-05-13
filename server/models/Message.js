const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // null = global chat
    content:  { type: String, required: true, trim: true, maxlength: 1000 },
    roomId:   { type: String, default: "global" }, // "global" or sorted user-pair id
    read:     { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for fast room history queries
messageSchema.index({ roomId: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);
