import { Router } from "express";
import {
  handleLogin,
  handleRegister,
} from "../controllers/Auth.controllers.js";

const userRoutes = Router();
userRoutes.post("/register", handleRegister);
userRoutes.post("/login", handleLogin);

export default userRoutes;
