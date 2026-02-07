import User from "../models/User.js";

export const getAllUsers = async (req, res) => {
  try {
    // return all users except logged-in user
    const users = await User.find({ _id: { $ne: req.user._id } }).select(
      "-password",
    );

    res.status(200).json(users);
  } catch (error) {
    console.error("getAllUsers Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
