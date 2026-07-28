import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Clock from "./projects/Clock";
import Countdown from "./projects/countdown/Countdown";
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
import ProgressBar from "./projects/progressBar/ProgressBar";
import StarRating from "./projects/starRating/StarRating";
import DiceRoll from "./projects/diceRoll/DiceRoll";
import AutoComplete2 from "./projects/autoComplete2/AutoComplete2";
import CompoundComp from "./projects/compoundComp/CompoundComp";
import ModalWithFocusTrap from "./projects/modalWithFocusTrap/ModalWithFocusTrap";
import Todos from "./projects/todos/Todos";
import AreaSelector from "./projects/areaSelector/AreaSelector";
import Calculator from "./projects/calculator/Calculator";
import Counter from "./projects/counter/Counter";
import InfiniteScroll from "./projects/infiniteScroll/InfiniteScroll";
import SnakeGame from "./projects/snakeGame/SnakeGame";
import ToastProject from "./projects/toast/ToastProject";

const ESSENTIAL_PROJECTS = [
    { name: "Auto Complete", path: "/auto-complete" },
    { name: "Chess Bishop", path: "/chess" },
    { name: "CountDown Timer", path: "/countdown-timer" },
    { name: "Data Table", path: "/data-table" },
    { name: "Mobile No Formatter", path: "/mobile-no-formatter" },
    { name: "Navbar Tree", path: "/navbar-tree" },
    { name: "OTP Input", path: "/otp-input" },
    { name: "Comments", path: "/comments" },
    { name: "Stopwatch", path: "/stopwatch" },
    { name: "Tic Tac Toe", path: "/tic-tac-toe" },
    { name: "Dice Roll", path: "/dice-roll" },
    { name: "Stock Trading Dashboard", path: "/stock-trading-dashboard" },
    { name: "Progress Bar", path: "/progress-bar" },
    { name: "Star Rating", path: "/star-rating" },
    { name: "Image Carousel", path: "/image-carousel" },
    { name: "Compound Component", path: "/compound-comp" },
    { name: "Modal With Focus Trap", path: "/modal-with-focus-trap" },
    { name: "Todos", path: "/todos" },
];

const OTHER_PROJECTS = [
    { name: "Calculator", path: "/calculator" },
    { name: "Counter", path: "/counter" },
    { name: "Infinite Scroll", path: "/infinite-scroll" },
    { name: "Snake Game", path: "/snake-game" },
    { name: "Toast", path: "/toast" },
    { name: "Area Selector", path: "/area-selector" },
    { name: "Auto Complete 2", path: "/auto-complete-2" },
    { name: "Dynamic Layouting", path: "/dynamic-layouting" },
    { name: "Google Sheets", path: "/google-sheets" },
    { name: "Traffic Light", path: "/traffic-light" },
    { name: "Clock", path: "/clock" },
    { name: "Practice", path: "/practice" },
];

function Dashboard() {
    return (
        <div className="min-h-screen bg-neutral-900 text-neutral-100 p-6">
            <header className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    Web Frontend Machine Coding Round Questions in React
                </h1>
                <p className="text-neutral-400">
                    A collection of practice problems by{" "}
                    <a
                        href="https://adityas.site"
                        target="_blank"
                        rel="noreferrer"
                        className="text-white underline hover:text-neutral-200"
                    >
                        Aditya Suman
                    </a>
                </p>
                <div className="mt-3">
                    <a
                        href="/vanillaJs/index.html"
                        className="inline-block px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-md text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors"
                    >
                        Explore Vanilla JS Projects ➔
                    </a>
                </div>
            </header>

            <main className="max-w-6xl mx-auto">
                <h2 className="text-neutral-400 text-lg font-medium border-b border-neutral-700 pb-2 mt-8 mb-4">
                    Essentials
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {ESSENTIAL_PROJECTS.map((project) => (
                        <Link
                            key={project.path}
                            to={project.path}
                            className="p-4 bg-neutral-800 border border-neutral-700 rounded-lg hover:bg-neutral-700"
                        >
                            {project.name}
                        </Link>
                    ))}
                </div>

                <h2 className="text-neutral-400 text-lg font-medium border-b border-neutral-700 pb-2 mt-10 mb-4">
                    Others
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {OTHER_PROJECTS.map((project) => (
                        <Link
                            key={project.path}
                            to={project.path}
                            className="p-4 bg-neutral-800 border border-neutral-700 rounded-lg hover:bg-neutral-700"
                        >
                            {project.name}
                        </Link>
                    ))}
                </div>
            </main>

            <footer className="text-center mt-10 text-neutral-400 text-sm">
                explore more at{" "}
                <a
                    href="https://interview.adityas.site"
                    target="_blank"
                    rel="noreferrer"
                    className="text-white underline hover:text-neutral-200"
                >
                    MNgo Interview
                </a>
            </footer>
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
                <Route path="/countdown-timer" element={<Countdown />} />
                <Route path="/data-table" element={<DataTable />} />
                <Route path="/image-carousel" element={<ImageCarousel />} />
                <Route path="/mobile-no-formatter" element={<MobileNoFormatter />} />
                <Route path="/otp-input" element={<OTPInput />} />
                <Route path="/stopwatch" element={<StopWatch />} />
                <Route path="/tic-tac-toe" element={<TicTacToe />} />
                <Route path="/traffic-light" element={<TrafficLight />} />
                <Route path="/auto-complete" element={<AutoCompleteWrapper />} />
                <Route path="/auto-complete-2" element={<AutoComplete2 />} />
                <Route path="/comments" element={<CommentsApp />} />
                <Route path="/dynamic-layouting" element={<DynamicLayoutingApp />} />
                <Route path="/google-sheets" element={<GoogleSheetsApp />} />
                <Route path="/navbar-tree" element={<NavbarApp />} />
                <Route path="/stock-trading-dashboard" element={<StockTradingDashboardApp />} />
                <Route path="/progress-bar" element={<ProgressBar />} />
                <Route path="/star-rating" element={<StarRating />} />
                <Route path="/dice-roll" element={<DiceRoll />} />
                <Route path="/practice" element={<Practice />} />
                <Route path="/compound-comp" element={<CompoundComp />} />
                <Route path="/modal-with-focus-trap" element={<ModalWithFocusTrap />} />
                <Route path="/todos" element={<Todos />} />
                <Route path="/area-selector" element={<AreaSelector />} />
                <Route path="/calculator" element={<Calculator />} />
                <Route path="/counter" element={<Counter />} />
                <Route path="/infinite-scroll" element={<InfiniteScroll />} />
                <Route path="/snake-game" element={<SnakeGame />} />
                <Route path="/toast" element={<ToastProject />} />
            </Routes>
        </Router>
    );
}
