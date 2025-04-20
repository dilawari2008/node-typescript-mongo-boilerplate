import TradeService from "@/services/trade";
import { Request, Response } from "express";

const executeTrade = async (req: Request, res: Response) => {
  await TradeService.executeTrade();
  res.sendOk();
};

const TradeController = {
  executeTrade,
};

export default TradeController;
