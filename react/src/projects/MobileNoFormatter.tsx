import { useState } from "react"
import "./MobileNoFormatter.scoped.css"

const PREFIX = "+91 ", MAX_LENGTH = 10;
const FORMATS = [{ pos: 2, sym: "-" }, { pos: 6, sym: " " }];


export default function MobileNoFormatter() {
    const [value, setValue] = useState("");

    function handleInputChange(e) {
        const val = e.target.value.trim();
        setValue(val);
    }

    return (
        <div className="content">
            <input className="currencyInput" type="text" value={value} onChange={handleInputChange} autoFocus />
        </div>
    )
}