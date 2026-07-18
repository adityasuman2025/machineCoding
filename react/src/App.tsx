import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Clock from "./projects/Clock";
import CountDownTimer from "./projects/CountDownTimer";
import DataTable from "./projects/DataTable";
import ImageCarousel from "./projects/ImageCarousel";
import MobileNoFormatter from "./projects/MobileNoFormatter";
import OTPInput from "./projects/OTPInput";
import StopWatch from "./projects/StopWatch";
import TicTacToe from "./projects/TicTacToe";
import TrafficLight from "./projects/TrafficLight";
import AutoCompleteWrapper from "./projects/autoComplete/AutoCompleteWrapper";
import CommentsApp from "./projects/comments/App";
import DynamicLayoutingApp from "./projects/dynamicLayouting/syncExternalStore/AppSyncExternalStore";
import GoogleSheetsApp from "./projects/googleSheets/App";
import NavbarApp from "./projects/navbar/App";
import StockTradingDashboardApp from "./projects/stockTradingDashboard/App";
import ChessBishop from "./projects/chessBishop/ChessBishop";
import Practice from "./projects/Practice";
import "./App.scoped.css";

function Dashboard() {
    const projects = [
        { name: "Auto Complete", path: "/auto-complete" },
        { name: "Clock", path: "/clock" },
        { name: "Chess Bishop", path: "/chess" },
        { name: "Comments", path: "/comments" },
        { name: "CountDown Timer", path: "/countdown-timer" },
        { name: "Data Table", path: "/data-table" },
        { name: "Dynamic Layouting", path: "/dynamic-layouting" },
        { name: "Google Sheets", path: "/google-sheets" },
        { name: "Image Carousel", path: "/image-carousel" },
        { name: "Mobile No Formatter", path: "/mobile-no-formatter" },
        { name: "Navbar Tree", path: "/navbar-tree" },
        { name: "OTP Input", path: "/otp-input" },
        { name: "Practice", path: "/practice" },
        { name: "Stock Trading Dashboard", path: "/stock-trading-dashboard" },
        { name: "Stopwatch", path: "/stopwatch" },
        { name: "Tic Tac Toe", path: "/tic-tac-toe" },
        { name: "Traffic Light", path: "/traffic-light" },
    ];

    return (
        <div className="container">
            <header className="header">
                <h1 className="title">
                    Web Frontend Machine Coding Round Questions
                </h1>
                <p className="subtitle">
                    A collection of practice problems by <a href="https://adityas.site" target="_blank">Aditya Suman</a>
                </p>
            </header>

            <main className="main">
                <div className="grid">
                    {projects.map((project) => (
                        <Link
                            key={project.path}
                            to={project.path}
                            className="link"
                        >
                            {project.name}
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/chess" element={<ChessBishop />} />
                <Route path="/clock" element={<Clock />} />
                <Route path="/countdown-timer" element={<CountDownTimer />} />
                <Route path="/data-table" element={<DataTable />} />
                <Route path="/image-carousel" element={<ImageCarousel />} />
                <Route path="/mobile-no-formatter" element={<MobileNoFormatter />} />
                <Route path="/otp-input" element={<OTPInput />} />
                <Route path="/stopwatch" element={<StopWatch />} />
                <Route path="/tic-tac-toe" element={<TicTacToe />} />
                <Route path="/traffic-light" element={<TrafficLight />} />
                <Route path="/auto-complete" element={<AutoCompleteWrapper />} />
                <Route path="/comments" element={<CommentsApp />} />
                <Route path="/dynamic-layouting" element={<DynamicLayoutingApp />} />
                <Route path="/google-sheets" element={<GoogleSheetsApp />} />
                <Route path="/navbar-tree" element={<NavbarApp />} />
                <Route path="/stock-trading-dashboard" element={<StockTradingDashboardApp />} />
                <Route path="/practice" element={<Practice />} />
            </Routes>
        </Router>
    );
}
