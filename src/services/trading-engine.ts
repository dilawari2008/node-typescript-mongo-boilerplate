// src/engine/tradingEngine.ts
import fs from "fs/promises";
import path from "path";
import { Order, OrderBook, OrderBookEntry, Trade } from "@/types";

export class TradingEngine {
  private orderBooks: Map<string, OrderBook> = new Map();
  private trades: Trade[] = [];
  private tradeIdCounter: number = 1;

  constructor() {}

  // Process a batch of orders from a file
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

  // Process a single order
  public processOrder(order: Order): void {
    if (order.type_op === "CREATE") {
      // Convert string values to numbers for calculations
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

      // Try to match the order
      const remainingAmount = this.matchOrder(order, amountNum);

      // If there's remaining amount, add to the orderbook
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
          // Sort bids by price (descending) and then by order_id (ascending) for tie-breaking
          orderBook.bids.sort((a, b) => {
            const priceDiff =
              parseFloat(b.limit_price) - parseFloat(a.limit_price);
            return priceDiff !== 0
              ? priceDiff
              : parseInt(a.order_id) - parseInt(b.order_id);
          });
        } else {
          orderBook.asks.push(remainingOrder);
          // Sort asks by price (ascending) and then by order_id (ascending) for tie-breaking
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
      // Remove order from the orderbook
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

  // Match an incoming order against the orderbook
  private matchOrder(order: Order, amount: number): number {
    let remainingAmount = amount;
    const isBuy = order.side === "BUY";
    const orderPrice = parseFloat(order.limit_price);

    // Get the orderbook for this specific trading pair
    const orderBook = this.getOrderBook(order.pair);

    // Select the appropriate side of the orderbook to match against
    const oppositeSide = isBuy ? orderBook.asks : orderBook.bids;

    // Continue matching until no more matches or the order is fully filled
    while (remainingAmount > 0 && oppositeSide.length > 0) {
      const bestOrder = oppositeSide[0];
      const bestOrderPrice = parseFloat(bestOrder.limit_price);

      // Check if the prices match for a trade to occur
      if (
        (isBuy && orderPrice >= bestOrderPrice) ||
        (!isBuy && orderPrice <= bestOrderPrice)
      ) {
        const bestOrderAmount = parseFloat(bestOrder.amount);
        const tradeAmount = Math.min(remainingAmount, bestOrderAmount);

        // Create a trade record
        const trade: Trade = {
          trade_id: this.tradeIdCounter.toString(),
          buy_order_id: isBuy ? order.order_id : bestOrder.order_id,
          sell_order_id: isBuy ? bestOrder.order_id : order.order_id,
          amount: tradeAmount.toFixed(8),
          price: bestOrder.limit_price, // Use the price of the existing order
          pair: order.pair,
          timestamp: new Date().toISOString(),
        };

        this.trades.push(trade);
        this.tradeIdCounter++;

        // Update the best order's remaining amount
        if (tradeAmount < bestOrderAmount) {
          bestOrder.amount = (bestOrderAmount - tradeAmount).toFixed(8);
        } else {
          // Remove the fully matched order
          oppositeSide.shift();
        }

        // Update the remaining amount for the current order
        remainingAmount -= tradeAmount;
      } else {
        // No more matches possible
        break;
      }
    }

    return remainingAmount;
  }

  // Save the current state of all orderbooks to a file
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

  // Save the trades to a file
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

  // Get or create order book for a specific pair
  private getOrderBook(pair: string): OrderBook {
    if (!this.orderBooks.has(pair)) {
      this.orderBooks.set(pair, {
        bids: [],
        asks: [],
      });
    }
    return this.orderBooks.get(pair)!;
  }

  // Get the list of trades
  public getTrades(): Trade[] {
    return this.trades;
  }

  // Reset the engine state
  public reset(): void {
    this.orderBooks = new Map();
    this.trades = [];
    this.tradeIdCounter = 1;
  }

  public getOrderBooks(): Record<string, OrderBook> {
    return Object.fromEntries(this.orderBooks);
  }
}
