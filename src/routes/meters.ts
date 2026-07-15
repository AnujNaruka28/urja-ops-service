import { Router } from "express";
import { getMeters, getMetersById } from "../controllers/meters";

const meterRouter = Router();

meterRouter.get("/meters", getMeters);
meterRouter.get("/meters/:id", getMetersById);

export default meterRouter;