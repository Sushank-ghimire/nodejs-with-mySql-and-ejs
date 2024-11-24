import connection from "../utils/DbConnect.js";
import bcrypt from "bcryptjs";
import { configDotenv } from "dotenv";
import jwt from "jsonwebtoken";
configDotenv();

const handleLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      const error = "Email and password are required.";
      return res.render("Error", { error });
    }

    // Query to fetch the user by email
    const query = "SELECT * FROM users WHERE email=?";
    connection.query(query, [email], async (err, results) => {
      if (err) {
        console.error("Database Error:", err);
        const error = "An error occurred while logging in.";
        return res.status(500).render("Error", { error });
      }

      if (results.length === 0) {
        res.status(401).render("Error", { error: "User not registered" });
      }

      const user = results[0];
      const userPassword = user.password;
      try {
        const isPasswordValid = await bcrypt.compare(password, userPassword);

        if (!isPasswordValid) {
          const error = "Invalid email or password.";
          return res.status(401).render("Error", { error });
        }

        const token = await generateToken(user);

        // Set the cookie with the token
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
    res.status(500).json({ error: "An error occurred while logging in." });
    next(error);
  }
};

const generateToken = async (user) => {
  try {
    const jwtSecret = process.env.JWT_SECRET_TOKEN;

    const userData = { email: user.email, userId: user.id };
    const token = await jwt.sign(userData, jwtSecret, {
      expiresIn: "1d",
    });
    return token;
  } catch (error) {
    throw Error("Error while generating token.");
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

        res
          .status(201)
          .render("Error", { error: "User registered successfully." });
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

export { handleLogin, handleRegister };
