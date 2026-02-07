import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getAllUsers } from "../controllers/userController.js";

const router = express.Router();

router.get("/", protect, getAllUsers);

export default router;
