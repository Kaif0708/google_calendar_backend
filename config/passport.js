const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const User = require("../models/user");

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID, // get the keys from google cloud
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find or create a user in the database
        const user = await User.findOneAndUpdate(
          { googleId: profile.id }, // Search by Google ID
          {
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            accessToken,
          },
          { upsert: true, new: true } // Create a new user if not found
        );
        return done(null, user); // Pass the user to Passport
      } catch (err) {
        return done(err, null); // Handle errors
      }
    }
  )
);

// Serialize the user into the session
passport.serializeUser((user, done) => done(null, user.id));

// Deserialize the user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id); // Use async/await to find the user
    done(null, user); // Pass the user object to the request
  } catch (err) {
    done(err, null); // Handle errors
  }
});

module.exports = passport;