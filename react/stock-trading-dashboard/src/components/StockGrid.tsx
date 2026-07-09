import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { StockRow } from './StockRow';

export const StockGrid: React.FC = () => {
    // [FLOW STEP 8]: Grid subscribes ONLY to the static symbols list. 
    // Since this array reference never changes, the table grid NEVER re-renders.
    const symbols = useSelector((state: RootState) => state.stocks.symbols);

    return (
        <div className="stock-table-container">
            <table className="stock-table">
                <thead>
                    <tr>
                        <th>Symbol</th>
                        <th style={{ textAlign: 'right' }}>Price</th>
                        <th style={{ textAlign: 'right' }}>Change</th>
                        <th style={{ textAlign: 'right' }}>Volume</th>
                    </tr>
                </thead>
                <tbody>
                    {symbols.map((symbol) => (
                        <StockRow key={symbol} symbol={symbol} />
                    ))}
                </tbody>
            </table>
        </div>
    );
};
