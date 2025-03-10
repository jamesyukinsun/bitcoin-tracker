# Bitcoin Price Tracker

A modern, mobile-friendly Progressive Web App (PWA) that tracks Bitcoin's price in real-time and displays its price history for the past 6 months.

![Bitcoin Tracker Screenshot](https://raw.githubusercontent.com/bitcoin/bitcoin/master/share/pixmaps/bitcoin128.png)

## Features

- **Real-time Bitcoin Price**: Displays the current BTC price in USD with 24-hour change percentage
- **Historical Data**: Shows Bitcoin price history for the past 6 months in an interactive chart
- **Price Statistics**: Displays 24-hour and 6-month high/low prices
- **Weekly Price Table**: Lists Bitcoin prices by week for quick reference
- **Offline Support**: Works without an internet connection using cached data
- **Mobile-Friendly**: Responsive design works on all devices
- **Installable**: Can be installed as a Progressive Web App on mobile and desktop
- **Reliable Data**: Uses multiple reliable cryptocurrency APIs with fallbacks
- **China Compatibility**: Special proxy and JSONP implementation for use in regions with internet restrictions

## API Sources

The app uses multiple reliable cryptocurrency APIs in the following order:

1. **CoinGecko API** (Primary): One of the most reliable and comprehensive cryptocurrency data providers
2. **Coinbase API** (First Fallback): Major US-based cryptocurrency exchange
3. **Binance API** (Second Fallback): World's largest cryptocurrency exchange by trading volume
4. **Kraken API** (Third Fallback): Established US-based cryptocurrency exchange

If all APIs fail, the app falls back to cached data or hardcoded values to ensure it always displays something useful.

## Technical Details

### Technologies Used

- **HTML5/CSS3**: For structure and styling
- **JavaScript**: For data fetching, processing, and UI updates
- **Chart.js**: For rendering the price history chart
- **Service Worker**: For offline functionality
- **LocalStorage**: For caching price data
- **Web App Manifest**: For PWA installation capabilities
- **JSONP & Proxy**: For accessing APIs in regions with internet restrictions

### Data Refresh Rates

- Current price: Updates every 60 seconds
- Historical data: Updates every 60 minutes
- Cached data: Used when offline or when APIs are unavailable

## Installation

### As a Progressive Web App

1. Visit the app in a modern browser (Chrome, Edge, Safari, Firefox)
2. On mobile: Tap the browser menu and select "Add to Home Screen"
3. On desktop: Look for the install icon in the address bar

### As a Native App

See the [APP_BUILD_INSTRUCTIONS.md](APP_BUILD_INSTRUCTIONS.md) file for detailed instructions on how to build the app as a native Android or iOS application using Capacitor.

## Development

### Project Structure

- `index.html`: Main HTML structure
- `styles.css`: CSS styling
- `script.js`: JavaScript functionality
- `sw.js`: Service Worker for offline support
- `manifest.json`: Web App Manifest for PWA features
- `icons/`: App icons in various sizes
- `bitcoin-logo.svg`: Bitcoin logo for display

### Running Locally

1. Clone the repository
2. Open `index.html` in a browser
3. For full PWA functionality, serve the files using a local web server

### API Limitations

- CoinGecko has a rate limit of 10-50 calls per minute
- Some APIs may be blocked in certain regions
- The app implements fallback mechanisms to handle API failures

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Bitcoin price data provided by CoinGecko, Coinbase, Binance, and Kraken
- Bitcoin logo from the official Bitcoin repository
- Chart.js for the interactive price chart
