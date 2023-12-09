const WEEK_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const YEARS = new Array(102).fill(0).map((_, idx) => idx + 1999); // 1999 - 2100
const TODAY = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);

let currDate = new Date();

const monthChangerEle = document.getElementById("monthChanger");
const weekDaysEle = document.getElementById("weekDays");
const monthDatesEle = document.getElementById("monthDates");
const selectedDateEle = document.getElementById("selectedDate");
monthDatesEle.addEventListener("click", handleDateClick);
monthChangerEle.addEventListener("change", handleChange);
monthChangerEle.addEventListener("click", handleClick);


// default renders
renderSelectField(MONTHS, "month", (item, idx) => currDate.getMonth() === idx);
renderSelectField(YEARS, "year", (item, idx) => currDate.getFullYear() === item);
renderWeekdays();
renderDates();


// event handlers
function handleClick(e) {
    const { type } = e?.target?.dataset || {};

    if (["prev", "next"].includes(type)) {
        const currDateMonth = currDate.getMonth(), currDateYear = currDate.getFullYear();
        let newDateMonth = currDateMonth, newDateYear = currDateYear;
        if (type == "prev") {
            newDateMonth = currDateMonth - 1 < 0 ? 11 : currDateMonth - 1;
            newDateYear = currDateMonth - 1 < 0 ? currDateYear - 1 : currDateYear
        } else if (type == "next") {
            newDateMonth = currDateMonth + 1 > 11 ? 0 : currDateMonth + 1;
            newDateYear = currDateMonth + 1 > 11 ? currDateYear + 1 : currDateYear;
        }

        currDate = new Date(newDateYear, newDateMonth, 1);

        renderDates();
        renderSelectField(MONTHS, "month", (item, idx) => currDate.getMonth() === idx);
        renderSelectField(YEARS, "year", (item, idx) => currDate.getFullYear() === item);
    }
}

function handleChange(e) {
    const { type } = e?.target?.dataset || {};
    const value = e?.target?.value;

    const currDateMonth = currDate.getMonth(), currDateYear = currDate.getFullYear();
    if (type == "month") {
        currDate = new Date(currDateYear, MONTHS.indexOf(value), 1);
        renderDates();
    } else if (type == "year") {
        currDate = new Date(value, currDateMonth, 1);
        renderDates();
    }
}

function handleDateClick(e) {
    const { date, month, year } = e?.target?.dataset || {};

    if (date && month >= 0 && year) {
        currDate = new Date(year, month, date);
        renderDates();
    }
}


// rendering functions
function renderSelectField(data, type, checkSelectedOptionCB) {
    const selectFieldEle = document.querySelector(`#monthChanger [data-type="${type}"]`);

    const tempEle = document.createElement("div");
    data.forEach((item, idx) => {
        const optionEle = document.createElement("option");
        optionEle.innerText = item;
        optionEle.value = item;
        optionEle.defaultSelected = checkSelectedOptionCB(item, idx)

        tempEle.append(optionEle);
    });

    selectFieldEle.innerHTML = tempEle.innerHTML;
}

function renderWeekdays() {
    const tempEle = document.createElement("div");

    WEEK_DAYS.forEach((day, idx) => {
        const weekDayEle = document.createElement("div");
        weekDayEle.innerText = day[0];
        weekDayEle.classList.add("cell");

        if (idx === 0) weekDayEle.classList.add("sunday"); // highlighting sunday

        tempEle.append(weekDayEle);
    });

    weekDaysEle.innerHTML = tempEle.innerHTML;
}

function renderDates() {
    // getting first and last day/date of the month of the current date
    const currDateDate = currDate.getDate(), currDateMonth = currDate.getMonth(), currDateYear = currDate.getFullYear();
    const firstDayOfTheMonthOfCurrDate = new Date(currDateYear, currDateMonth, 1);
    const lastDayOfTheMonthOfCurrDate = new Date(currDateYear, currDateMonth + 1, 0);

    const dayOfFirstDayOfTheMonthOfCurrDate = firstDayOfTheMonthOfCurrDate.getDay();
    const dateOfLastDayOfTheMonthOfCurrDate = lastDayOfTheMonthOfCurrDate.getDate();
    // getting first and last day/date of the month of the current date


    // for placing the first date of the month at correct day position, we need to push dummy cell elements before the first date
    const tempEle = document.createElement("div");
    for (let i = 0; i < dayOfFirstDayOfTheMonthOfCurrDate; i++) {
        const dummyCellEle = document.createElement("div");
        dummyCellEle.classList.add("dummyCell");

        tempEle.append(dummyCellEle);
    }
    // for placing the first date of the month at correct day position, we need to push dummy cell elements before the first date


    // first date to last date of the month
    for (let i = 1; i <= dateOfLastDayOfTheMonthOfCurrDate; i++) {
        const thisDate = new Date(currDateYear, currDateMonth, i)
        const dateCellEle = document.createElement("div");
        dateCellEle.classList.add("cell");
        dateCellEle.innerText = i;
        dateCellEle.dataset.date = i;
        dateCellEle.dataset.month = currDateMonth;
        dateCellEle.dataset.year = currDateYear;

        if (thisDate.getTime() === TODAY.getTime()) dateCellEle.classList.add("todayDate"); // highlighting the today date
        if (i === currDateDate) dateCellEle.classList.add("currentDate"); // highlighting the current date
        if ((dayOfFirstDayOfTheMonthOfCurrDate + i - 1) % 7 === 0) dateCellEle.classList.add("sunday"); // highlighting sunday

        tempEle.append(dateCellEle);
    }
    // first date to last date of the month

    monthDatesEle.innerHTML = tempEle.innerHTML;
    renderSelectedDateDate(currDate);
}

function renderSelectedDateDate(currDate) {
    selectedDateEle.innerText = String(currDate).substring(0, 15);
}