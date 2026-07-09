import type { Middleware } from '@reduxjs/toolkit';
import { updatePricesBatch } from './stocksSlice';
import type { PriceTickPayload } from './stocksSlice';

// Buffer to collect ticks between animation frames
const priceBuffer = new Map<string, PriceTickPayload>();
let rafScheduled = false;

export const priceBatchMiddleware: Middleware = (store) => (next) => (action: any) => {
    if (action.type === 'stocks/bufferPriceTick') {
        const payload = action.payload as PriceTickPayload;

        // [FLOW STEP 4]: Intercept raw tick and save/aggregate inside a fast memory Map cache
        const existing = priceBuffer.get(payload.symbol);
        if (existing) {
            priceBuffer.set(payload.symbol, {
                symbol: payload.symbol,
                price: payload.price,
                volume: existing.volume + payload.volume,
            });
        } else {
            priceBuffer.set(payload.symbol, payload);
        }

        // [FLOW STEP 5]: Schedule requestAnimationFrame to align updates with browser paint rate (~60Hz)
        if (!rafScheduled) {
            rafScheduled = true;
            requestAnimationFrame(() => {
                rafScheduled = false;
                const batch = Array.from(priceBuffer.values());
                priceBuffer.clear();

                // [FLOW STEP 6]: Flush all cached ticks in a single batch Redux dispatch
                if (batch.length > 0) store.dispatch(updatePricesBatch(batch));
            });
        }

        // Return early to stop individual ticks from triggering reducer evaluations
        return;
    }

    return next(action);
};
export const bufferPriceTick = (payload: PriceTickPayload) => ({
    type: 'stocks/bufferPriceTick',
    payload,
});
