import express from "express";
const router = express.Router();
import authController from "../controllers/auth_controller";

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * tags:
 *     name: Auth
 *     description: The Authentication API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *      User:
 *        type: object
 *        required:
 *          - email
 *          - password
 *        properties:
 *          fullName:
 *            type: string
 *            description: The user full name
 *          email:
 *             type: string
 *             description: The user email
 *          password:
 *            type: string
 *            description: The user password
 *          imageUrl:
 *            type: string
 *            description: The user profile image url
 *        example:
 *          fullName: 'EranShir'
 *          email: 'EranShir@gmail.com'
 *          password: 'gg12345'
 *          imageUrl: 'https://www.google.com/image.png'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Tokens:
 *       type: object
 *       required:
 *         - accessToken
 *         - refreshToken
 *       properties:
 *         accessToken:
 *           type: string
 *           description: The JWT access token
 *         refreshToken:
 *           type: string
 *           description: The JWT refresh token
 *       example:
 *           accessToken: '555fg23x1tg6'
 *           refreshToken: '138d5555ch1x4f'
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: The user created successfully 
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Some parameters are missing or invalid
 *       500:
 *         description: Unexpected server error
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: Sign in with Google
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               access_token:
 *                 type: string
 *                 description: Google OAuth access token.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email from Google.
 *     responses:
 *       200:
 *         description: The user was successfully authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token for the user.
 *                 refreshToken:
 *                   type: string
 *                   description: JWT refresh token for the user.
 *       400:
 *         description: Missing or invalid parameters
 *       500:
 *         description: Internal server error
 */

router.post("/google", authController.googleSignin);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "EranShir@gmail.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "gg12345"
 *     responses:
 *       200:
 *         description: Successfully logged in. Tokens are set in cookies.
 *       400:
 *         description: Email or password is missing, or incorrect credentials.
 *       500:
 *         description: Unexpected server error.
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Log out a user
 *     tags: [Auth]
 *     description: Refresh token need to be in the auth header
 *     security:
 *        - bearerAuth: []
 *     responses:
 *       200:
 *         description: The user was logged out successfully 
 *       500:
 *         description: Unexpected server error
 */
router.get("/logout", authController.logout);

/**
 * @swagger
 * /auth/refresh:
 *   get:
 *     summary: Refresh authentication token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: The authentication token was refreshed successfully 
 *         content:
 *           application/json:
 *             schema:
*                $ref: '#/components/schemas/Tokens'
 *       401:
 *         description: Unauthorized- token is invalid or expired
 *       500:
 *         description: Unexpected server error
 */
router.get("/refresh", authController.refresh);

export default router;
