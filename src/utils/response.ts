
import { Response } from "express";

const success = <T>(res: Response, data: T) => {
    return res.status(200).json({
        success: true,
        data,
    });
};

const badRequest = (res: Response, error: string) => {
    return res.status(400).json({
        success: false,
        error,
    });
};

export {
    success,
    badRequest,
}
