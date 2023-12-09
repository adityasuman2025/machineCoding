// we are assuming this rideShare app for a particular day/today. 


const BUFFER_TIME = "10"; //in minutes
const DATE = "03/03/1999 ";

// https://api.abcxyz.com?startTime=xx&startLocation=yy&endLocation
const rides = [
    {
        id: "asdf",
        userName: "Bhemu Jee",
        startTime: "12:00",
        startLocation: "patna",
        endLocation: "rajgir",
    },
    {
        id: "efgdfdcs",
        userName: "Adarsh Suman",
        startTime: "12:10",
        startLocation: "patna",
        endLocation: "rajgir",
    },
    {
        id: "fdvdvsc",
        userName: "Aditi Singh",
        startTime: "11:50",
        startLocation: "chandi",
        endLocation: "rajgir",
    },
    {
        id: "gvdcsdcx",
        userName: "Biresh Kumar",
        startTime: "11:55",
        startLocation: "noorsarai",
        endLocation: "bsf",
    },
    {
        id: "gvdcsdcx",
        userName: "archana",
        startTime: "12:05",
        startLocation: "patna",
        endLocation: "noorsarai",
    },
];
const ROUTE = ["patna", "noorsarai", "chandi", "ashanagar", "sohsarai", "bsf", "rajgir"];

const rideSearchForm = document.getElementById("rideSearchForm");
rideSearchForm.addEventListener("submit", handleRideSearched);

function handleRideSearched(event) {
    event.preventDefault();

    const startTime = document.getElementsByName("startTime")[0].value;
    const startLocation = document.getElementsByName("startLocation")[0].value;
    const endLocation = document.getElementsByName("endLocation")[0].value;

    searchRidesSuggs(startTime, startLocation, endLocation);
}

function searchRidesSuggs(startTime, startLocation, endLocation) {
    const inStartLoc = startLocation.toLowerCase(), inEndLoc = endLocation.toLowerCase();
    const inStartTimeTS = new Date(DATE + startTime).getTime();

    const inStartLocIdx = ROUTE.indexOf(inStartLoc), inEndLocIdx = ROUTE.indexOf(inEndLoc);
    console.log("inStartLocIdx, inEndLocIdx", inStartLocIdx, inEndLocIdx);

    const foundRides = rides.filter(({ userName, startTime, startLocation, endLocation }) => {
        const startTimeTS = new Date(DATE + startTime).getTime();
        const diffInMins = Math.abs(startTimeTS - inStartTimeTS) / 1000 / 60;

        // time diff is within BUFFER_TIME and start/end location are exactly matching
        if ((diffInMins <= BUFFER_TIME) && (startLocation.toLowerCase() == inStartLoc) && (endLocation.toLowerCase() == inEndLoc)) return true;

        const startLocIdx = ROUTE.indexOf(startLocation), endLocIdx = ROUTE.indexOf(endLocation);
        console.log("startLocIdx, endLocIdx", startLocIdx, endLocIdx, userName);

        // if start/end location index the ride is smaller that start/end location entered by user
        // if start/end location index the ride is greater that start/end location entered by user
        // then they can't share ride because the person's ride will/has end/ended after/before the input ride
        if ((startLocIdx <= inStartLocIdx) && (endLocIdx <= inStartLocIdx)) return false;
        if ((startLocIdx >= inEndLocIdx) && (endLocIdx >= inEndLocIdx)) return false;

        // here only intersecting/within rides will reach
        // if the time difference of ride is within BUFFER_TIME, then they can share ride
        if (diffInMins <= BUFFER_TIME) return true;

        return false;
    });
    renderRidesSuggs(foundRides);
}

const suggsWrapper = document.getElementById("suggsWrapper");
function renderRidesSuggs(foundRides) {
    const frag = document.createDocumentFragment();
    foundRides.forEach(({ userName, startTime, startLocation, endLocation }) => {
        const rideEle = document.createElement("li");

        const userNameEle = document.createElement("div");
        userNameEle.innerText = userName;
        userNameEle.classList.add("rideUser");
        rideEle.append(userNameEle);

        rideEle.append(startLocation + " --> " + endLocation);
        rideEle.append(document.createElement("br"));
        rideEle.append("time: " + startTime);

        frag.append(rideEle);
    });

    suggsWrapper.innerHTML = "";
    suggsWrapper.append(frag);
}