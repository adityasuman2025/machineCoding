import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface StockRowProps {
    symbol: string;
}

export const StockRow: React.FC<StockRowProps> = React.memo(({ symbol }) => {
    // [FLOW STEP 9]: StockRow subscribes granularly using useSelector ONLY to its own symbol's price data.
    // If other stocks update but this one does not, this component completely avoids re-rendering.
    const priceData = useSelector((state: RootState) => state.stocks.prices[symbol]);

    if (!priceData) return null;

    const { price, change, changePercent, volume, dir } = priceData;
    const isPositive = change >= 0;
    const changeSign = isPositive ? '+' : '';
    const flashClass = dir === 'up' ? 'flash-up' : dir === 'down' ? 'flash-down' : '';

    return (
        <tr>
            <td className="stock-symbol">{symbol}</td>
            <td
                // [FLOW STEP 10]: Changing the 'key' attribute forces React to rebuild only this specific cell
                // DOM node, instantly re-triggering the CSS keyframe flash animation without timers.
                key={`${price}-${dir}`}
                className={`stock-price ${flashClass}`}
            >
                ${price.toFixed(2)}
            </td>

            <td className={`stock-change ${isPositive ? 'text-up' : 'text-down'}`}>
                {changeSign}{change.toFixed(2)} ({changeSign}{changePercent.toFixed(2)}%)
            </td>
            <td className="stock-volume">
                {volume.toLocaleString()}
            </td>
        </tr>
    );
});

StockRow.displayName = 'StockRow';
