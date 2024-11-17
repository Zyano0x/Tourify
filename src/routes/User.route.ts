import { Router } from "express";

import {
  signIn,
  signUp,
  forgotPassword,
  resetPassword,
  updatePassword,
} from "../controllers/Auth.controller";
import {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  deactivate,
} from "../controllers/User.controller";
import { authorizeRoles, protect } from "../middlewares/Auth.middleware";
import { profile } from "../middlewares/User.middleware";
import { Role } from "../models/User.model";

const router = Router();

router.post("/login", signIn);
router.post("/register", signUp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.use(protect);

router.get("/me", profile, getUser);
router.post("/update-password", updatePassword);
router.post("/deactivate", deactivate);

router.use(authorizeRoles(Role.MODERATOR, Role.ADMIN));

router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

export default router;
