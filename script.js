// DOM Elements
const currentPriceElement = document.getElementById('current-price-value');
const priceChangeElement = document.getElementById('price-change-value');
const priceChangeArrow = document.getElementById('price-change-arrow');
const lastUpdatedElement = document.getElementById('last-updated');
const priceChart = document.getElementById('price-chart');
const high24hElement = document.getElementById('high-24h');
const low24hElement = document.getElementById('low-24h');
const high6mElement = document.getElementById('high-6m');
const low6mElement = document.getElementById('low-6m');
const tableBodyElement = document.getElementById('table-body');

// Store historical data
let historicalData = [];

// Chart configuration
let chart;
const chartConfig = {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Bitcoin Price (USD)',
            data: [],
            borderColor: '#f7931a',
            backgroundColor: 'rgba(247, 147, 26, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            fill: true,
            tension: 0.1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function(context) {
                        return `$${context.parsed.y.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    maxTicksLimit: 6,
                    maxRotation: 0
                }
            },
            y: {
                ticks: {
                    callback: function(value) {
                        return '$' + value.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0});
                    }
                }
            }
        }
    }
};

// Initialize chart
function initChart() {
    chart = new Chart(priceChart, chartConfig);
}

// Format price as USD
function formatPrice(price) {
    return '$' + parseFloat(price).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

// Format date for display
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

// Format date for chart labels
function formatChartDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
}

// Update price change display
function updatePriceChange(changePercent) {
    const formattedChange = changePercent.toFixed(2) + '%';
    priceChangeElement.textContent = formattedChange;
    
    if (changePercent > 0) {
        priceChangeElement.className = 'positive';
        priceChangeArrow.textContent = '↑';
        priceChangeArrow.className = 'positive';
    } else if (changePercent < 0) {
        priceChangeElement.className = 'negative';
        priceChangeArrow.textContent = '↓';
        priceChangeArrow.className = 'negative';
    } else {
        priceChangeElement.className = '';
        priceChangeArrow.textContent = '→';
        priceChangeArrow.className = '';
    }
}

// Create a JSONP request
function jsonpRequest(url, callback) {
    const script = document.createElement('script');
    const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    
    window[callbackName] = function(data) {
        delete window[callbackName];
        document.body.removeChild(script);
        callback(data);
    };
    
    script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
    document.body.appendChild(script);
}

// Fetch current Bitcoin price using multiple sources
async function fetchCurrentPrice() {
    try {
        // Try local storage first for offline support
        const cachedData = localStorage.getItem('btcCurrentPrice');
        if (cachedData) {
            const data = JSON.parse(cachedData);
            const now = new Date().getTime();
            // Use cached data if it's less than 5 minutes old
            if (now - data.timestamp < 5 * 60 * 1000) {
                updatePriceDisplay(data);
                console.log('Using cached current price data');
            }
        }
        
        // Try multiple APIs in sequence
        tryBinanceAPI()
            .catch(() => tryHuobiAPI())
            .catch(() => tryOKXAPI())
            .catch(() => tryZBAPI())
            .catch(error => {
                console.error('All APIs failed:', error);
                currentPriceElement.textContent = 'Error loading price';
                // Use hardcoded data as last resort
                useHardcodedData();
            });
    } catch (error) {
        console.error('Error in fetchCurrentPrice:', error);
        currentPriceElement.textContent = 'Error loading price';
    }
}

// Try Binance API
function tryBinanceAPI() {
    return new Promise((resolve, reject) => {
        try {
            // Using a JSONP approach for Binance
            jsonpRequest('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT', function(data) {
                if (data) {
                    const price = parseFloat(data.lastPrice);
                    const open24h = parseFloat(data.openPrice);
                    const change24h = parseFloat(data.priceChangePercent);
                    const high24h = parseFloat(data.highPrice);
                    const low24h = parseFloat(data.lowPrice);
                    
                    const priceData = {
                        price: price,
                        change24h: change24h,
                        high24h: high24h,
                        low24h: low24h,
                        timestamp: new Date().getTime()
                    };
                    
                    updatePriceDisplay(priceData);
                    localStorage.setItem('btcCurrentPrice', JSON.stringify(priceData));
                    resolve(priceData);
                } else {
                    reject(new Error('No data from Binance API'));
                }
            });
            
            // Set a timeout to reject if it takes too long
            setTimeout(() => {
                reject(new Error('Binance API timeout'));
            }, 5000);
        } catch (error) {
            reject(error);
        }
    });
}

// Try Huobi API
function tryHuobiAPI() {
    return new Promise((resolve, reject) => {
        try {
            fetch('https://api.huobi.pro/market/detail/merged?symbol=btcusdt')
                .then(response => response.json())
                .then(data => {
                    if (data && data.status === 'ok') {
                        const price = data.tick.close;
                        const open24h = data.tick.open;
                        const change24h = ((price - open24h) / open24h) * 100;
                        const high24h = data.tick.high;
                        const low24h = data.tick.low;
                        
                        const priceData = {
                            price: price,
                            change24h: change24h,
                            high24h: high24h,
                            low24h: low24h,
                            timestamp: new Date().getTime()
                        };
                        
                        updatePriceDisplay(priceData);
                        localStorage.setItem('btcCurrentPrice', JSON.stringify(priceData));
                        resolve(priceData);
                    } else {
                        reject(new Error('No data from Huobi API'));
                    }
                })
                .catch(error => {
                    reject(error);
                });
            
            // Set a timeout to reject if it takes too long
            setTimeout(() => {
                reject(new Error('Huobi API timeout'));
            }, 5000);
        } catch (error) {
            reject(error);
        }
    });
}

// Try OKX API
function tryOKXAPI() {
    return new Promise((resolve, reject) => {
        try {
            fetch('https://www.okx.com/api/v5/market/ticker?instId=BTC-USDT')
                .then(response => response.json())
                .then(data => {
                    if (data && data.code === '0' && data.data && data.data.length > 0) {
                        const tickerData = data.data[0];
                        const price = parseFloat(tickerData.last);
                        const open24h = parseFloat(tickerData.open24h);
                        const change24h = ((price - open24h) / open24h) * 100;
                        const high24h = parseFloat(tickerData.high24h);
                        const low24h = parseFloat(tickerData.low24h);
                        
                        const priceData = {
                            price: price,
                            change24h: change24h,
                            high24h: high24h,
                            low24h: low24h,
                            timestamp: new Date().getTime()
                        };
                        
                        updatePriceDisplay(priceData);
                        localStorage.setItem('btcCurrentPrice', JSON.stringify(priceData));
                        resolve(priceData);
                    } else {
                        reject(new Error('No data from OKX API'));
                    }
                })
                .catch(error => {
                    reject(error);
                });
            
            // Set a timeout to reject if it takes too long
            setTimeout(() => {
                reject(new Error('OKX API timeout'));
            }, 5000);
        } catch (error) {
            reject(error);
        }
    });
}

// Try ZB API
function tryZBAPI() {
    return new Promise((resolve, reject) => {
        try {
            fetch('https://api.zb.com/data/v1/ticker?market=btc_usdt')
                .then(response => response.json())
                .then(data => {
                    if (data && data.ticker) {
                        const tickerData = data.ticker;
                        const price = parseFloat(tickerData.last);
                        const open24h = parseFloat(tickerData.open);
                        const change24h = ((price - open24h) / open24h) * 100;
                        const high24h = parseFloat(tickerData.high);
                        const low24h = parseFloat(tickerData.low);
                        
                        const priceData = {
                            price: price,
                            change24h: change24h,
                            high24h: high24h,
                            low24h: low24h,
                            timestamp: new Date().getTime()
                        };
                        
                        updatePriceDisplay(priceData);
                        localStorage.setItem('btcCurrentPrice', JSON.stringify(priceData));
                        resolve(priceData);
                    } else {
                        reject(new Error('No data from ZB API'));
                    }
                })
                .catch(error => {
                    reject(error);
                });
            
            // Set a timeout to reject if it takes too long
            setTimeout(() => {
                reject(new Error('ZB API timeout'));
            }, 5000);
        } catch (error) {
            reject(error);
        }
    });
}

// Update price display with data
function updatePriceDisplay(data) {
    currentPriceElement.textContent = formatPrice(data.price);
    updatePriceChange(data.change24h);
    
    if (high24hElement) {
        high24hElement.textContent = formatPrice(data.high24h);
    }
    
    if (low24hElement) {
        low24hElement.textContent = formatPrice(data.low24h);
    }
    
    lastUpdatedElement.textContent = 'Last updated: ' + formatDate(data.timestamp);
}

// Use hardcoded data as last resort
function useHardcodedData() {
    console.log('Using hardcoded data as fallback');
    const hardcodedData = {
        price: 65000,
        change24h: 2.5,
        high24h: 66500,
        low24h: 64000,
        timestamp: new Date().getTime()
    };
    
    updatePriceDisplay(hardcodedData);
}

// Fetch historical Bitcoin price data
async function fetchHistoricalData() {
    try {
        // Try local storage first for offline support
        const cachedData = localStorage.getItem('btcHistoricalData');
        if (cachedData) {
            const data = JSON.parse(cachedData);
            const now = new Date().getTime();
            // Use cached data if it's less than 1 day old
            if (now - data.timestamp < 24 * 60 * 60 * 1000) {
                updateChartWithData(data.prices);
                updateTableWithData(data.prices);
                console.log('Using cached historical data');
                return;
            }
        }
        
        // Try multiple APIs in sequence
        tryBinanceHistorical()
            .catch(() => tryHuobiHistorical())
            .catch(() => tryOKXHistorical())
            .catch(() => tryZBHistorical())
            .catch(error => {
                console.error('All historical APIs failed:', error);
                // Use hardcoded data as last resort
                useHardcodedHistoricalData();
            });
    } catch (error) {
        console.error('Error in fetchHistoricalData:', error);
    }
}

// Try Binance API for historical data
function tryBinanceHistorical() {
    return new Promise((resolve, reject) => {
        try {
            // Calculate date 6 months ago
            const today = new Date();
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(today.getMonth() - 6);
            
            fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&startTime=${sixMonthsAgo.getTime()}&endTime=${today.getTime()}`)
                .then(response => response.json())
                .then(data => {
                    if (data && data.length > 0) {
                        const prices = data.map(candle => {
                            return {
                                timestamp: candle[0],
                                open: parseFloat(candle[1]),
                                high: parseFloat(candle[2]),
                                low: parseFloat(candle[3]),
                                close: parseFloat(candle[4]),
                                volume: parseFloat(candle[5])
                            };
                        });
                        
                        updateChartWithData(prices);
                        updateTableWithData(prices);
                        
                        // Cache the data
                        localStorage.setItem('btcHistoricalData', JSON.stringify({
                            prices: prices,
                            timestamp: new Date().getTime()
                        }));
                        
                        resolve(prices);
                    } else {
                        reject(new Error('No historical data from Binance API'));
                    }
                })
                .catch(error => {
                    reject(error);
                });
            
            // Set a timeout to reject if it takes too long
            setTimeout(() => {
                reject(new Error('Binance historical API timeout'));
            }, 10000);
        } catch (error) {
            reject(error);
        }
    });
}

