import express from "express";
import api from './Router/api.js'
import morgan from "morgan";

const app = express()


app.use('/api' , api)

app.use(morgan('combined'))

app.get("/", (req, res) => {
  res.send("API is running Render! 🤡🤡🤡");
});

app.listen(9000)

app.use(morgan('dev'))