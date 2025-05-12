import dotenv from 'dotenv';
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import expressLayouts from "express-ejs-layouts";
import connectToDatabase from "./db/connection.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000; // Middleware

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectToDatabase();

// Set up EJS as the view engine with layouts
app.set("view engine", "ejs");
app.set("views", join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layouts/main");

// Serve static files
app.use(express.static(join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
import indexRoutes from "./routes/index.js";
import jobRoutes from "./routes/jobs.js";
import advertsRoutes from "./routes/adverts.js";
import thriftRoutes from "./routes/market.js";
import newsRoutes from "./routes/news.js";
import eventsRoutes from "./routes/events.js";
import servicesRoutes from "./routes/services.js";
import housingRoutes from "./routes/housing.js";
import waitlistRoutes from "./routes/waitlist.js";
import pagesRoutes from "./routes/pages.js";
import mailingRoutes from "./routes/mailing.js";

// Use routes
app.use("/", indexRoutes);
app.use("/jobs", jobRoutes);
app.use("/adverts", advertsRoutes);
app.use("/market", thriftRoutes);
app.use("/news", newsRoutes);
app.use("/events", eventsRoutes);
app.use("/services", servicesRoutes);
app.use("/housing", housingRoutes);
app.use("/waitlist", waitlistRoutes);
app.use("/city", pagesRoutes);
app.use("/mailing", mailingRoutes);

// Admins
// Import admin routes
import jobAdminRoutes from "./routes/adminJobRoutes.js";

app.use("/admin/jobs", jobAdminRoutes);


// Utilities
import storageRoutes from "./routes/storage.js"
app.use("/storage", storageRoutes); // Mount the /api/set-storage route

// 404 handler
app.use((req, res) => {
  res.status(404).render("404", {
    title: "Page Not Found - City",
    layout: "layouts/main",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("error", {
    title: "Error - City",
    error: err,
    layout: "layouts/main",
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

