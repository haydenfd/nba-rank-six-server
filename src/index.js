import express from 'express';
import cors from "cors";
import userRouter from "./routers/user_router.js";
import sessionRouter from "./routers/session_router.js";
import 'dotenv/config';
import mongoose from 'mongoose';
// import https from "https";
// import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT;

mongoose.connect(process.env.MONGODB_URI, {
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});

app.get('/', (req, res) => {
    res.send('Hello HTTP!');
  });


  
app.use('/users', userRouter); 
app.use('/session', sessionRouter)

app.listen(PORT, () => {
    console.log(`HTTPS Server running on port ${PORT}`);
});