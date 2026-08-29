import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import {
  uploadDocument,
  getDocument,
} from "./documents.controller";

const router = Router();

const uploadDirectory =
  path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (
    _req,
    _file,
    callback
  ) => {
    callback(null, uploadDirectory);
  },

  filename: (
    _req,
    file,
    callback
  ) => {
    const uniqueName =
      `${Date.now()}-${file.originalname}`;

    callback(null, uniqueName);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.post(
  "/upload",
  upload.single("file"),
  uploadDocument
);

router.get(
  "/:id",
  getDocument
);

export { router as documentRoutes };