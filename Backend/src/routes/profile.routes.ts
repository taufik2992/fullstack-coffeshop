import { Router } from "express";
import { ProfileController } from "../controllers/profile.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validator.middleware";
import { apiRateLimiter } from "../middlewares/rateLimiter";
import { uploadSingle } from "../utils/multer";
import { updateProfileSchema } from "../validators/profile.validator";

const router = Router();
const profileController = new ProfileController();

router.get("/", authenticate, apiRateLimiter, profileController.getProfile);
router.put(
  "/",
  authenticate,
  apiRateLimiter,
  uploadSingle,
  validate(updateProfileSchema),
  profileController.updateProfile
);

export default router;
