import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './store';
import type { RootState } from './store';
import { bufferPriceTick } from './store/middleware';
import { setInitialStocks } from './store/stocksSlice';
import { fetchInitialStocks } from './services/api';
import { mockWebSocket } from './services/mockWebSocket';
import { StockGrid } from './components/StockGrid';

const Dashboard: React.FC = () => {
    const dispatch = useDispatch();
    const isLoading = useSelector((state: RootState) => state.stocks.loading);

    // [FLOW STEP 1]: Fetch static symbols and initial prices from REST API on mount
    useEffect(() => {
        fetchInitialStocks().then((data) => {
            dispatch(setInitialStocks(data));
        });
    }, [dispatch]);

    // [FLOW STEP 2]: Connect to WebSocket only after initial REST API load is complete
    useEffect(() => {
        if (isLoading) return;

        mockWebSocket.connect((tick) => {
            // [FLOW STEP 3]: Dispatch raw tick action to the batching middleware
            dispatch(bufferPriceTick(tick));
        });

        return () => mockWebSocket.disconnect();
    }, [isLoading, dispatch]);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.25rem', color: '#9ca3af' }}>
                Loading initial stock prices...
            </div>
        );
    }

    return (
        <main>
            <StockGrid />
        </main>
    );
};

function App() {
    return (
        <Provider store={store}>
            <Dashboard />
        </Provider>
    );
}

export default App;
