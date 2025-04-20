import { TradingEngine } from "../services/trading-engine";
import { Order } from "../types";

describe("Trading Engine", () => {
  let engine: TradingEngine;

  beforeEach(() => {
    engine = new TradingEngine();
  });

  test("should match buy and sell orders of the same pair", () => {
    // Order books should be empty initially
    expect(Object.keys(engine.getOrderBooks()).length).toBe(0);

    // Create a sell order
    const sellOrder: Order = {
      order_id: "1",
      account_id: "acc1",
      type_op: "CREATE",
      side: "SELL",
      amount: "10.0",
      limit_price: "100.0",
      pair: "BTC/USD",
    };

    engine.processOrder(sellOrder);

    // Order should be added to the orderbook
    const orderBooks = engine.getOrderBooks();
    expect(Object.keys(orderBooks).length).toBe(1);
    expect(orderBooks["BTC/USD"].asks.length).toBe(1);
    expect(orderBooks["BTC/USD"].bids.length).toBe(0);

    // Create a matching buy order
    const buyOrder: Order = {
      order_id: "2",
      account_id: "acc2",
      type_op: "CREATE",
      side: "BUY",
      amount: "5.0",
      limit_price: "100.0",
      pair: "BTC/USD",
    };

    engine.processOrder(buyOrder);

    // Check that the trade was created
    const trades = engine.getTrades();
    expect(trades.length).toBe(1);
    expect(trades[0].buy_order_id).toBe("2");
    expect(trades[0].sell_order_id).toBe("1");
    expect(trades[0].amount).toBe("5.00000000");
    expect(trades[0].price).toBe("100.0");
    expect(trades[0].pair).toBe("BTC/USD");

    // Check that the sell order was partially filled
    expect(orderBooks["BTC/USD"].asks.length).toBe(1);
    expect(orderBooks["BTC/USD"].asks[0].amount).toBe("5.00000000");

    // Buy order should be fully matched, so it's not in the book
    expect(orderBooks["BTC/USD"].bids.length).toBe(0);
  });

  test("orders of different pairs don't match and go to separate order books", () => {
    // Create a sell order for BTC/USD
    const sellOrderBtc: Order = {
      order_id: "1",
      account_id: "acc1",
      type_op: "CREATE",
      side: "SELL",
      amount: "10.0",
      limit_price: "100.0",
      pair: "BTC/USD",
    };

    // Create a buy order for ETH/USD
    const buyOrderEth: Order = {
      order_id: "2",
      account_id: "acc2",
      type_op: "CREATE",
      side: "BUY",
      amount: "5.0",
      limit_price: "100.0",
      pair: "ETH/USD",
    };

    engine.processOrder(sellOrderBtc);
    engine.processOrder(buyOrderEth);

    // Check that both orders are in their respective order books
    const orderBooks = engine.getOrderBooks();
    expect(Object.keys(orderBooks).length).toBe(2);

    // BTC/USD order book should have the sell order
    expect(orderBooks["BTC/USD"].asks.length).toBe(1);
    expect(orderBooks["BTC/USD"].bids.length).toBe(0);

    // ETH/USD order book should have the buy order
    expect(orderBooks["ETH/USD"].asks.length).toBe(0);
    expect(orderBooks["ETH/USD"].bids.length).toBe(1);

    // No trades should have been executed
    expect(engine.getTrades().length).toBe(0);
  });

  test("multiple pairs matching properly", () => {
    // BTC/USD pair orders
    const btcSellOrder: Order = {
      order_id: "1",
      account_id: "acc1",
      type_op: "CREATE",
      side: "SELL",
      amount: "2.0",
      limit_price: "20000.0",
      pair: "BTC/USD",
    };

    const btcBuyOrder: Order = {
      order_id: "2",
      account_id: "acc2",
      type_op: "CREATE",
      side: "BUY",
      amount: "2.0",
      limit_price: "20000.0",
      pair: "BTC/USD",
    };

    // ETH/USD pair orders
    const ethSellOrder: Order = {
      order_id: "3",
      account_id: "acc3",
      type_op: "CREATE",
      side: "SELL",
      amount: "10.0",
      limit_price: "1500.0",
      pair: "ETH/USD",
    };

    const ethBuyOrder: Order = {
      order_id: "4",
      account_id: "acc4",
      type_op: "CREATE",
      side: "BUY",
      amount: "5.0",
      limit_price: "1500.0",
      pair: "ETH/USD",
    };

    // Process all orders
    engine.processOrder(btcSellOrder);
    engine.processOrder(ethSellOrder);
    engine.processOrder(btcBuyOrder);
    engine.processOrder(ethBuyOrder);

    // Check trades
    const trades = engine.getTrades();
    expect(trades.length).toBe(2);

    // Verify BTC/USD trade
    const btcTrade = trades.find((t) => t.pair === "BTC/USD");
    expect(btcTrade).toBeDefined();
    expect(btcTrade!.amount).toBe("2.00000000");

    // Verify ETH/USD trade
    const ethTrade = trades.find((t) => t.pair === "ETH/USD");
    expect(ethTrade).toBeDefined();
    expect(ethTrade!.amount).toBe("5.00000000");

    // Check order books
    const orderBooks = engine.getOrderBooks();

    // BTC/USD orders should be fully matched (empty book)
    expect(orderBooks["BTC/USD"].asks.length).toBe(0);
    expect(orderBooks["BTC/USD"].bids.length).toBe(0);

    // ETH/USD should have remaining sell order
    expect(orderBooks["ETH/USD"].asks.length).toBe(1);
    expect(orderBooks["ETH/USD"].asks[0].amount).toBe("5.00000000");
    expect(orderBooks["ETH/USD"].bids.length).toBe(0);
  });

  test("delete orders from specific pairs", () => {
    // Add orders to both pairs
    const btcOrder: Order = {
      order_id: "1",
      account_id: "acc1",
      type_op: "CREATE",
      side: "BUY",
      amount: "1.0",
      limit_price: "20000.0",
      pair: "BTC/USD",
    };

    const ethOrder: Order = {
      order_id: "2",
      account_id: "acc2",
      type_op: "CREATE",
      side: "BUY",
      amount: "10.0",
      limit_price: "1500.0",
      pair: "ETH/USD",
    };

    engine.processOrder(btcOrder);
    engine.processOrder(ethOrder);

    // Verify both orders are in their respective books
    const orderBooksBefore = engine.getOrderBooks();
    expect(orderBooksBefore["BTC/USD"].bids.length).toBe(1);
    expect(orderBooksBefore["ETH/USD"].bids.length).toBe(1);

    // Delete BTC/USD order
    const deleteOrder: Order = {
      order_id: "1",
      type_op: "DELETE",
      side: "BUY",
      pair: "BTC/USD",
    } as Order;

    engine.processOrder(deleteOrder);

    // Verify only BTC/USD order is deleted
    const orderBooksAfter = engine.getOrderBooks();
    expect(orderBooksAfter["BTC/USD"].bids.length).toBe(0);
    expect(orderBooksAfter["ETH/USD"].bids.length).toBe(1);
  });

  test("reset clears all order books", () => {
    // Add orders to both pairs
    const btcOrder: Order = {
      order_id: "1",
      account_id: "acc1",
      type_op: "CREATE",
      side: "BUY",
      amount: "1.0",
      limit_price: "20000.0",
      pair: "BTC/USD",
    };

    const ethOrder: Order = {
      order_id: "2",
      account_id: "acc2",
      type_op: "CREATE",
      side: "BUY",
      amount: "10.0",
      limit_price: "1500.0",
      pair: "ETH/USD",
    };

    engine.processOrder(btcOrder);
    engine.processOrder(ethOrder);

    // Verify orders are in their books
    const orderBooksBefore = engine.getOrderBooks();
    expect(Object.keys(orderBooksBefore).length).toBe(2);

    // Reset the engine
    engine.reset();

    // Check that all order books are cleared
    const orderBooksAfter = engine.getOrderBooks();
    expect(Object.keys(orderBooksAfter).length).toBe(0);
    expect(engine.getTrades().length).toBe(0);
  });
});
