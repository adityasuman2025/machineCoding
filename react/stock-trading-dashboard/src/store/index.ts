import { configureStore } from '@reduxjs/toolkit';
import stocksReducer from './stocksSlice';
import { priceBatchMiddleware } from './middleware';

export const store = configureStore({
    reducer: {
        stocks: stocksReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
            immutableCheck: false, // Turn off for max performance with 1000 items
        }).concat(priceBatchMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
