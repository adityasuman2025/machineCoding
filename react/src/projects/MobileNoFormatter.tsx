import { ChangeEvent, useState } from "react"
import "./MobileNoFormatter.scoped.css"

const DEFAULT_PREFIX = "+91", DEFAULT_MAX_LENGTH = 10;
const DEFAULT_FORMATS = [
    { pos: 6, sym: " " },
    { pos: 0, sym: "(", len: 4 }, { pos: 3, sym: ") - ", len: 4 }
];
type FormatType = {
    pos: number,
    sym: string,
    len?: number,
}

function isNumber(str: string) {
    return Number.isFinite(Number(str)) && str !== "";
}

function keepOnlyNumbers(str: string) {
    let out = "";
    for (let i = 0; i < str.length; i++) {
        const char = str[i].trim();
        if (isNumber(char)) out += char;
    }

    return out;
}

function format(_str: string, prefix: string, formats: FormatType[], maxLength: number) {
    const str = keepOnlyNumbers(_str.replaceAll(prefix, "")); // removing prefix and all symbols from the string

    const sortedFormats = [...formats].sort((a, b) => a.pos - b.pos);
    let ans = "", formatIdx = 0;

    for (let i = 0; i < str.length; i++) {
        const char = str[i];

        const { pos, sym, len } = sortedFormats[formatIdx] || {};
        if (pos === i) {
            if (len) {
                // if there is len in the format then -> apply the symbol only when string length becomes >= the given length in the format
                if (str.length >= len) ans += (sym + char);
                else ans += char;
            } else ans += (sym + char);

            formatIdx++;
        } else ans += char;

        if (i === maxLength - 1) break;
    }

    return { raw: str.slice(0, maxLength), formatted: ans ? prefix + ' ' + ans : ans };
}

interface MobileNoFormatterProps {
    prefix?: string,
    formats?: FormatType[],
    maxLength?: number,
}
export default function MobileNoFormatter({
    prefix = DEFAULT_PREFIX,
    formats = DEFAULT_FORMATS,
    maxLength = DEFAULT_MAX_LENGTH
}: MobileNoFormatterProps) {
    const [value, setValue] = useState({ raw: "", formatted: "" });

    function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
        const inputEle = e.currentTarget;
        const val = inputEle.value.trim();

        const { raw, formatted } = format(val, prefix, formats, maxLength);
        setValue({ raw, formatted });
    }

    return (
        <div className="content">
            <input className="currencyInput" type="text" value={value.formatted} onChange={handleInputChange} autoFocus />
        </div>
    )
}