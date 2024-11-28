import { configDotenv } from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import noteRoutes from "./routes/notes.route.js";
import userRoutes from "./routes/user.routes.js";
import { authenticateUser } from "./middlewares/Auth.middleware.js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

configDotenv();

const notes = [
  {
    id: 1,
    title: "First Note",
    content: "This is the content of the first note.",
  },
  {
    id: 2,
    title: "Second Note",
    content: "Here's some content for the second note.",
  },
  {
    id: 3,
    title: "Shopping List",
    content: "Buy milk, eggs, and bread. Don't forget the cheese!",
  },
  {
    id: 4,
    title: "Project Ideas",
    content: "Build a note-taking app with CRUD features.",
  },
];

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const token = req.cookies.userToken;
  if (token) {
    try {
      const jwtSecret = process.env.JWT_SECRET_TOKEN;
      const user = jwt.verify(token, jwtSecret);

      res.locals.user = user;
    } catch (error) {
      console.error("Invalid token:", error.message);
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  next();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/notes", authenticateUser, async (req, res) => {
  res.render("notes", { notes });
});

// Api Routes
app.use("/api/v1/notes", noteRoutes);
app.use("/api/v1/users", userRoutes);

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.get("/register", (req, res) => {
  res.render("register", { error: null });
});

app.get("/create", authenticateUser, async (req, res) => {
  res.render("create");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
