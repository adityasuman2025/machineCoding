import type { PriceTickPayload } from '../store/stocksSlice';

// Helper to generate the exact same symbols
const generateSymbols = () => {
  const baseTickers = ['AAPL', 'MSFT', 'GOOG', 'AMZN', 'TSLA', 'NVDA', 'META', 'BRK', 'V', 'JNJ'];
  const symbols = [...baseTickers];
  for (let i = 1; i <= 990; i++) {
    symbols.push(`STK${String(i).padStart(3, '0')}`);
  }
  return symbols;
};

const SYMBOLS = generateSymbols();

class MockWebSocketService {
  private intervalId: number | null = null;
  private currentPrices: Record<string, number> = {};
  private onTickCallback: ((tick: PriceTickPayload) => void) | null = null;

  constructor() {
    // Seed initial prices
    SYMBOLS.forEach((symbol) => {
      this.currentPrices[symbol] = symbol.startsWith('STK')
        ? 10 + Math.random() * 150
        : 100 + Math.random() * 300;
    });
  }

  public connect(onTick: (tick: PriceTickPayload) => void) {
    this.onTickCallback = onTick;
    this.startStreaming();
  }

  public disconnect() {
    this.stopStreaming();
    this.onTickCallback = null;
  }

  private startStreaming() {
    this.stopStreaming();

    // Stream updates at high frequency (approx every 15ms)
    this.intervalId = window.setInterval(() => {
      if (!this.onTickCallback) return;

      // Update a random subset of 10-30 stocks in each tick
      const count = Math.floor(Math.random() * 20) + 10;
      for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * SYMBOLS.length);
        const symbol = SYMBOLS[randomIndex];
        const currentPrice = this.currentPrices[symbol];

        // Random drift between -1.5% and +1.5%
        const pctChange = (Math.random() * 3 - 1.5) / 100;
        const priceDelta = currentPrice * pctChange;
        const newPrice = Math.max(0.1, Number((currentPrice + priceDelta).toFixed(2)));
        this.currentPrices[symbol] = newPrice;

        const volume = Math.floor(Math.random() * 50) + 1;

        this.onTickCallback({
          symbol,
          price: newPrice,
          volume,
        });
      }
    }, 100);
  }

  private stopStreaming() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const mockWebSocket = new MockWebSocketService();
