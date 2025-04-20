# Lightweight boilerplate for Express Apps with typescript

### Start it using

1. Run
   ```bash
   yarn prod
   ```

2. Hit this cURL in Postman
   ```bash
   curl --location --request POST 'localhost:3000/api/trade/execute'
   ```

3. The above cURL will generate `orderbook_YOUR_TRADING_PAIR.json` and `trades_YOUR_TRADING_PAIR.json` in the `files` folder. Each trading pair will have an orderbook and trades file individually, and there will also be an `orderbook.json` and a `trades.json` which will have the overall values for all trading pairs.

4. To change the input and run again, modify your orders in `orders.json` and hit the cURL again as in step 2.

5. To run tests, execute
   ```bash
   yarn test
   ```

