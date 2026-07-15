import express from "express";
import { env } from "./config/env";
import dtsRouter from "./routes/transformers";
import meterRouter from "./routes/meters";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../openapi.json";

const app = express();

const PORT = env.PORT;

app.use(express.json());

app.use("/api", meterRouter);
app.use("/api", dtsRouter);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
