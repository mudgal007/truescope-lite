import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./env";
import auth from "./routes/auth";
import { requireAuth } from "./middleware/auth";
import claims from "./routes/claims";


export const app = express();
app.use(helmet());
app.use(cors({origin: env.CLIENT_ORIGIN}));
app.use(express.json({limit:'1mb'}));
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use('/api/auth', auth);
app.use('/api/users', requireAuth);
app.use('/api/claims',claims)   



