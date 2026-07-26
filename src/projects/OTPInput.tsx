import { useRef, useState, useEffect, useCallback, ChangeEvent, KeyboardEvent } from "react";
import "./OTPInput.scoped.css"

function isNumber(str: string) {
    return Number.isFinite(Number(str)) && str.trim() !== "";
}

const DEFAULT_OTP_LENGTH = 6;

const KEY_ARROW_RIGHT = "ArrowRight";
const KEY_ARROW_LEFT = "ArrowLeft";
const KEY_BACKSPACE = "Backspace";

interface OTPInputProps {
    length?: number;
}
export default function OTPInput({ length = DEFAULT_OTP_LENGTH }: OTPInputProps) {
    const otpFieldRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [otp, setOtp] = useState<string[]>(() => new Array(length).fill(""));

    useEffect(() => {
        if (otp.filter(val => isNumber(val)).length === length) console.log("submit otp")
    }, [otp, length]);

    const handleOtpChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const inpIdx = Number(e.currentTarget.name);
        const value = e.currentTarget.value;
        if (!isNumber(value)) return;
        const num = String(Number(value) % 10); // if number is greater than 9 then take only the unit place digit

        setOtp(prev => prev.map((val, idx) => idx === inpIdx ? num : val)); // setting up value in the state
        if (inpIdx + 1 < length) otpFieldRefs.current?.[inpIdx + 1]?.focus(); // making the next otp input in focus
    }, [length]);

    const handleKeyPress = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
        const inpIdx = Number(e.currentTarget.name);
        const value = e.key.trim();

        if (value === KEY_ARROW_RIGHT && inpIdx + 1 < length) otpFieldRefs.current?.[inpIdx + 1]?.focus(); // making the next otp input in focus
        else if (value === KEY_ARROW_LEFT && inpIdx - 1 >= 0) otpFieldRefs.current?.[inpIdx - 1]?.focus(); // making the prev otp input in focus
        else if (value === KEY_BACKSPACE && inpIdx >= 0) {
            setOtp(prev => prev.map((val, idx) => idx === inpIdx ? "" : val)); // clearing up value in the state
            if (inpIdx - 1 >= 0) otpFieldRefs.current?.[inpIdx - 1]?.focus(); // making the prev otp input in focus
        }
    }, [length]);

    return (
        <div className="content">
            <div id="otp">
                {
                    Array.from({ length }).map((_, i) => (
                        <input
                            ref={el => {
                                otpFieldRefs.current[i] = el
                            }}
                            key={i} className="otpInput"
                            name={String(i)}
                            type="text"
                            value={otp[i] || ""}
                            onKeyUp={handleKeyPress}
                            onChange={handleOtpChange}
                            autoFocus={i === 0}
                        />
                    ))
                }
            </div>
        </div>
    )
}