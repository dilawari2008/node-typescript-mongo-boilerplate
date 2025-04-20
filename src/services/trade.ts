import Config from "@/config";
import { TradingEngine } from "@/services/trading-engine";
import path from "path";

const executeTrade = async () => {
  try {
    console.log("Starting Trading Engine...");

    const engine = new TradingEngine();

    // Process orders from the input file
    const inputFile = path.join(__dirname, Config.ordersFile);
    await engine.processOrdersFromFile(inputFile);

    // Save the orderbook and trades to output files
    const orderBookFile = path.join(__dirname, Config.orderbookFile);
    const tradesFile = path.join(__dirname, Config.tradesFile);

    await engine.saveOrderBook(orderBookFile);
    await engine.saveTrades(tradesFile);

    console.log("Processing complete!");
    console.log(`Orderbook saved to: ${orderBookFile}`);
    console.log(`Trades saved to: ${tradesFile}`);

    // Display some stats
    const orderBook = engine.getOrderBook();
    const trades = engine.getTrades();

    console.log(`Total trades: ${trades.length}`);
    console.log(
      `Orders in book: ${orderBook.bids.length + orderBook.asks.length}`
    );
    console.log(`- Bids (buy orders): ${orderBook.bids.length}`);
    console.log(`- Asks (sell orders): ${orderBook.asks.length}`);
  } catch (error) {
    console.error("An error occurred:", error);
    process.exit(1);
  }
};

const TradeService = {
  executeTrade,
};

export default TradeService;
