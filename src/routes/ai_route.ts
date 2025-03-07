import express from "express";
const router = express.Router();
import aiController from "../controllers/ai_controller";

/**
 * @swagger
 * /ai/generatePost:
 *   post:
 *     summary: Generate AI content
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 example: "Write me a short post about hamburger recipe. only 3 lines."
 *     responses:
 *       200:
 *         description: Successfully generated content
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Bad request - Prompt is required
 *       500:
 *         description: Internal server error - Failed to generate content
 */
router.post("/generatePost", aiController.generatePost);

export default router;
