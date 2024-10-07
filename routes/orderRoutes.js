import express from "express";
import {
  createOrderController,
  getAllOrdersByUserController,
  getAllOrdersController,
  getDownloadLaporanExcel,
  getOrdersById,
} from "../controllers/orderController.js";
import { requireSignIn } from "../middlewares/authMiddlewares.js";

const router = express.Router();

//register
router.post("/create", requireSignIn, createOrderController);

//login

//edit

//get all
router.get("/get", getAllOrdersController);
router.get("/download", getDownloadLaporanExcel);
router.get("/get-user", requireSignIn, getAllOrdersByUserController);
router.get("/get/:orderId", getOrdersById);

//delete

export default router;