// Try Huobi API for historical data
function tryHuobiHistorical() {
    return new Promise((resolve, reject) => {
        try {
            fetch('https://api.huobi.pro/market/history/kline?period=1day&size=180&symbol=btcusdt')
                .then(response => response.json())
                .then(data => {
                    if (data && data.status === 'ok' && data.data && data.data.length > 0) {
                        const prices = data.data.map(candle => {
                            return {
                                timestamp: candle.id * 1000,
                                open: candle.open,
                                high: candle.high,
                                low: candle.low,
                                close: candle.close,
                                volume: candle.vol
                            };
                        }).reverse(); // Huobi returns newest first
                        
                        updateChartWithData(prices);
                        updateTableWithData(prices);
                        
                        // Cache the data
                        localStorage.setItem('btcHistoricalData', JSON.stringify({
                            prices: prices,
                            timestamp: new Date().getTime()
                        }));
                        
                        resolve(prices);
                    } else {
                        reject(new Error('No historical data from Huobi API'));
                    }
                })
                .catch(error => {
                    reject(error);
                });
            
            // Set a timeout to reject if it takes too long
            setTimeout(() => {
                reject(new Error('Huobi historical API timeout'));
            }, 10000);
        } catch (error) {
            reject(error);
        }
    });
}

// Try OKX API for historical data
function tryOKXHistorical() {
    return new Promise((resolve, reject) => {
        try {
            fetch('https://www.okx.com/api/v5/market/candles?instId=BTC-USDT&bar=1D&limit=180')
                .then(response => response.json())
                .then(data => {
                    if (data && data.code === '0' && data.data && data.data.length > 0) {
                        const prices = data.data.map(candle => {
                            return {
                                timestamp: parseInt(candle[0]),
                                open: parseFloat(candle[1]),
                                high: parseFloat(candle[2]),
                                low: parseFloat(candle[3]),
                                close: parseFloat(candle[4]),
                                volume: parseFloat(candle[5])
                            };
                        }).reverse(); // OKX returns newest first
                        
                        updateChartWithData(prices);
                        updateTableWithData(prices);
                        
                        // Cache the data
                        localStorage.setItem('btcHistoricalData', JSON.stringify({
                            prices: prices,
                            timestamp: new Date().getTime()
                        }));
                        
                        resolve(prices);
                    } else {
                        reject(new Error('No historical data from OKX API'));
                    }
                })
                .catch(error => {
                    reject(error);
                });
            
            // Set a timeout to reject if it takes too long
            setTimeout(() => {
                reject(new Error('OKX historical API timeout'));
            }, 10000);
        } catch (error) {
            reject(error);
        }
    });
}

