import express from "express";
import mongoose from "mongoose";
import api from './Router/api.js'
import morgan from "morgan";

const app = express()

mongoose.connect('mongodb://localhost/practice')


app.use('/api' , api)

app.use(morgan('combined'))

app.get("/", (req, res) => {
  res.send("API is running Render! 🤡🤡🤡");
});

app.listen(9000)

app.use(morgan('dev'))