import dotenv from "dotenv";
import { axiosRequest } from "../config/axios";
dotenv.config();

class UrjaClient {

    private baseUrl: string = process.env.URJA_API_BASE_URL!;
    private isAuthenticated: boolean = false;
    private sessionCookie: string | null = null;

    async login() {
        const response = await axiosRequest(
            this.baseUrl + "/login", 
            "POST", 
            {
                email: process.env.URJA_API_USERNAME!,
                password: process.env.URJA_API_PASSWORD!,
            },
            undefined,
            {
                "Content-Type": "application/x-www-form-urlencoded",
                "Origin": this.baseUrl,
            }
        );
        this.isAuthenticated = true;
        
        const cookie = response.headers["set-cookie"]?.at(0)?.split(";")[0];
        if (cookie) {
            this.sessionCookie = cookie;
        }
    }

    async getMeters(query: string, page: number) {
        if (!this.isAuthenticated) {
            await this.login();
        }
        const response = await axiosRequest(this.baseUrl + "/portal/meters/search", "GET", undefined, {
            q: query,
            page
        },
        {
            "Cookie": this.sessionCookie || ""
        });
        return response.data;
    }

    async getMeterById(meterId: string) {
        if (!this.isAuthenticated) {
            await this.login();
        }
        const response = await axiosRequest(this.baseUrl + `/meters/${meterId}/__data.json`, "GET",
            undefined,
            undefined,
            {
                "Cookie": this.sessionCookie || ""
            }
        );
        return response.data;
    }

    async getMeterEnergy(meterId: string) {
        if (!this.isAuthenticated) {
            await this.login();
        }
        const response = await axiosRequest(this.baseUrl + `/portal/meters/${meterId}/energy`, "GET",
            undefined,
            undefined,
            {
                "Cookie": this.sessionCookie || ""
            }
        );
        return response.data;
    }

    async getMeterGeolocation(meterId: string) {
        if (!this.isAuthenticated) {
            await this.login();
        }
        const response = await axiosRequest(this.baseUrl + `/portal/meters/${meterId}/geo`, "GET",
            undefined,
            undefined,
            {
                "Cookie": this.sessionCookie || ""
            }
        );
        return response.data;
    }

    async getDTS(page: number) {
        if (!this.isAuthenticated) {
            await this.login();
        }
        const response = await axiosRequest(this.baseUrl + "/portal/dts", "GET", undefined, {
            page: page,
        },
        {
            "Cookie": this.sessionCookie || ""
        });
        return response.data;
    }

}

export const urjaClient = new UrjaClient();
