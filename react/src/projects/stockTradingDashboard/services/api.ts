export interface InitialStockData {
    price: number;
    basePrice: number;
}

// Emulate a REST API request to fetch initial stock data
export const fetchInitialStocks = (): Promise<Record<string, InitialStockData>> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const baseTickers = ['AAPL', 'MSFT', 'GOOG', 'AMZN', 'TSLA', 'NVDA', 'META', 'BRK', 'V', 'JNJ'];
            const initialData: Record<string, InitialStockData> = {};

            // Seed real tickers
            baseTickers.forEach((ticker) => {
                const basePrice = 100 + Math.random() * 300;
                initialData[ticker] = {
                    price: basePrice,
                    basePrice,
                };
            });

            // Seed 990 other tickers
            for (let i = 1; i <= 990; i++) {
                const ticker = `STK${String(i).padStart(3, '0')}`;
                const basePrice = 10 + Math.random() * 150;
                initialData[ticker] = {
                    price: basePrice,
                    basePrice,
                };
            }

            resolve(initialData);
        }, 500); // 500ms network latency simulation
    });
};
