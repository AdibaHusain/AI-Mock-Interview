const dotenv = require('dotenv');
dotenv.config();
const express= require('express');
const cors = require('cors');
const connectDB = require('./config/db');


connectDB();

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",                  
    "https://mockmindai.vercel.app",         
    process.env.FRONTEND_URL                    
  ],
  credentials: true,
}));

//Middlewares
app.use(cors());
app.use(express.json());

//Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/interview", require("./routes/interviewRoutes"));

app.get('/', (req, res) => {
    res.send('Welcome to the AI Mock Interview API');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});