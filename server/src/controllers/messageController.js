import Message from "../models/Message.js";

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;

    if (!receiverId || !text) {
      return res.status(400).json({ message: "receiverId and text required" });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      text,
    });

    res.status(201).json(message);
  } catch (error) {
    console.error("sendMessage Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    // get all messages between logged-in user and selected user
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("getMessages Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
