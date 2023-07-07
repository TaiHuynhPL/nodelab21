const express = require("express");

const cors = require("cors");
const mongoose = require("mongoose");
const cookieParse = require("cookie-parser");
const env = require("dotenv");
env.config();
const compression = require("compression");

const app = express();

const PORT = process.env.PORT;

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParse());
app.use(express.static(__dirname + "/upload"));
app.use(compression());

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

app.use((err, req, res, next) => {
  const status = err?.statusCode || 500;
  const message = err?.message || "Something went wrong!";
  const data = err?.data;
  res.status(status).json({ message: message, data: data, isError: true });
});

mongoose
  .connect(process.env.MONGGODB)
  .then((result) => {
    console.log("Connect mongose success");
    const server = app.listen(PORT, () => {
      console.log(`Server is running PORT ${PORT}`);
    });
    const io = require("./socket").init(server);
    io.on("connection", (socket) => {
      console.log("Client connected " + socket.id);

      socket.on("disconnect", () => {
        console.log(socket.id + " disconnected");
      });
    });
  })
  .catch((err) => console.log(err));
