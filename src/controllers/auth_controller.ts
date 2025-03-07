import { Request, Response } from "express";
import { Document } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/user_model";

const axios = require('axios');
const accessTokenExpiration = parseInt(process.env.JWT_EXPIRATION_MS);

const register = async (req: Request, res: Response) => {
  const fullName: string = req.body.fullName;
  const email: string = req.body.email;
  const password: string = req.body.password;
  const imageUrl: string = req.body.imageUrl;

  if (!email || !password) {
    return res.status(400).send("missing email or password");
  }

  try {
    const userWithEmail = await User.findOne({ email: email });
    if (userWithEmail != null) {
      return res.status(400).send("Email already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      email,
      password: encryptedPassword,
      imageUrl: imageUrl,
    });

    const tokens = await generateTokens(user);

    res.cookie("refresh", tokens.refreshToken, {
      httpOnly: true,
      path: "/auth",
    });
    res.cookie("access", tokens.accessToken, {
      httpOnly: true,
      maxAge: accessTokenExpiration,
    });

    const {
      password: userPassword,
      refreshTokens,
      ...userWithoutPassword
    } = user.toObject();

    return res.status(201).json(userWithoutPassword);
  } catch (err) {
    return res.status(500).send("Something went wrong while registring");
  }
};

const googleSignin = async (req: Request, res: Response) => {
  const { access_token, email } = req.body;

  if (!access_token || !email) {
    return res.status(400).json({ error: "Missing access_token or email" });
  }

  try {
    // Verify the access_token by fetching user info from Google
    const googleResponse = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const googleUser = googleResponse.data;

    if (googleUser.email !== email) {
      return res.status(400).json({ error: "Email mismatch" });
    }

    // Find user in database or create new one
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        fullName: googleUser.name,
        email: googleUser.email,
        imageUrl: googleUser.picture,
        password: "google-signin",
      });
    }

    // Generate authentication tokens
    const tokens = await generateTokens(user);

    return res.status(200).json(tokens);
  } catch (error) {
    console.error("Google Sign-in Error:", error);
    return res.status(400).json({ error: "Invalid Google access token" });
  }
};

const generateTokens = async (user: Document & IUser) => {
  const accessToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: parseInt(process.env.JWT_EXPIRATION_MS),
  });
  const refreshToken = jwt.sign(
    { _id: user._id },
    process.env.JWT_REFRESH_SECRET
  );

  if (user.refreshTokens == null) {
    user.refreshTokens = [refreshToken];
  } else if (!user.refreshTokens.includes(refreshToken)) {
    user.refreshTokens.push(refreshToken);
  }

  await user.save();
  return {
    accessToken,
    refreshToken,
  };
};

const login = async (req: Request, res: Response) => {
  const email: string = req.body.email;
  const password: string = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Email or password is missing");
  }
  
  try {
    const user = await User.findOne({ email: email });
    if (user == null) {
      return res.status(400).send("Incorrect email or password");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).send("Incorrect email or password");
    }

    const tokens = await generateTokens(user);
    res.cookie("refresh", tokens.refreshToken, {
      httpOnly: true,
      path: "/auth",
    });
    res.cookie("access", tokens.accessToken, {
      httpOnly: true,
      maxAge: accessTokenExpiration,
    });

    return res.sendStatus(200);
  } catch (err) {
    return res.status(500).send("error while loging in");
  }
};

const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refresh;
  if (!refreshToken) return res.sendStatus(401);

  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET,
    async (err, user: { _id: string }) => {
      if (err) return res.sendStatus(401);

      try {
        const userDb = await User.findOne({ _id: user._id });
        userDb.refreshTokens = userDb.refreshTokens.filter((t) => t !== refreshToken);
        await userDb.save();
        res.clearCookie("refresh", { path: "/auth" });
        res.clearCookie("access");
        return res.sendStatus(200);
      } catch (err) {
        res.sendStatus(500).send(err.message);
      }
    }
  );
};

const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refresh;
  if (!refreshToken) return res.sendStatus(401);
  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET,
    async (err, user: { _id: string }) => {
      if (err) {
        console.log(err);
        return res.sendStatus(401);
      }
      try {
        const userDb = await User.findOne({ _id: user._id });
        if (
          !userDb.refreshTokens ||
          !userDb.refreshTokens.includes(refreshToken)
        ) {
          userDb.refreshTokens = [];
          await userDb.save();
          return res.sendStatus(401);
        }
        const accessToken = jwt.sign(
          { _id: user._id },
          process.env.JWT_SECRET,
          { expiresIn: parseInt(process.env.JWT_EXPIRATION_MS) }
        );
        const newRefreshToken = jwt.sign(
          { _id: user._id },
          process.env.JWT_REFRESH_SECRET
        );
        userDb.refreshTokens = userDb.refreshTokens.filter(
          (t) => t !== refreshToken
        );
        userDb.refreshTokens.push(newRefreshToken);
        await userDb.save();

        res.cookie("refresh", newRefreshToken, {
          httpOnly: true,
          path: "/auth",
        });
        res.cookie("access", accessToken, {
          httpOnly: true,
          maxAge: accessTokenExpiration,
        });
        return res.sendStatus(200);
      } catch (err) {
        res.status(401).send(err.message);
      }
    }
  );
};

export default {
  register,
  googleSignin,
  login,
  logout,
  refresh,
};
