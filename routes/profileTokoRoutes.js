import express from "express";
import { createProfileToko, editProfileToko, getProfileToko } from "../controllers/profileTokoController.js";
import upload from "../middlewares/uploadImage.js";

const router = express.Router();

//register
router.post("/create", upload.single("imgProfile"), createProfileToko);

//login

//edit
router.put("/edit", upload.single("imgProfile"), editProfileToko);

//get all
router.get("/get", getProfileToko);

//delete

export default router;
