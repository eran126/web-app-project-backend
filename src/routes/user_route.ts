import express from "express";
import UserController from "../controllers/user_controller";
import authMiddleware from "../common/auth_middleware";
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: The Users API
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
 * /user/connected:
 *   get:
 *     summary: Get connected user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Connected user data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized, user need to be signed in
 *       500:
 *         description: Unexpected error
 */

router.get(
  "/connected",
  authMiddleware,
  UserController.getConnected.bind(UserController)
);

/**
 * @swagger
 * /user:
 *   put:
 *     summary: Update the current user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "John Doe"
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/profile.jpg"
 *     responses:
 *       200:
 *         description: The user successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fullName:
 *                   type: string
 *                   example: "John Doe"
 *                 imageUrl:
 *                   type: string
 *                   format: uri
 *                   example: "https://example.com/profile.jpg"
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "user@example.com"
 *       400:
 *         description: Some parameters are missing or invalid
 *       401:
 *         description: Unauthorized, user needs to be signed in
 *       500:
 *         description: Unexpected error
 */

router.put("/", authMiddleware, UserController.putById.bind(UserController));

export default router;
