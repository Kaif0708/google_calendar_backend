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
app.use(cors({
  origin: "*",
}))
app.use(express.json());
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
app.use(initializePassport.initialize());
app.use(initializePassport.session());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));


  
// Routes
app.use("/", apiRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
