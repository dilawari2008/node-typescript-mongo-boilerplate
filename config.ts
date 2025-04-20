import Environments from '@/common/constants/environments';
import { config } from 'dotenv';

config({ path: '.env.dev' });

const Config = {
  db: {
    mongo: {
      url: process.env.MONGO_URL || ''
    },
  },
  jwtSecret: process.env.JWT_SECRET || '',
  environment: process.env.ENV || Environments.development,
  ordersFile: process.env.ORDERS_FILE || '../../files/orders.json',
  orderbookFile: process.env.ORDERBOOK_FILE || '../../files/orderbook',
  tradesFile: process.env.TRADES_FILE || '../../files/trades',
};

export default Config