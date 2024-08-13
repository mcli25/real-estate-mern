const express = require("express");
const app = express();
const cors = require("cors");
// const blogsRouter = require("./controllers/blogs");
const usersRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");
const logger = require("./utils/logger");
const config = require("./utils/config");
const mongoose = require("mongoose");
const {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
} = require("./utils/middleware");
const { userExtractor } = require("./utils/middleware");
const authRouter = require("./controllers/auth");
mongoose.set("strictQuery", false);

app.use(cors());
app.use(express.json());
app.use(tokenExtractor);
app.use(userExtractor);
// // app.use("/api/blogs", userExtractor, blogsRouter);
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);
app.use("/api/", authRouter);
app.use(requestLogger);
app.use(unknownEndpoint);
app.use(errorHandler);

const url = process.env.MONGODB_URI;

app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});

mongoose
  .connect(url)
  .then(() => {
    logger.info("connected to MongoDB");
  })
  .catch((error) => {
    logger.error("error connecting to MongoDB:", error.message);
  });

module.exports = app;
