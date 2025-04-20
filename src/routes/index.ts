import TradeRouter from "@/routes/trade.router";
import { Express, Router } from "express";

// allows the router to inherit parameters from the parent router
const WrapperRouter = Router({ mergeParams: true });

WrapperRouter.get("/ping", (req, res) => {
  res.status(200).send("Ok");
});

// add more routes for each service
WrapperRouter.use("/trade", TradeRouter);

const InitRoutes = (app: Express) => {
  app.use("/api", WrapperRouter);
};

export default InitRoutes;
