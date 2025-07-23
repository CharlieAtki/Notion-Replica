import express from "express";
import mongoose from "mongoose";
import cors from 'cors';
import dotenv from 'dotenv';
import session from "express-session";
import MongoStore from "connect-mongo";
import unAuthRoutes from "./routes/unAuthRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Step 1: Set up MongoDB connection
const mongoUri = process.env.MONGODB_URI || "mongodb+srv://charlie06atkinson:iLwdpmiA4cdZGDSK@erpdatabase.eolfh.mongodb.net/RecapProject?retryWrites=true&w=majority&appName=ERPDatabase";

mongoose.connect(mongoUri)
.then(() => {
  console.log('MongoDB connected successfully');
  console.log(`Connected to database: ${mongoose.connection.db.databaseName}`);
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit process with failure
});

// Trust proxy setting before other middleware
app.set('trust proxy', 1);

app.use(cors({
  origin: [
        'http://localhost:5173', // Local development
  ],
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie', 'Content-Type'],
  maxAge: 600,
  optionsSuccessStatus: 200
}));

// Session Configuration
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false, // Prevents unnecessary session updates
  saveUninitialized: false, // Only save sessions when they are initialized
  proxy: process.env.NODE_ENV === 'production', // Used in render hosting
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI, // MongoDB connection URL
    collectionName: 'sessions', // Collection to store session data
    ttl: 24 * 60 * 60, // Session expiration in seconds (e.g., 1 day)
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true, // Prevents JavaScript access to cookies
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Allow cross-origin in production
    maxAge: 24 * 60 * 60 * 1000, // Cookie expiration in milliseconds (e.g., 1 day)
    path: '/',
  },
  name: 'connect.sid', // Session cookie name
}));


// Step 2: Middleware to handle JSON data
app.use(express.json());

// Step 4: Start the Express server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

// Routes
app.use('/api/user-unAuth', unAuthRoutes) // Routes for unauthenticated users
app.use('/api/user-auth', userRoutes) // Routes for authenticated users
