import connection from "../utils/DbConnect.js";
import bcrypt from "bcryptjs";
import { configDotenv } from "dotenv";
import jwt from "jsonwebtoken";
configDotenv();

const handleLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render("login", { error: "Email and password are required." });
    }

    const query = "SELECT * FROM users WHERE email=?";
    connection.query(query, [email], async (err, results) => {
      if (err) {
        console.error("Database Error:", err);
        return next(err); // Pass error to next middleware
      }

      if (results.length === 0) {
        return res
          .status(401)
          .render("login", { error: "User not registered" });
      }

      const user = results[0];
      try {
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return res.render("login", {
            error: "Invalid email or password.",
            email: req.body.email,
            password: req.body.password,
          });
        }
        const token = await generateToken(user);

        res.cookie("userToken", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 24 * 60 * 60 * 1000,
          sameSite: "strict",
        });
        return res.redirect("/create");
      } catch (verificationError) {
        console.error("Password Verification Error:", verificationError);
        return res
          .status(500)
          .render("Error", { error: "Password verification failed." });
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    next(error); // Pass error to next middleware
  }
};

const generateToken = async (user) => {
  try {
    const jwtSecret = process.env.JWT_SECRET_TOKEN;

    if (!jwtSecret) {
      throw new Error(
        "JWT_SECRET_TOKEN is not defined in the environment variables."
      );
    }

    const userData = { email: user.email, userName: user.name };
    const token = await jwt.sign({ userData }, jwtSecret, {
      expiresIn: "1d",
    });
    return token;
  } catch (error) {
    console.error("Error while generating token:", error.message); // Debug log
    throw new Error("Error while generating token.");
  }
};

const handleRegister = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Check if the user already exists
    const queryToCheck = "SELECT * FROM users WHERE email = ?";
    connection.query(queryToCheck, [email], async (err, results) => {
      if (err) {
        console.error("Database Error:", err);
        return res
          .status(500)
          .json({ error: "An error occurred while checking the user." });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: "User already exists." });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 5);

      // Insert the new user into the database
      const queryToInsert =
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
      const values = [name, email, hashedPassword];

      connection.query(queryToInsert, values, (err, results) => {
        if (err) {
          console.error("Database Error:", err);
          return res
            .status(500)
            .render("Error", { error: "Failed to register user." });
        }

        return res.status(201).redirect("/login");
      });
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while registering the user." });
    next(error);
  }
};

const handleLogout = async (req, res, next) => {
  try {
    res.clearCookie("userToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return res.redirect("/");
  } catch (error) {
    next(error);
  }
};

export { handleLogin, handleRegister, handleLogout };
