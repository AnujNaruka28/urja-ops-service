import { Router } from "express";
import { getDTS } from "../controllers/transformers";

const dtsRouter = Router();

dtsRouter.get("/dts", getDTS);
export default dtsRouter;