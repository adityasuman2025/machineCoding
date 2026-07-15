import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './store';
import type { RootState } from './store';
import { bufferPriceTick } from './store/middleware';
import { setInitialStocks } from './store/stocksSlice';
import { fetchInitialStocks } from './services/api';
import { mockWebSocket } from './services/mockWebSocket';
import { StockGrid } from './components/StockGrid';
import './index.scoped.css';

const Dashboard: React.FC = () => {
    const dispatch = useDispatch();
    const isLoading = useSelector((state: RootState) => state.stocks.loading);

    useEffect(() => {
        fetchInitialStocks().then((data) => {
            dispatch(setInitialStocks(data));
        });
    }, [dispatch]);

    useEffect(() => {
        if (isLoading) return;

        mockWebSocket.connect((tick) => {
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
        <div className="dashboard">
            <StockGrid />
        </div>
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
