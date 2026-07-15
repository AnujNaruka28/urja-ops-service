import { Request, Response } from "express";
import { urjaClient } from "../client/UrjaClient";
import { success } from "../utils/response";

export const getDTS = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const transformers = await urjaClient.getDTS(page);
    success(res, transformers);
};

