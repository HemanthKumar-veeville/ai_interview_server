const app = require("./app");
const dotenv = require("dotenv");
const { connectDB } = require("./config/database");

dotenv.config();

// Connect to PostgreSQL
connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
