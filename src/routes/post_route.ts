import express from "express";
const router = express.Router();
import PostController from "../controllers/post_controller";
import authMiddleware from "../common/auth_middleware";

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: The Posts API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *      Post:
 *        type: object
 *        properties:
 *          text:
 *            type: string
 *            description: The post itself
 *          image:
 *            type: string
 *            description: The post picture url
 *          author:
 *            type: string
 *            description: The post user Id
 *          timestamp:
 *            type: string
 *            description: The post upload time
 *          likes:
 *            type: array
 *            description: The post likes
 *          comments:
 *            type: array
 *            description: The post comments
 *          isLiked:
 *            type: boolean
 *            description: Is The post liked by the connected user
 *          likesCount:
 *            type: number 
 *            description: The post likes count
 *        example:
 *          text: 'This hamburger is very tasty'
 *          image: 'http://url.com'
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get posts with pagination (10 posts per page)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number to retrieve (default is 1)
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: A list of posts in the specified page
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentPage:
 *                   type: integer
 *                   description: The current page number
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized, user needs to be signed in
 *       500:
 *         description: Unexpected error
 */
router.get("/", authMiddleware, PostController.get.bind(PostController));

/**
  * @swagger
  * /posts/id/{id}:
  *   get:
  *     summary: Get a post by ID
  *     tags: [Posts]
  *     security:
  *       - bearerAuth: []
  *     parameters:
  *       - in: path
  *         name: id
  *         schema:
  *           type: string
  *         required: true
  *         description: ID of the post to retrieve
  *     responses:
  *       200:
  *         description: Post data
  *         content:
  *           application/json:
  *             schema:
  *               $ref: '#/components/schemas/Post'
  *       401:
  *         description: Unauthorized, user needs to be signed in
  *       404:
  *         description: Post not found
  *       500:
  *         description: Unexpected error
  */
 
router.get(
  "/id/:id",
  authMiddleware,
  PostController.getById.bind(PostController)
);

/**
 * @swagger
 * /posts/connectedUser:
 *   get:
 *     summary: Get posts by the connected user
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of posts by the connected user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized, user needs to be signed in
 *       500:
 *         description: Unexpected error
 */

router.get(
  "/connectedUser",
  authMiddleware,
  PostController.getByConnectedUser.bind(PostController)
);

/**
 * @swagger
 * /posts/like/{id}:
 *   get:
 *     summary: Like a post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the post to like
 *     responses:
 *       200:
 *         description: Post liked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized, user needs to be signed in
 *       404:
 *         description: Post not found
 *       500:
 *         description: Unexpected error
 */

router.get(
  "/like/:id",
  authMiddleware,
  PostController.like.bind(PostController)
);

/**
 * @swagger
 * /posts/unlike/{id}:
 *   get:
 *     summary: Unlike a post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the post to unlike
 *     responses:
 *       200:
 *         description: Post unliked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized, user needs to be signed in
 *       404:
 *         description: Post not found
 *       500:
 *         description: Unexpected error
 */

router.get(
  "/unlike/:id",
  authMiddleware,
  PostController.unlike.bind(PostController)
);

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       201:
 *         description: The post was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Some parameters are missing or invalid
 *       401:
 *         description: Unauthorized, user needs to be signed in
 *       500:
 *         description: Unexpected error
 */

router.post("/", authMiddleware, PostController.post.bind(PostController));

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update a post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the post to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       200:
 *         description: The post was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Some parameters are missing or invalid
 *       401:
 *         description: Unauthorized, user needs to be signed in
 *       404:
 *         description: Post not found
 *       500:
 *         description: Unexpected error
 */

router.put(
  "/:id",
  authMiddleware,
  PostController.putById.bind(PostController)
);

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the post to delete
 *     responses:
 *       200:
 *         description: The post was successfully deleted
 *       401:
 *         description: Unauthorized, user needs to be signed in
 *       404:
 *         description: Post not found
 *       500:
 *         description: Unexpected error
 */

router.delete(
  "/:id",
  authMiddleware,
  PostController.deleteById.bind(PostController)
);

export default router;
