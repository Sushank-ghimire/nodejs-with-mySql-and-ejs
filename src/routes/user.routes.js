import { Router } from "express";
import {
  handleLogin,
  handleLogout,
  handleRegister,
} from "../controllers/Auth.controllers.js";

const userRoutes = Router();
userRoutes.post("/register", handleRegister);
userRoutes.post("/login", handleLogin);
userRoutes.get("/logout", handleLogout);

export default userRoutes;
