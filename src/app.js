const express = require("express");
const cors = require("cors");
const uploadRoutes = require("./routes/uploadRoutes");
const mergeRoutes = require("./routes/mergeRoutes");
// const filesRoutes = require("./routes/filesRoutes");
// const deleteRoutes = require("./routes/deleteRoutes");
// const downloadRoutes = require("./routes/downloadRoutes");

const app = express();

// Configure CORS options
const corsOptions = {
  origin: "http://localhost:8080", // Replace with your frontend's origin
  methods: "GET,POST,PUT,DELETE,OPTIONS", // Allowed HTTP methods
  allowedHeaders: "Content-Type,Authorization", // Allowed request headers
  credentials: true, // Allow cookies or authentication headers
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Routes
app.use("/upload", uploadRoutes);
app.use("/merge", mergeRoutes);
// app.use("/files", filesRoutes);
// app.use("/delete", deleteRoutes);
// app.use("/download", downloadRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Backend is healthy" });
});

module.exports = app;
