import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface StockRowProps {
    symbol: string;
    style?: React.CSSProperties;
}
export const StockRow: React.FC<StockRowProps> = React.memo(({ symbol, style }) => {
    // [FLOW STEP 9]: StockRow subscribes granularly using useSelector ONLY to its own symbol's price data.
    // If other stocks update but this one does not, this component completely avoids re-rendering.
    const priceData = useSelector((state: RootState) => state.stocks.prices[symbol]);

    if (!priceData) return null;

    const { price, change, changePercent, volume, dir } = priceData;
    const isPositive = change >= 0;
    const changeSign = isPositive ? '+' : '';
    const flashClass = dir === 'up' ? 'flash-up' : dir === 'down' ? 'flash-down' : '';

    return (
        <div className="stock-table-row" style={style}>
            <div className="stock-cell stock-symbol">{symbol}</div>
            <div
                // [FLOW STEP 10]: Changing the 'key' attribute forces React to rebuild only this specific cell
                // DOM node, instantly re-triggering the CSS keyframe flash animation without timers.
                key={`${price}-${dir}`}
                className={`stock-cell stock-price text-right ${flashClass}`}
            >
                ${price.toFixed(2)}
            </div>
            <div className={`stock-cell stock-change text-right ${isPositive ? 'text-up' : 'text-down'}`}>
                {changeSign}{change.toFixed(2)} ({changeSign}{changePercent.toFixed(2)}%)
            </div>
            <div className="stock-cell stock-volume text-right">
                {volume.toLocaleString()}
            </div>
        </div>
    );
});

StockRow.displayName = 'StockRow';
