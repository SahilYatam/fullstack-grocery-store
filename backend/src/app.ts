import dotenv from "dotenv";
import cors from "cors"
import express, { Express, Request, Response, NextFunction } from "express";
import authRouter from "./routes/auth.routes";
dotenv.config() 

let app: Express | null = null;

app = express();

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
    res.send({"Status": "OK"});
})

app.use("/api/auth", authRouter)

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    console.error(error)
    res.status(500).json({message: error.message})
})

export {app};

