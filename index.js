import dotenv from "dotenv";
dotenv.config();

import express from "express";
import api from './Router/api.js'
import morgan from "morgan";

const app = express()

const PORT = process.env.PORT || 9000;

app.use('/api/v1' , api)

app.use(morgan('combined'))

app.get("/", (req, res) => {
  res.send("API is running Render! 🤡🤡🤡");
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


app.use(morgan('dev'))