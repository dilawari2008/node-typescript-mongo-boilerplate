import AuthRouter from "@/routes/auth.router";
import UserRouter from "@/routes/user.router";
import { Express, Router } from "express";

// allows the router to inherit parameters from the parent router
const WrapperRouter = Router({ mergeParams: true });

WrapperRouter.get("/ping", (req, res) => {
  res.status(200).send("Ok");
});

// add more routes for each service
WrapperRouter.use("/auth", AuthRouter);
WrapperRouter.use("/users", UserRouter);

const InitRoutes = (app: Express) => {
  app.use("/api", WrapperRouter);
};

export default InitRoutes;
