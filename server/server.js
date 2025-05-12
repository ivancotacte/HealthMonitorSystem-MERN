import express from 'express';
import bodyParser from 'body-parser';
import { connectMongoDB, writeData } from './src/db/mongoConnection.js';
import moment from "moment-timezone";
import { v4 as uuidv4 } from "uuid";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from 'dotenv';
dotenv.config();

connectMongoDB();
const currentTime = moment().tz("Asia/Manila").format("YYYY-MM-DD-HH:mm:ss");
const PORT = process.env.PORT || 3000;
const app = express();

const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/api/v1/test', async (req, res) => {
    const { heartRate, SpO2, weight } = req.body;
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            success: false,
            message: 'Unauthorized access. Missing or invalid Authorization header.'
        });
    }

    const token = authHeader.split(' ')[1];

    if (!token || token !== process.env.API_KEY) {
        return res.status(401).json({ 
            success: false,
            message: 'Unauthorized access. Invalid token.'
        });
    }

    if (weight) {
        return res.status(200).json({
            success: true,
            message: 'Weight received successfully.',
            data: { weight }
        });
    }

    if (heartRate && SpO2) {
        return res.status(200).json({
            success: true,
            message: 'Heart rate and SpO2 received successfully.',
            data: { heartRate, SpO2 }
        });
    }

    return res.status(400).json({
        success: false,
        message: 'Invalid data. Please provide heart rate, SpO2, or weight.'
    });
});

app.post('/api/v1/users/register', async (req, res) => {
    const { firstName, lastName, email, age, contactNumber, gender } = req.body;

    if (!firstName || !lastName || !email || !age || !contactNumber || !gender) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required.'
        });
    }

    try {
        const userData = {
            userId: uuidv4(),
            data: {
                firstName,
                lastName,
                email,
                age,
                contactNumber,
                healthStatus: {
                    heartRate: null,
                    SpO2: null,
                    weight: null
                },
            },

            created_at: currentTime,
        }

        await writeData("users", userData);
        return res.status(201).json({
            success: true,
            message: 'User registered successfully.',
            data: userData
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: error.message
        });
    }
});

app.post('/api/v1/users/:id', async (req, res) => {
    const { id } = req.params;
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});