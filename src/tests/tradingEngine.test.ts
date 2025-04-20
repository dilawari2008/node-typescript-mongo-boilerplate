// src/__tests__/tradingEngine.test.ts
import { TradingEngine } from '../services/trading-engine';
import { Order } from '../types';

describe('TradingEngine', () => {
  let engine: TradingEngine;

  beforeEach(() => {
    // Create a fresh engine instance before each test
    engine = new TradingEngine();
  });

  test('should process a simple trade between matching buy and sell orders', () => {
    // Create a buy order
    const buyOrder: Order = {
      type_op: 'CREATE',
      account_id: '1',
      amount: '1.5',
      order_id: '101',
      pair: 'BTC/USDC',
      limit_price: '50000',
      side: 'BUY'
    };

    // Create a sell order at the same price
    const sellOrder: Order = {
      type_op: 'CREATE',
      account_id: '2',
      amount: '1.0',
      order_id: '102',
      pair: 'BTC/USDC',
      limit_price: '50000',
      side: 'SELL'
    };

    // Process the buy order first
    engine.processOrder(buyOrder);
    
    // Check the orderbook - the buy order should be added
    const orderBookAfterBuy = engine.getOrderBook();
    expect(orderBookAfterBuy.bids.length).toBe(1);
    expect(orderBookAfterBuy.asks.length).toBe(0);
    expect(orderBookAfterBuy.bids[0].order_id).toBe('101');
    expect(orderBookAfterBuy.bids[0].amount).toBe('1.50000000');

    // No trades yet
    expect(engine.getTrades().length).toBe(0);

    // Process the sell order
    engine.processOrder(sellOrder);

    // Check that a trade was created
    const trades = engine.getTrades();
    expect(trades.length).toBe(1);
    expect(trades[0].buy_order_id).toBe('101');
    expect(trades[0].sell_order_id).toBe('102');
    expect(trades[0].amount).toBe('1.00000000');
    expect(trades[0].price).toBe('50000');

    // Check that the orderbook was updated
    const orderBookAfterSell = engine.getOrderBook();
    expect(orderBookAfterSell.bids.length).toBe(1);
    expect(orderBookAfterSell.asks.length).toBe(0);
    expect(orderBookAfterSell.bids[0].amount).toBe('0.50000000'); // 1.5 - 1.0 = 0.5 remaining
  });

  test('should match the best price for a market taker order', () => {
    // Create several sell orders at different prices
    const sellOrder1: Order = {
      type_op: 'CREATE',
      account_id: '1',
      amount: '1.0',
      order_id: '201',
      pair: 'BTC/USDC',
      limit_price: '51000',
      side: 'SELL'
    };

    const sellOrder2: Order = {
      type_op: 'CREATE',
      account_id: '2',
      amount: '2.0',
      order_id: '202',
      pair: 'BTC/USDC',
      limit_price: '50000', // Better price
      side: 'SELL'
    };

    // Add the sell orders to the orderbook
    engine.processOrder(sellOrder1);
    engine.processOrder(sellOrder2);

    // Check the orderbook - sell orders should be sorted by price (lowest first)
    const orderBookBeforeBuy = engine.getOrderBook();
    expect(orderBookBeforeBuy.asks.length).toBe(2);
    expect(orderBookBeforeBuy.asks[0].order_id).toBe('202'); // Lower price first
    expect(orderBookBeforeBuy.asks[1].order_id).toBe('201');

    // Create a buy order that should match with the best sell price
    const buyOrder: Order = {
      type_op: 'CREATE',
      account_id: '3',
      amount: '1.5',
      order_id: '203',
      pair: 'BTC/USDC',
      limit_price: '52000', // Willing to pay up to 52000
      side: 'BUY'
    };

    // Process the buy order
    engine.processOrder(buyOrder);

    // Check that a trade was created at the best available price
    const trades = engine.getTrades();
    expect(trades.length).toBe(1);
    expect(trades[0].buy_order_id).toBe('203');
    expect(trades[0].sell_order_id).toBe('202');
    expect(trades[0].amount).toBe('1.50000000');
    expect(trades[0].price).toBe('50000'); // Should match at the sell order's price

    // Check the orderbook was updated correctly
    const orderBookAfterBuy = engine.getOrderBook();
    expect(orderBookAfterBuy.asks.length).toBe(2);
    expect(orderBookAfterBuy.asks[0].order_id).toBe('202');
    expect(orderBookAfterBuy.asks[0].amount).toBe('0.50000000'); // 2.0 - 1.5 = 0.5 remaining
    expect(orderBookAfterBuy.asks[1].order_id).toBe('201');
    expect(orderBookAfterBuy.asks[1].amount).toBe('1.00000000'); // Unchanged
  });

  test('should handle order deletion correctly', () => {
    // Create a buy order
    const buyOrder: Order = {
      type_op: 'CREATE',
      account_id: '1',
      amount: '1.0',
      order_id: '301',
      pair: 'BTC/USDC',
      limit_price: '50000',
      side: 'BUY'
    };

    // Process the order
    engine.processOrder(buyOrder);
    
    // Check the orderbook - the order should be added
    const orderBookBefore = engine.getOrderBook();
    expect(orderBookBefore.bids.length).toBe(1);

    // Create a delete order
    const deleteOrder: Order = {
      type_op: 'DELETE',
      account_id: '1',
      amount: '1.0', // Not actually used for delete operations
      order_id: '301',
      pair: 'BTC/USDC',
      limit_price: '50000',
      side: 'BUY'
    };

    // Process the delete order
    engine.processOrder(deleteOrder);

    // Check the orderbook - the order should be removed
    const orderBookAfter = engine.getOrderBook();
    expect(orderBookAfter.bids.length).toBe(0);
  });
});