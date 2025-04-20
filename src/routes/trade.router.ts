import { forwardRequest } from "@/common";
import TradeController from "@/controllers/trade";
import { verifyJwt } from "@/middlewares";

import { Router } from "express";

const TradeRouter = Router({ mergeParams: true });

TradeRouter.post("/execute", forwardRequest(TradeController.executeTrade));

export default TradeRouter;
