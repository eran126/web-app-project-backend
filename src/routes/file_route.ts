import express from "express";
import multer from "multer";
const router = express.Router();

const base =
  process.env.NODE_ENV !== "production"
    ? `http://${process.env.DOMAIN_BASE}:${process.env.PORT}/`
    : `https://${process.env.DOMAIN_BASE}:${process.env.HTTPS_PORT}/`;

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, "public/");
  },
  filename: function (_req, file, cb) {
    const ext = file.originalname.split(".").filter(Boolean).slice(1).join(".");
    cb(null, Date.now() + "." + ext);
  },
});
const upload = multer({ storage: storage });

/**
 * @swagger
 * tags:
 *   name: File
 *   description: The Files API
 */

/**
 * @swagger
 * /file:
 *   post:
 *     summary: Upload a file
 *     tags: [File]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload
 *     responses:
 *       200:
 *         description: The file was uploaded successfully 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *       400:
 *         description: File was not provided
 *       500:
 *         description: Unexpected server error
 */

router.post("/", upload.single("file"), (req, res) => {
  res.status(200).send({ url: base + (req as any).file.path });
});
export = router;
