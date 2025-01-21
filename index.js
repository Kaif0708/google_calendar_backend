require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const apiRoutes = require("./routes/api");
const initializePassport = require("./config/passport");
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
// app.use(cors({
//   origin: "*",
// }))
app.use(cors({
  origin: 'https://google-calendar-frontend.vercel.app', // Replace with your frontend URL 
  credentials: true,// Allow sending cookies and authentication tokens
}));
app.use(express.json());
// app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // Only set to true with HTTPS
    httpOnly: true,
    sameSite: 'lax',
  },
}));
app.use(initializePassport.initialize());
app.use(initializePassport.session());

// MongoDB connection
var status = ''

mongoose
    .connect(process.env.MONGO_URI)
    .then(()=> {
        console.log('Connected to mongodb')
        status = 'connected'
    })
    .catch((error)=>{
        console.error('Failed to connect : ', error)
        status = 'unable to connect'
    })

app.get('/api/message', (req, res) => {
    const message = {
        message: 'Hello, we reached a server and db',
        timestamp: new Date().toISOString(),
        status,
    };
    res.json(message);
});
  
// Routes
app.use("/", apiRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
