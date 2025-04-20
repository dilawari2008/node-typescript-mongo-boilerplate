// src/types/index.ts
export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'CREATE' | 'DELETE';
export type TradingPair = 'BTC/USDC' | string;

export interface Order {
  type_op: OrderType;
  account_id: string;
  amount: string;
  order_id: string;
  pair: TradingPair;
  limit_price: string;
  side: OrderSide;
}

export interface OrderBookEntry {
  order_id: string;
  account_id: string;
  amount: string;
  limit_price: string;
  side: OrderSide;
  pair: TradingPair;
}

export interface Trade {
  trade_id: string;
  buy_order_id: string;
  sell_order_id: string;
  amount: string;
  price: string;
  pair: TradingPair;
  timestamp: string;
}

export interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}