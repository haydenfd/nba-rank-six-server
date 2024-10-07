import express from 'express';
import cors from "cors";
import userRouter from "./routers/user_router.js";
import sessionRouter from "./routers/session_router.js";
// import { MONGODB_URI } from './env.js';
import 'dotenv/config';
import mongoose from 'mongoose';

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

app.use('/users', userRouter); 
app.use('/session', sessionRouter)

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
