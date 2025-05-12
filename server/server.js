import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import bodyParser from 'body-parser';
import { connectMongoDB, writeData, updateData, readData, refreshData } from './src/db/mongoConnection.js';
import moment from 'moment-timezone';
import { v4 as uuidv4 } from 'uuid';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
connectMongoDB();
const currentTime = moment().tz('Asia/Manila').format('YYYY-MM-DD-HH:mm:ss');
const PORT = process.env.PORT || 3000;
const app = express();
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, { cors: { origin: process.env.FRONTEND_URL, credentials: true } });

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/api/v1/test', async (req, res) => {
  const { heartRate, SpO2, weight } = req.body;
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized access. Missing or invalid Authorization header.' });
  }
  const token = authHeader.split(' ')[1];
  if (!token || token !== process.env.API_KEY) {
    return res.status(401).json({ success: false, message: 'Unauthorized access. Invalid token.' });
  }

    if (weight) {
      const payload = { weight, timestamp: new Date().toISOString() };
      io.emit('healthData', payload);
        return res.status(200).json({
            success: true,
            message: 'Weight received successfully.',
            weight
        });
    }

    if (heartRate && SpO2) {
        const payload = { heartRate, SpO2, timestamp: new Date().toISOString() };
        io.emit('healthData', payload);
        return res.status(200).json({
            success: true,
            message: 'Heart rate and SpO2 received successfully.',
            heartRate,
            SpO2
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
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }
  try {
    const userData = {
      userId: uuidv4(),
      data: { firstName, lastName, email, age, contactNumber, healthStatus: { heartRate: null, SpO2: null, weight: null } },
      created_at: currentTime,
      updated_at: currentTime
    };
    await writeData('users', userData);
    await refreshData();
    return res.status(201).json({ success: true, message: 'User registered successfully.', data: userData });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

app.post('/api/v1/users/:userId', async (req, res) => {
  const { userId } = req.params;
  const { heartRate, SpO2, weight } = req.body;
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized access. Missing or invalid Authorization header.' });
  }
  const token = authHeader.split(' ')[1];
  if (!token || token !== process.env.API_KEY) {
    return res.status(401).json({ success: false, message: 'Unauthorized access. Invalid token.' });
  }
  try {
    const user = await readData('users', { userId });
    const userExists = user.some((u) => u.userId === userId);
    if (!userExists) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const existing = user[0];
    const updatedData = {
      data: {
        firstName: existing.data.firstName,
        lastName: existing.data.lastName,
        email: existing.data.email,
        age: existing.data.age,
        contactNumber: existing.data.contactNumber,
        healthStatus: {
          heartRate: heartRate || existing.data.healthStatus.heartRate,
          SpO2: SpO2 || existing.data.healthStatus.SpO2,
          weight: weight || existing.data.healthStatus.weight
        }
      },
      created_at: existing.created_at,
      updated_at: currentTime
    };
    await updateData('users', { userId }, updatedData);
    await refreshData();
    return res.status(200).json({ success: true, message: 'User data updated successfully.', data: updatedData });
  } catch (error) {
    console.error('Error updating user data:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

httpServer.listen(PORT, () => {
  console.log(`Server (with Socket.IO) is running on port ${PORT}`);
});
