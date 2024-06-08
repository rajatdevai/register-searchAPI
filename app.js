import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import compression from 'compression';
import { register, searchUsers } from './controller/auth.js';

const app = express();

app.use(cors({
  credentials: true,
  origin: 'http://localhost:3000' // Adjust based on your front-end setup
}));
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

// Register API
app.post('/api/register', register);

// Search API
app.get('/api/search', searchUsers);

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
