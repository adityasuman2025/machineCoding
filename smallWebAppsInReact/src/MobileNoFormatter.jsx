import { useState } from "react"

const PREFIX = "+91 ", MAX_LENGTH = 10;
const FORMATS = [{ pos: 2, sym: "-" }, { pos: 6, sym: " " }];

function formatMobNumber(str) {
    str = str.replace(PREFIX, "");

    let out = "", len = 0, formatIdx = 0;
    for (let i = 0; i < str.length; i++) {
        let char = str[i];
        if ("0123456789".includes(char)) { // keep only numbers
            len++;

            const { pos, sym } = FORMATS[formatIdx] || {};
            if (pos === len - 1) {
                out += sym;
                formatIdx++;
            }

            out += char;

            if (len === MAX_LENGTH) break; // max length
        }
    }

    return out;
}


export default function MobileNoFormatter() {
    const [value, setValue] = useState("");

    function handleInputChange(e) {
        const val = formatMobNumber(e.target.value).trim();
        setValue(val ? PREFIX + val : "");
    }

    return (
        <div id="content">
            <input id="currencyInput" type="text" value={value} onChange={handleInputChange} autoFocus />
        </div>
    )
}