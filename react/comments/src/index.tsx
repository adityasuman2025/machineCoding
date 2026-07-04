import ReactDOM from "react-dom/client";
import App from "./App"; // without store
import AppStore from "./AppStore"; // using global store and useSyncExternalStore

const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);

root.render(<AppStore />);
