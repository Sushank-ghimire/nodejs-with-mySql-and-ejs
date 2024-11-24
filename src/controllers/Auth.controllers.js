import connection from "../utils/DbConnect.js";
import argon2 from "argon2";

const handleLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    // Query to fetch the user by email
    const query = "SELECT * FROM users WHERE email=?";
    connection.query(query, [email], async (err, results) => {
      if (err) {
        console.error("Database Error:", err);
        return res
          .status(500)
          .json({ error: "An error occurred while logging in." });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      const user = results[0];
      try {
        const isPasswordValid = await argon2.verify(user.password, password);

        if (!isPasswordValid) {
          return res.status(401).json({ error: "Invalid email or password." });
        }

        const token = generateToken(user.email);
        res.status(200).json({
          message: "Login successful.",
        });
      } catch (verificationError) {
        console.error("Password Verification Error:", verificationError);
        return res.status(500).json({ error: "Password verification failed." });
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "An error occurred while logging in." });
    next(error);
  }
};

const generateToken = async (email) => {};

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
      const hashedPassword = await argon2.hash(password);

      // Insert the new user into the database
      const queryToInsert =
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
      const values = [name, email, hashedPassword];

      connection.query(queryToInsert, values, (err, results) => {
        if (err) {
          console.error("Database Error:", err);
          return res.status(500).json({ error: "Failed to register user." });
        }

        res.status(201).json({ message: "User registered successfully." });
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
