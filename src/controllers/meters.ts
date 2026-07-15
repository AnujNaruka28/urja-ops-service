import { Request, Response } from "express";
import { urjaClient } from "../client/UrjaClient";
import { badRequest, success } from "../utils/response";

const getMeters = async (req: Request, res: Response) => {
    const { q, page } = req.query;
    const meters = await urjaClient.getMeters((q as string) || "", Number(page) || 1);
    success(res, meters);
};

const getMetersById = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
        return badRequest(res, "Meter ID is required");
    }
    const meterId = String(id);
    
    const [meterDetails, energy, geolocation] = await Promise.all([
        urjaClient.getMeterById(meterId),
        urjaClient.getMeterEnergy(meterId),
        urjaClient.getMeterGeolocation(meterId)
    ]);

    const aggregatedData = {
        ...meterDetails,
        energy,
        geolocation
    };

    success(res, aggregatedData);
};

export {
    getMeters,
    getMetersById,
}