import { useRef, useState, useEffect } from "react"

function isNumber(str) {
    return Number.isFinite(Number(str)) && str.trim() !== "";
}

const OTP_LENGTH = 6;
export default function OTPInput() {
    const otpFieldRefs = useRef([]);
    const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(""));

    useEffect(() => {
        if ("filter", otp.filter(val => isNumber(val)).length === OTP_LENGTH) console.log("submit otp")
    }, [otp]);

    function handleOtpChange(e, inpIdx) {
        const value = e.key.trim();

        if (isNumber(value)) {
            setOtp(prev => prev.map((val, idx) => idx === inpIdx ? value : val)); // setting up value in the state

            if (inpIdx + 1 < OTP_LENGTH) otpFieldRefs.current?.[inpIdx + 1].focus(); // making the next otp input in focus
        } else {
            if (value === "ArrowRight" && inpIdx + 1 < OTP_LENGTH) otpFieldRefs.current?.[inpIdx + 1].focus(); // making the next otp input in focus
            else if (value === "ArrowLeft" && inpIdx - 1 >= 0) otpFieldRefs.current?.[inpIdx - 1].focus(); // making the prev otp input in focus
            else if (value === "Backspace" && inpIdx >= 0) {
                setOtp(prev => prev.map((val, idx) => idx === inpIdx ? "" : val)); // clearing up value in the state
                if (inpIdx - 1 >= 0) otpFieldRefs.current?.[inpIdx - 1].focus(); // making the prev otp input in focus
            }
        }
    }

    return (
        <div id="content">
            <div id="otp">
                {
                    new Array(OTP_LENGTH).fill(0).map((_, i) => (
                        <input
                            ref={el => { otpFieldRefs.current[i] = el }}
                            key={i} className="otpInput"
                            type="text"
                            maxLength={1}
                            value={otp[i]}
                            onKeyUp={(e) => handleOtpChange(e, i)}
                            onChange={() => { }}
                            autoFocus={i === 0}
                        />
                    ))
                }
            </div>
        </div>
    )
}