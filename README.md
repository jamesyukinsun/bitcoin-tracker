# Bitcoin Price Tracker

A simple, mobile-friendly website that tracks Bitcoin's price in real-time and displays its price history for the past 6 months.

## Features

- Real-time Bitcoin price updates (refreshes every 30 seconds)
- 24-hour price change indicator
- 24-hour high and low prices
- 6-month price history chart with high and low indicators
- Historical data table showing recent price movements
- Mobile-responsive design
- Bitcoin logo integration
- Works in mainland China with multiple API fallbacks
- Offline support with local data caching

## How to Use

1. Simply open the `index.html` file in any web browser
2. The current Bitcoin price will be displayed at the top
3. The 6-month price history chart will be displayed below
4. Recent historical data is shown in a table format

## Technical Details

- No server required - this is a client-side only application
- Multiple API providers with automatic fallbacks:
  - Binance
  - Huobi
  - OKX
  - ZB.com
- JSONP approach for cross-origin requests
- Local storage caching for offline support
- Chart.js for data visualization
- Responsive design for mobile devices

## API Information

This application tries multiple APIs in sequence until one works:

1. Binance API:
   - Current price: `https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT`
   - Historical data: `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d`

2. Huobi API:
   - Current price: `https://api.huobi.pro/market/detail/merged?symbol=btcusdt`
   - Historical data: `https://api.huobi.pro/market/history/kline?period=1day&size=180&symbol=btcusdt`

3. OKX API:
   - Current price: `https://www.okx.com/api/v5/market/ticker?instId=BTC-USDT`
   - Historical data: `https://www.okx.com/api/v5/market/candles?instId=BTC-USDT&bar=1D&limit=180`

4. ZB.com API:
   - Current price: `https://api.zb.com/data/v1/ticker?market=btc_usdt`
   - Historical data: `https://api.zb.com/data/v1/kline?market=btc_usdt&type=1day&size=180`

If all APIs fail, the application falls back to hardcoded data to ensure something is always displayed.

## Offline Support

The application caches the most recent data in the browser's local storage:
- Current price data is cached for 5 minutes
- Historical data is cached for 24 hours

This allows the application to work even when offline or when APIs are temporarily unavailable.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgements

- [Binance](https://www.binance.com/), [Huobi](https://www.huobi.com/), [OKX](https://www.okx.com/), and [ZB.com](https://www.zb.com/) for providing cryptocurrency APIs
- [Chart.js](https://www.chartjs.org/) for the charting library #   b i t c o i n - t r a c k e r  
 #   b i t c o i n - t r a c k e r  
 