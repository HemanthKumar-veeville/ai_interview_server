const express = require("express");
const cors = require("cors");
const uploadRoutes = require("./routes/uploadRoutes");
const mergeRoutes = require("./routes/mergeRoutes");
const filesRoutes = require("./routes/filesRoutes");
const downloadRoutes = require("./routes/downloadRoutes");
// const deleteRoutes = require("./routes/deleteRoutes");

const app = express();

// Configure CORS options
const corsOptions = {
  origin: function (origin, callback) {
    // Allow all origins
    callback(null, true);
  },
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Routes
app.use("/upload", uploadRoutes);
app.use("/merge", mergeRoutes);
app.use("/files", filesRoutes);
// app.use("/delete", deleteRoutes);
app.use("/download", downloadRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Backend is healthy" });
});

module.exports = app;
