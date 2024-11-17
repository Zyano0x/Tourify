import { Router } from "express";

import { Role } from "../models/User.model";
import {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/Review.controller";
import { protect, authorizeRoles } from "../middlewares/Auth.middleware";
import { setTourUserIds } from "../middlewares/Review.middleware";

const router = Router({ mergeParams: true });

router
  .route("/")
  .get(getAllReviews)
  .post(protect, authorizeRoles(Role.USER), setTourUserIds, createReview);
router
  .route("/:id")
  .get(protect, authorizeRoles(Role.MODERATOR, Role.ADMIN), getReview)
  .patch(
    protect,
    authorizeRoles(Role.USER, Role.MODERATOR, Role.ADMIN),
    updateReview,
  )
  .delete(
    protect,
    authorizeRoles(Role.USER, Role.MODERATOR, Role.ADMIN),
    deleteReview,
  );

export default router;
