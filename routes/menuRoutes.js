import express from "express";
import {
  countMenuInCategory,
  createMenuController,
  deleteMenuController,
  editMenuController,
  getAllMenuController,
  getMenuByCategory,
  getMenuByCategoryController,
  getMenuByIdController,
  getMenuCountByCategoryController,
} from "../controllers/menuController.js";
import upload from "../middlewares/uploadImage.js";
import { requireSignIn } from "../middlewares/authMiddlewares.js";

const router = express.Router();

//register
router.post("/create", upload.single("imgUrl"), requireSignIn, createMenuController);

//login

//edit
router.put("/edit/:id", upload.single("imgUrl"), requireSignIn, editMenuController);

//get all
router.get("/get", getAllMenuController);
router.get("/get/:id", getMenuByIdController);
router.get("/get/category/:category", getMenuByCategory);
router.get("/getby", getMenuByCategoryController);
router.get("/count/category/:categoryId", getMenuCountByCategoryController);

//delete
router.delete("/delete/:id", deleteMenuController);

export default router;
