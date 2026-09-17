import express from "express";
import { envVarible } from "./config/envCustom";
import { appRouter } from "./routes";

const app = express();
const port = envVarible.Port;

app.use(express.json());
app.use(appRouter);

app.listen(port, () => {
  console.log(`This app is listening on PORT: ${port}`);
});
