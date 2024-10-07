import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import path from "path";

//route
import userRoutes from "./routes/userRoutes.js";
import profileTokoRoutes from "./routes/profileTokoRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

//db
import connectDB from "./config/dbConfig.js";

//configure dotenv
dotenv.config();

//esmodule

//rest object
const app = express();

//connect db
connectDB();

//middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

//routes

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/profile/toko", profileTokoRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/menu", menuRoutes);
app.use("/api/v1/order", orderRoutes);

app.get("/", (req, res) => {
  res.send("<h1>Server Telah Jalan</h1>");
});

//port
const PORT = process.env.PORT || 8080;

//run listen
app.listen(PORT, () => {
  console.log(`Server running on ${process.env.DEV_MODE} mode on port ${PORT}`.bgGreen.white);
});
