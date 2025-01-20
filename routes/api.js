const express = require("express");
const passport = require("passport");
const { google } = require("googleapis");
const moment = require("moment");
const router = express.Router();

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Unauthorized" });
};

// Google OAuth Routes
router.get(
  "/auth/google",
  // https://www.googleapis.com/auth/calendar.readonly add this route in the scope of your google cloud project
  passport.authenticate("google", { scope: ["profile", "email", "https://www.googleapis.com/auth/calendar.readonly"] })
);

// router.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/" }),
//   (req, res) => res.redirect("/api/calendar/events")
// );

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const userId = req.user._id; // Or use a token if you implement JWT
    res.redirect(`https://google-calendar-frontend.vercel.app/dashboard?user=${userId}`);
  }
);


// Logout
router.get("/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err); // Handle the error if logout fails
    }
    res.json({ message: "Logged out" });
  });
});

// Google Calendar API with Pagination
router.get("/api/calendar/events", ensureAuthenticated, async (req, res) => {
    try {
      const { accessToken } = req.user;
  
      // Create an OAuth2 client
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });
  
      // Initialize Google Calendar API with the authenticated client
      const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  
      // Extract pagination token from query params
      const { pageToken } = req.query;
  
      // Fetch the calendar events
      const response = await calendar.events.list({
        calendarId: "primary", // User's primary calendar
        timeMin: new Date().toISOString(), // Events starting from now
        maxResults: 10,
        singleEvents: true,
        orderBy: "startTime",
        pageToken: pageToken || undefined, // Use pageToken if provided
      });
  
      // Process the events
      const events = response.data.items.map((event) => ({
        event_name: event.summary,
        date: event.start.date || event.start.dateTime.split("T")[0],
        time: event.start.dateTime ? event.start.dateTime.split("T")[1] : "All day",
        location: event.location || "N/A",
      }));
  
      // Send the response with pagination details
      res.json({
        events,
        nextPageToken: response.data.nextPageToken || null,
        prevPageToken: response.data.prevPageToken || null, // Note: `prevPageToken` is usually not provided by Google Calendar API
      });
    } catch (err) {
      console.error("Error fetching events:", err.message);
      res.status(500).json({ message: "Error fetching events", error: err.message });
    }
});
  
module.exports = router;