// Try ZB API for historical data
function tryZBHistorical() {
    return new Promise((resolve, reject) => {
        try {
            fetch('https://api.zb.com/data/v1/kline?market=btc_usdt&type=1day&size=180')
                .then(response => response.json())
                .then(data => {
                    if (data && data.data && data.data.length > 0) {
                        const prices = data.data.map(candle => {
                            return {
                                timestamp: candle[0] * 1000,
                                open: parseFloat(candle[1]),
                                high: parseFloat(candle[2]),
                                low: parseFloat(candle[3]),
                                close: parseFloat(candle[4]),
                                volume: parseFloat(candle[5])
                            };
                        });
                        
                        updateChartWithData(prices);
                        updateTableWithData(prices);
                        
                        // Cache the data
                        localStorage.setItem('btcHistoricalData', JSON.stringify({
                            prices: prices,
                            timestamp: new Date().getTime()
                        }));
                        
                        resolve(prices);
                    } else {
                        reject(new Error('No historical data from ZB API'));
                    }
                })
                .catch(error => {
                    reject(error);
                });
            
            // Set a timeout to reject if it takes too long
            setTimeout(() => {
                reject(new Error('ZB historical API timeout'));
            }, 10000);
        } catch (error) {
            reject(error);
        }
    });
}

// Update chart with historical data
function updateChartWithData(prices) {
    // Store the data globally
    historicalData = prices;
    
    // Clear existing data
    chartConfig.data.labels = [];
    chartConfig.data.datasets[0].data = [];
    
    // Find 6-month high and low
    let highPrice = 0;
    let lowPrice = Number.MAX_VALUE;
    
    // Add new data points
    prices.forEach(priceData => {
        chartConfig.data.labels.push(formatChartDate(priceData.timestamp));
        chartConfig.data.datasets[0].data.push(priceData.close);
        
        // Update high/low values
        if (priceData.high > highPrice) highPrice = priceData.high;
        if (priceData.low < lowPrice) lowPrice = priceData.low;
    });
    
    // Update 6-month high/low if elements exist
    if (high6mElement) {
        high6mElement.textContent = formatPrice(highPrice);
    }
    
    if (low6mElement) {
        low6mElement.textContent = formatPrice(lowPrice);
    }
    
    // Update chart
    chart.update();
}

