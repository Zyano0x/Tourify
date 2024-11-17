import { Router } from "express";

import { Role } from "../models/User.model";
import {
  createTour,
  deleteTour,
  getAllTours,
  getMonthlyPlan,
  getTour,
  getTourStats,
  updateTour,
} from "../controllers/Tour.controller";
import reviewRoutes from "../routes/Review.route";
import { protect, authorizeRoles } from "../middlewares/Auth.middleware";
import { aliasTopTours } from "../middlewares/Tour.middleware";

const router = Router();

router.use("/:id/reviews", reviewRoutes);

router.route("/top-5-cheapest").get(aliasTopTours, getAllTours);
router
  .route("/tour-stats")
  .get(protect, authorizeRoles(Role.MODERATOR, Role.ADMIN), getTourStats);
router
  .route("/monthly-plan/:year")
  .get(protect, authorizeRoles(Role.MODERATOR, Role.ADMIN), getMonthlyPlan);

router
  .route("/")
  .get(getAllTours)
  .post(protect, authorizeRoles(Role.MODERATOR, Role.ADMIN), createTour);

router
  .route("/:id")
  .get(getTour)
  .delete(protect, authorizeRoles(Role.MODERATOR, Role.ADMIN), deleteTour)
  .patch(protect, authorizeRoles(Role.MODERATOR, Role.ADMIN), updateTour);

export default router;
