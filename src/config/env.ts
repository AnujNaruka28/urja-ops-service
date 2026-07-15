import dotenv from "dotenv";

dotenv.config();

export const env = {
    URJA_API_BASE_URL: process.env.URJA_API_BASE_URL!,
    URJA_API_USERNAME: process.env.URJA_API_USERNAME!,
    URJA_API_PASSWORD: process.env.URJA_API_PASSWORD!,
    PORT: process.env.PORT!,
};
