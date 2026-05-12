const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

//Converts date into format more suited for frontend
//D = Date from database
function ConvertWeekSimple(D) {
    return (new Date(D)).toISOString().slice(0, 10);
}

//Determine which Sunday of the month the provided date falls in
//D = Date
function WhichSunday(D) {

    let date = new Date(D);
    let sunday = new Date(date);

    sunday.setUTCHours(12, 0, 0, 0);

    while (sunday.getUTCDay() !== 0) {
        sunday.setUTCDate(sunday.getUTCDate() - 1);
    }

    let dayOfMonth = sunday.getUTCDate();
    return Math.floor((dayOfMonth - 1) / 7) + 1;
}

//Checks if provided date is on the start date for daylight savings time
//D = Date
function IsDaylightSavingsTimeStart(D) {
    let date = new Date(D);
    let isMarch = date.getUTCMonth() === 2;
    let isSunday = date.getUTCDay() === 0;
    return isMarch && isSunday && WhichSunday(date) === 2;
}

//Checks if provided date is on the end date for daylight savings time
//D = Date
function IsDaylightSavingsTimeEnd(D) {
    let date = new Date(D);
    let isNovember = date.getUTCMonth() === 10;
    let isSunday = date.getUTCDay() === 0;
    return isNovember && isSunday && WhichSunday(date) === 1;
}

//Adjusts date for daylight savings time (only for start and end dates)
//D = Date
function AdjustForDST_SE(D) {
    if (IsDaylightSavingsTimeStart(D)) {
        let newD = D;
        newD.setHours(newD.getHours() + 1);
        return newD;
    }
    else if (IsDaylightSavingsTimeEnd(D)) {
        let newD = D;
        newD.setHours(newD.getHours() - 1);
        return newD;
    }
    else {
        return D;
    }
}

//Returns the week day of the provided date
//D = Date
function GetWeekDay(D) {
    let olddate = new Date(D);
    return days[olddate.getUTCDay()];
}

//Returns the month of the provided date
//D = Date
function GetWeekMonth(D) {
    let olddate = new Date(D);
    return months[olddate.getUTCMonth()];
}

//Returns Month followed by day (ex: February 15)
//D = Date
function GetReadableDate(D) {
    let oldDate = new Date(D);
    return GetWeekMonth(oldDate) + " " + oldDate.getUTCDate();
}

//Gets the date of the Sunday in the same week as the provided date
//D = Date
function GetSundayOfWeek(D) {
    let today = new Date(D);
    while (GetWeekDay(today) != "Sunday") {
        today.setDate(today.getDate() - 1);
    }
    return today;
}

//Converts string time into number equal to number of minutes of day
//Z = Time (ex: "10:00 AM")
function ConvertTimeToANumber(Z) {

    let chop = Z.split(":");

    let h = chop[0];
    let m = chop[1][0] + "" + chop[1][1];
    let b = Z.split(" ")[1];

    h = Number(h);
    h = (h == 12 ? 0 : h * 60);
    m = Number(m);
    b = (b == "AM" ? 0 : 720);

    return h + m + b;
}

//Checks date B is same week or later as date A
//A = Date A
//B = Date B
function IsSameWeekOrLater(A, B) {
    let DateA = new Date(A);
    DateA.setHours(0, 0, 0, 0);
    DateA = AdjustForDST_SE(DateA);
    DateA = GetSundayOfWeek(DateA);

    let DateB = new Date(B);
    DateB.setHours(0, 0, 0, 0);
    DateB = AdjustForDST_SE(DateB);
    DateB = GetSundayOfWeek(DateB);

    if (DateB.getTime() >= DateA.getTime()) {
        return true;
    }
    else {
        return false;
    }
}

export {
    ConvertWeekSimple, GetSundayOfWeek, GetWeekMonth, GetWeekDay, GetReadableDate, days, months,
    IsDaylightSavingsTimeStart, IsDaylightSavingsTimeEnd, AdjustForDST_SE, ConvertTimeToANumber, IsSameWeekOrLater
};