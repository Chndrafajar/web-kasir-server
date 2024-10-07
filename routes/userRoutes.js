import express from "express";
import {
  deleteUserController,
  editUserController,
  getUserAllController,
  getUserByIdController,
  getUserController,
  loginUserController,
  registerUserController,
} from "../controllers/userController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddlewares.js";

const router = express.Router();

//register
router.post("/register", registerUserController);

//login
router.post("/login", loginUserController);

//edit
router.put("/edit/:id", editUserController);

//get all
router.get("/get", getUserAllController);
router.get("/get-all", getUserController);
router.get("/get/:id", getUserByIdController);
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});

router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

//delete
router.delete("/delete/:id", deleteUserController);

export default router;
