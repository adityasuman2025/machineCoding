import React from 'react';
import { useSelector } from 'react-redux';
import { List, type RowComponentProps } from 'react-window';
import type { RootState } from '../store';
import { StockItem } from './StockItem';

export const StockGrid: React.FC = () => {
    // [FLOW STEP 8]: Grid subscribes ONLY to the static symbols list.
    // Since this array reference never changes, the table grid NEVER re-renders.
    const symbols = useSelector((state: RootState) => state.stocks.symbols);

    // Row component matching the required API structure of react-window v2.2.7
    const RowComponent = ({ index, style }: RowComponentProps) => {
        const symbol = symbols[index];
        return <StockItem symbol={symbol} style={style} />;
    };

    return (
        <div className="stock-table-container">
            {/* Virtualized Table Header */}
            <div className="stock-table-header">
                <div className="header-cell">Symbol</div>
                <div className="header-cell text-right">Price</div>
                <div className="header-cell text-right">Change</div>
                <div className="header-cell text-right">Volume</div>
            </div>

            {/* List Viewport configured for react-window v2.2.7 API */}
            <List
                rowCount={symbols.length}
                rowHeight={50}
                rowComponent={RowComponent}
                rowProps={{}}
                style={{ height: "calc(100vh - 70px)", width: '100%' }}
            />
        </div>
    );
};
