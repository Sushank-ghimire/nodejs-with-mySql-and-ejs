import { config } from "dotenv";
import jwt from "jsonwebtoken";
config();

const authenticateUser = async (req, res, next) => {
  try {
    // Get the token from the cookies
    const token = req.cookies.userToken;
    console.log("Token : ", token);

    const jwtSecret = process.env.JWT_SECRET_TOKEN;

    const decode = jwt.decode(token, jwtSecret);
    const { email, id } = decode;

    if (!email || !id) {
      return res.redirect("/login");
    }

    next();
  } catch (error) {
    console.error("Authentication Error:", error);
    return res.redirect("/login");
  }
};

export { authenticateUser };
