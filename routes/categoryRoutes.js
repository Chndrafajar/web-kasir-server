import express from "express";
import upload from "../middlewares/uploadImage.js";
import {
  createCategoryController,
  deleteCategoryController,
  editCategoryController,
  getAllCategoryController,
  getCategoryByIdController,
} from "../controllers/categoryController.js";
import { requireSignIn } from "../middlewares/authMiddlewares.js";

const router = express.Router();

//register
router.post("/create", upload.single("imgUrl"), requireSignIn, createCategoryController);

//login

//edit
router.put("/edit/:id", upload.single("imgUrl"), requireSignIn, editCategoryController);

//get all
router.get("/get", getAllCategoryController);
router.get("/get/:id", getCategoryByIdController);

//delete
router.delete("/delete/:id", deleteCategoryController);

export default router;
