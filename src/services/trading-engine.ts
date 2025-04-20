import fs from "fs/promises";
import path from "path";
import { Order, OrderBook, OrderBookEntry, Trade } from "@/types";

export class TradingEngine {
  private orderBooks: Map<string, OrderBook> = new Map();
  private trades: Trade[] = [];
  private tradeIdCounter: number = 1;

  constructor() {}

  public async processOrdersFromFile(filePath: string): Promise<void> {
    try {
      const data = await fs.readFile(path.resolve(filePath), "utf8");
      const orders: Order[] = JSON.parse(data);
      for (const order of orders) {
        this.processOrder(order);
      }
    } catch (error) {
      console.error("Error processing orders file:", error);
      throw error;
    }
  }

  public processOrder(order: Order): void {
    if (order.type_op === "CREATE") {
      const amountNum = parseFloat(order.amount);
      const priceNum = parseFloat(order.limit_price);

      if (
        isNaN(amountNum) ||
        isNaN(priceNum) ||
        amountNum <= 0 ||
        priceNum <= 0
      ) {
        console.error(`Invalid order parameters: ${JSON.stringify(order)}`);
        return;
      }

      const remainingAmount = this.matchOrder(order, amountNum);

      if (remainingAmount > 0) {
        const remainingOrder: OrderBookEntry = {
          order_id: order.order_id,
          account_id: order.account_id,
          amount: remainingAmount.toFixed(8),
          limit_price: order.limit_price,
          side: order.side,
          pair: order.pair,
        };

        const orderBook = this.getOrderBook(order.pair);

        if (order.side === "BUY") {
          orderBook.bids.push(remainingOrder);
          orderBook.bids.sort((a, b) => {
            const priceDiff =
              parseFloat(b.limit_price) - parseFloat(a.limit_price);
            return priceDiff !== 0
              ? priceDiff
              : parseInt(a.order_id) - parseInt(b.order_id);
          });
        } else {
          orderBook.asks.push(remainingOrder);
          orderBook.asks.sort((a, b) => {
            const priceDiff =
              parseFloat(a.limit_price) - parseFloat(b.limit_price);
            return priceDiff !== 0
              ? priceDiff
              : parseInt(a.order_id) - parseInt(b.order_id);
          });
        }
      }
    } else if (order.type_op === "DELETE") {
      const orderBook = this.getOrderBook(order.pair);

      if (order.side === "BUY") {
        orderBook.bids = orderBook.bids.filter(
          (bid) => bid.order_id !== order.order_id
        );
      } else {
        orderBook.asks = orderBook.asks.filter(
          (ask) => ask.order_id !== order.order_id
        );
      }
    }
  }

  private matchOrder(order: Order, amount: number): number {
    let remainingAmount = amount;
    const isBuy = order.side === "BUY";
    const orderPrice = parseFloat(order.limit_price);

    const orderBook = this.getOrderBook(order.pair);

    const oppositeSide = isBuy ? orderBook.asks : orderBook.bids;

    while (remainingAmount > 0 && oppositeSide.length > 0) {
      const bestOrder = oppositeSide[0];
      const bestOrderPrice = parseFloat(bestOrder.limit_price);

      if (
        (isBuy && orderPrice >= bestOrderPrice) ||
        (!isBuy && orderPrice <= bestOrderPrice)
      ) {
        const bestOrderAmount = parseFloat(bestOrder.amount);
        const tradeAmount = Math.min(remainingAmount, bestOrderAmount);

        const trade: Trade = {
          trade_id: this.tradeIdCounter.toString(),
          buy_order_id: isBuy ? order.order_id : bestOrder.order_id,
          sell_order_id: isBuy ? bestOrder.order_id : order.order_id,
          amount: tradeAmount.toFixed(8),
          price: bestOrder.limit_price,
          pair: order.pair,
          timestamp: new Date().toISOString(),
        };

        this.trades.push(trade);
        this.tradeIdCounter++;

        if (tradeAmount < bestOrderAmount) {
          bestOrder.amount = (bestOrderAmount - tradeAmount).toFixed(8);
        } else {
          oppositeSide.shift();
        }

        remainingAmount -= tradeAmount;
      } else {
        break;
      }
    }

    return remainingAmount;
  }

  public async saveOrderBook(filePath: string): Promise<void> {
    try {
      const orderBooksObject: Record<string, OrderBook> = {};
      this.orderBooks.forEach((value, key) => {
        orderBooksObject[key] = value;
      });

      await fs.writeFile(
        path.resolve(filePath),
        JSON.stringify(orderBooksObject, null, 2),
        "utf8"
      );
    } catch (error) {
      console.error("Error saving orderbook:", error);
      throw error;
    }
  }

  public async saveTrades(filePath: string): Promise<void> {
    try {
      await fs.writeFile(
        path.resolve(filePath),
        JSON.stringify(this.trades, null, 2),
        "utf8"
      );
    } catch (error) {
      console.error("Error saving trades:", error);
      throw error;
    }
  }

  private getOrderBook(pair: string): OrderBook {
    if (!this.orderBooks.has(pair)) {
      this.orderBooks.set(pair, {
        bids: [],
        asks: [],
      });
    }
    return this.orderBooks.get(pair)!;
  }

  public getTrades(): Trade[] {
    return this.trades;
  }

  public reset(): void {
    this.orderBooks = new Map();
    this.trades = [];
    this.tradeIdCounter = 1;
  }

  public getOrderBooks(): Record<string, OrderBook> {
    return Object.fromEntries(this.orderBooks);
  }
}
