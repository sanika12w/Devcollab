require("dotenv").config();
const express=require("express");
const cors = require("cors");
const connectDB=require("./config/db");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");

const app=express();
connectDB();

// Middleware
app.use(cors());    
app.use(express.json());

const protect = require("./middleware/authMiddleware");

const authRoutes = require("./routes/authRoutes");

const PORT = process.env.PORT || 5000;
app.get("/protected", protect, (req, res) => {
  res.json({ message: "You accessed protected route", userId: req.user });
});
console.log("projectRoutes:", projectRoutes);
console.log("taskRoutes:", taskRoutes);
console.log("userRoutes:", userRoutes);
console.log("authRoutes:", authRoutes);
app.use("/users", userRoutes);
app.use("/user", authRoutes);
app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});