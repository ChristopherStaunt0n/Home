//Return varaible placed into an array if it isn't an array already
//A = Variable that may be an array
function TurnIntoArray(A) {
    if (!Array.isArray(A)) {
        return [A];
    }
    else {
        return A;
    }
}

//Generates a random integer
//min = Minimum value
//max = Maximum value
function RandomNumber_Int(min, max) {
    let n = Math.ceil(min);
    let x = Math.floor(max);
    return Math.floor(Math.random() * (x - n + 1)) + n;
}

//Generates a random float
//min = Minimum value
//max = Maximum value
function RandomNumber_Float(min, max) {
    return Math.random() * (max - min) + min;
}

//Picks a random color (ex: rgb(1, 2, 3, 1.0))
function RandomColor() {
    return "rgb(" + RandomNumber_Int(0, 255) + ", " + RandomNumber_Int(0, 255) + ", " + RandomNumber_Int(0, 255) + ", 1.0)";
}

//Capitalizes the provided string
//S = String
function Capitalize(S) {
    if (!S) {
        return S;
    }
    else if (S.length > 1) {
        return S.charAt(0).toUpperCase() + str.slice(1);
    }
    else {
        return S.toUpperCase();
    }
}

//Wait function for frontend javascript
//ms = Miliseconds to wait (1000ms=1s)
const Wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export { TurnIntoArray, Wait, RandomNumber_Int, RandomNumber_Float, RandomColor, Capitalize };