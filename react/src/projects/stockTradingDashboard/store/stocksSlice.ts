import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface LiveStockData {
    price: number;
    basePrice: number;
    change: number;
    changePercent: number;
    dir: 'up' | 'down' | 'none';
    volume: number;
    lastUpdated: number;
}

interface StocksState {
    symbols: string[];
    prices: Record<string, LiveStockData>;
    loading: boolean;
}

const initialState: StocksState = {
    symbols: [],
    prices: {},
    loading: true,
};

export interface PriceTickPayload {
    symbol: string;
    price: number;
    volume: number;
}

export interface SetInitialPayload {
    [symbol: string]: {
        price: number;
        basePrice: number;
    };
}

const stocksSlice = createSlice({
    name: 'stocks',
    initialState,
    reducers: {
        setInitialStocks(state, action: PayloadAction<SetInitialPayload>) {
            const symbols: string[] = [];
            const prices: Record<string, LiveStockData> = {};

            Object.entries(action.payload).forEach(([symbol, data]) => {
                symbols.push(symbol);
                prices[symbol] = {
                    price: data.price,
                    basePrice: data.basePrice,
                    change: 0,
                    changePercent: 0,
                    dir: 'none',
                    volume: Math.floor(Math.random() * 1000) + 100, // starting volume
                    lastUpdated: Date.now(),
                };
            });

            state.symbols = symbols;
            state.prices = prices;
            state.loading = false;
        },
        // [FLOW STEP 7]: Process the batched payload array in a single state mutation run.
        // This triggers only ONE Redux store update notification for all changed symbols.
        updatePricesBatch(state, action: PayloadAction<PriceTickPayload[]>) {

            if (state.loading) return; 

            action.payload.forEach(({ symbol, price, volume }) => {
                const prev = state.prices[symbol];

                if (prev) {
                    const diff = price - prev.price;
                    const dir = diff > 0 ? 'up' : diff < 0 ? 'down' : prev.dir;
                    const change = price - prev.basePrice;
                    const changePercent = (change / prev.basePrice) * 100;

                    state.prices[symbol] = {
                        price,
                        basePrice: prev.basePrice,
                        change,
                        changePercent,
                        dir,
                        volume: prev.volume + volume,
                        lastUpdated: Date.now(),
                    };
                }
            });
        },
    },
});

export const { setInitialStocks, updatePricesBatch } = stocksSlice.actions;
export default stocksSlice.reducer;
