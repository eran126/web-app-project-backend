import express from "express";
import multer from "multer";
const router = express.Router();

const base = `http://${process.env.DOMAIN_BASE}:${process.env.PORT}/`;

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
 * /:
 *   post:
 *     summary: Upload a file
 *     tags: [File]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         description: The file to upload
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