// Update table with historical data
function updateTableWithData(prices) {
    if (!tableBodyElement) return;
    
    // Clear existing table rows
    tableBodyElement.innerHTML = '';
    
    // Add new rows for each data point (limit to 30 most recent)
    const recentPrices = prices.slice(-30);
    
    recentPrices.forEach((priceData, index) => {
        const row = document.createElement('tr');
        
        // Date column
        const dateCell = document.createElement('td');
        dateCell.textContent = formatDate(priceData.timestamp).split(',')[0]; // Just the date part
        row.appendChild(dateCell);
        
        // Price column
        const priceCell = document.createElement('td');
        priceCell.textContent = formatPrice(priceData.close);
        row.appendChild(priceCell);
        
        // 24h Change column
        const changeCell = document.createElement('td');
        if (index < recentPrices.length - 1) {
            const prevClose = recentPrices[index + 1].close;
            const change = ((priceData.close - prevClose) / prevClose) * 100;
            changeCell.textContent = `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
            changeCell.className = change >= 0 ? 'positive' : 'negative';
        } else {
            changeCell.textContent = 'N/A';
        }
        row.appendChild(changeCell);
        
        // Volume column
        const volumeCell = document.createElement('td');
        volumeCell.textContent = '$' + priceData.volume.toLocaleString('en-US', {maximumFractionDigits: 0});
        row.appendChild(volumeCell);
        
        tableBodyElement.appendChild(row);
    });
}

// Use hardcoded historical data as last resort
function useHardcodedHistoricalData() {
    console.log('Using hardcoded historical data as fallback');
    
    // Generate 180 days of fake data
    const today = new Date();
    const prices = [];
    
    let basePrice = 65000;
    for (let i = 180; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        
        // Add some randomness to the price
        const randomChange = (Math.random() - 0.5) * 2000;
        basePrice = basePrice + randomChange;
        if (basePrice < 30000) basePrice = 30000;
        if (basePrice > 100000) basePrice = 100000;
        
        const high = basePrice + Math.random() * 1000;
        const low = basePrice - Math.random() * 1000;
        
        prices.push({
            timestamp: date.getTime(),
            open: basePrice - Math.random() * 500,
            high: high,
            low: low,
            close: basePrice,
            volume: 1000000000 + Math.random() * 500000000
        });
    }
    
    updateChartWithData(prices);
    updateTableWithData(prices);
}

// Initialize and set up auto-refresh
async function initialize() {
    initChart();
    await fetchCurrentPrice();
    await fetchHistoricalData();
    
    // Refresh current price every 30 seconds
    setInterval(fetchCurrentPrice, 30000);
    
    // Refresh historical data every 30 minutes
    setInterval(fetchHistoricalData, 1800000);
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initialize); 