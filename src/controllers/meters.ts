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

    const organizedMeterDetails = meterDetails.nodes[meterDetails.nodes.length-1].data;
    
    // Resolve SvelteKit indexed references
    const resolveRef = (ref: any, dataArray: any[]): any => {
        if (typeof ref === 'number' && ref > 0 && ref < dataArray.length) {
            return dataArray[ref];
        }
        return ref;
    };

    const formatMeterDetails = (data: any[]): any => {
        if (!Array.isArray(data)) return data;
        
        const result: any = {};
        let i = 0;
        
        while (i < data.length) {
            const item = data[i];
            
            if (typeof item === 'object' && item !== null) {
                if ('parameterName' in item && 'parameterValue' in item) {
                    const paramName = resolveRef(item.parameterName, data);
                    const paramValue = resolveRef(item.parameterValue, data);
                    result[paramName] = paramValue;
                    i += 2;
                    continue;
                }
                
                if (typeof item === 'object' && !Array.isArray(item)) {
                    const keys = Object.keys(item);
                    const formatted: any = {};
                    for (const key of keys) {
                        formatted[key] = resolveRef(item[key], data);
                    }
                    Object.assign(result, formatted);
                    i++;
                    continue;
                }
            }
            
            i++;
        }
        
        return result;
    };

    const formattedMeterDetails = formatMeterDetails(organizedMeterDetails);

    const aggregatedData = {
        meterDetails: formattedMeterDetails,
        energy: energy.data,
        geolocation: geolocation.data
    };

    success(res, aggregatedData);
};

export {
    getMeters,
    getMetersById,
}