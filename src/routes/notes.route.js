import { Router } from "express";
import {
  createNotes,
  deleteNotes,
  updateNotes,
} from "../controllers/notes.controllers.js";

const noteRoutes = Router();
noteRoutes.post("/add", createNotes);
noteRoutes.delete("/delete/:noteId", deleteNotes);
noteRoutes.put("/edit/:noteId", updateNotes);

export default noteRoutes;
