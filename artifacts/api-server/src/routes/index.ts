import { Router, type IRouter } from "express";
import healthRouter from "./health";
import gamesRouter from "./games";
import usersRouter from "./users";
import paymentsRouter from "./payments";

const router: IRouter = Router();

router.use(healthRouter);
router.use(gamesRouter);
router.use(usersRouter);
router.use(paymentsRouter);

export default router;
