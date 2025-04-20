import Config from "@/config";
import { TradingEngine } from "@/services/trading-engine";
import path from "path";
import fs from "fs/promises";

const executeTrade = async () => {
  try {
    console.log("Starting Trading Engine...");

    const engine = new TradingEngine();

    // Process orders from the input file
    const inputFile = path.join(__dirname, Config.ordersFile);
    await engine.processOrdersFromFile(inputFile);

    // Get orderbooks and trades
    const orderBooks = engine.getOrderBooks();
    const trades = engine.getTrades();

    // Create separate files for each trading pair
    for (const [pair, orderBook] of Object.entries(orderBooks)) {
      // Create sanitized pair name for filenames (replace / with _)
      const pairFileName = pair.replace('/', '_');
      
      // Generate pair-specific filenames
      const pairOrderBookFile = path.join(__dirname, `${Config.orderbookFile}_${pairFileName}.json`);
      const pairTradesFile = path.join(__dirname, `${Config.tradesFile}_${pairFileName}.json`);
      
      // Filter trades for this specific pair
      const pairTrades = trades.filter(trade => trade.pair === pair);
      
      // Save pair-specific orderbook and trades
      await fs.writeFile(pairOrderBookFile, JSON.stringify(orderBook, null, 2));
      await fs.writeFile(pairTradesFile, JSON.stringify(pairTrades, null, 2));
      
      console.log(`Orderbook for ${pair} saved to: ${pairOrderBookFile}`);
      console.log(`Trades for ${pair} saved to: ${pairTradesFile}`);
    }

    // Also save the complete orderbook and trades files
    const orderBookFile = path.join(__dirname, Config.orderbookFile + '.json');
    const tradesFile = path.join(__dirname, Config.tradesFile + '.json');

    await engine.saveOrderBook(orderBookFile);
    await engine.saveTrades(tradesFile);

    console.log("Processing complete!");
    console.log(`Complete orderbook saved to: ${orderBookFile}`);
    console.log(`Complete trades saved to: ${tradesFile}`);

    // Display some stats
    console.log(`Total trades: ${trades.length}`);

    let totalOrders = 0;
    console.log("Orders by trading pair:");

    Object.entries(orderBooks).forEach(([pair, orderBook]) => {
      const pairTotal = orderBook.bids.length + orderBook.asks.length;
      totalOrders += pairTotal;

      console.log(`- ${pair}: ${pairTotal} orders`);
      console.log(`  - Bids (buy orders): ${orderBook.bids.length}`);
      console.log(`  - Asks (sell orders): ${orderBook.asks.length}`);
    });

    console.log(`Total orders in book: ${totalOrders}`);
  } catch (error) {
    console.error("An error occurred:", error);
    process.exit(1);
  }
};

const TradeService = {
  executeTrade,
};

export default TradeService;
