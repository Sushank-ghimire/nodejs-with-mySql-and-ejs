import { configDotenv } from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import noteRoutes from "./routes/notes.route.js";
import userRoutes from "./routes/user.routes.js";
import { authenticateUser } from "./middlewares/Auth.middleware.js";
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((err, req, res, next) => {
  if (err.name === "ValidationError") {
    return res
      .status(400)
      .json({ error: "Validation failed", details: err.message });
  }
  res.status(500).json({ error: "Internal server error" });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/notes", authenticateUser, (req, res) => {
  res.render("notes", { notes });
});

// Api Routes
app.use("/api/v1/notes", noteRoutes);
app.use("/api/v1/users", userRoutes);

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/create", (req, res) => {
  res.render("create");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
