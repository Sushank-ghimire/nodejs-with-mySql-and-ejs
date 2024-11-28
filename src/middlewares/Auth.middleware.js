import { config } from "dotenv";
import jwt from "jsonwebtoken";
config();

const authenticateUser = async (req, res, next) => {
  try {
    // Get the token from the cookies
    const token =
      req.cookies.userToken || req.headers.Authorization.split(" ")[1];

    const jwtSecret = process.env.JWT_SECRET_TOKEN;

    const { userData } = jwt.decode(token, jwtSecret);
    if (!userData.email) {
      return res.redirect("/login");
    }
    req.user = userData;
    next();
  } catch (error) {
    return res.redirect("/login");
  }
};

export { authenticateUser };
