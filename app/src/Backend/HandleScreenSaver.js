import { questioning } from "./DatabaseConnection.js";
import { TurnIntoArray, RandomColor, RandomNumber_Int, RandomNumber_Float } from "./HandleGeneral.js";

const ShipLimit = 3;
const SpeedMod = 0.0625;
const SpeedLimit = 0.75;
const Velocity_Deviation = 0.05;
const TurnSpeed = 0.5;

const Ship = {
    hitRadius: 0.025,
    delete: false,
    id: null,
    type: "Ship",
    lives: 3,
    color: null,
    shapes: [
        {
            shape: "ellipse",
            xRadius: 0.05,
            yRadius: 0.025,
            xOffset: 0.0,
            yOffset: 0.0,
            angle: 0.0,
            fill: null,
            stroke: [0.75, "white"]
        },
        {
            shape: "rectangle",
            width: 0.05,
            height: 0.00625,
            xOffset: -0.0125,
            yOffset: 0.0,
            angle: 0.0,
            fill: null,
            stroke: [2.0, "white"]
        },
        {
            shape: "rectangle",
            width: 0.012,
            height: 0.05,
            xOffset: -0.0125,
            yOffset: 0.0,
            angle: 0.0,
            fill: null,
            stroke: [2.0, "white"]
        },
        {
            shape: "rectangle",
            width: 0.0075,
            height: 0.025,
            xOffset: -0.025,
            yOffset: 0.0,
            angle: 0.0,
            fill: null,
            stroke: [2.0, "white"]
        }
    ],
    scale: null,
    location: [0.0, 0.0],
    velocity: [0.0, 0.0],
    direction: null,
    z: 10110
};
const Cannon = {
    delete: false,
    id: null,
    type: "Cannon",
    color: null,
    shapes: [],
    direction: null,
    z: 10115
};
const Cannonball = {
    delete: false,
    id: null,
    type: "Cannonball",
    color: null,
    shapes: [],
    location: [0.0, 0.0],
    velocity: [0.0, 0.0],
    bounces: 1,
    z: 10120
};

const Ripple = {
    delete: false,
    id: null,
    type: "Ripple",
    color: null,
    shapes: [],
    weight: null,
    location: [0.0, 0.0],
    z: 10105
};
const Wave = {};

const Shipwreck = {};
const Whirlpool = {};
const Hurricane = {};
const Kraken = {};

//Builds a new ship based on provided info (if present)
//xy = Coordinates
//c = Color
//d = Direction
//v = Velocity
//s = scale
//l_sh = List of existing ships
//l_se = List of existing sea
//l_d = List of existing dangers
function BuildShip(xy, c, d, v, s, l_sh, l_se, l_d) {

    let newShip = structuredClone(Ship);
    let shipId = 0;
    let shipId_Found = false;

    let allObjects = l_sh.concat(l_se).concat(l_d);
    while (!shipId_Found) {
        if (TurnIntoArray(allObjects.filter(S => S.id == shipId)).length == 0) {
            break;
        }
        else {
            shipId++;
        }
    }
    newShip.id = shipId;
    newShip.location = xy != null ? xy : [RandomNumber_Float(0.0, 1.0), RandomNumber_Float(0.0, 1.0)];
    newShip.color = c != null ? c : RandomColor();
    for (let k = 0; k < newShip.shapes.length; k++) {
        newShip.shapes[k].fill = newShip.color;
    }
    newShip.direction = d != null ? d : RandomNumber_Float(0.0, 360.0);
    newShip.velocity = v != null ? v : [RandomNumber_Float(0.0, SpeedLimit), RandomNumber_Float(0.0, SpeedLimit)];
    newShip.scale = s != null ? s : 1.0;

    return newShip;
}

//Checks through to delete what is no longer needed
//X = Array of JSON objects
function CleanUpScrap(X) {
    if (X && Array.isArray(X) && X.length > 0) {
        return TurnIntoArray(X.filter(thing => !thing.delete));
    }
    else {
        return X;
    }
}

//Returns random deviation in velocity
function GenerateVelocityDeviation() {
    return RandomNumber_Float(Velocity_Deviation * -1.0, Velocity_Deviation);
}

//Handles velocity and location changes of provided object then returns it
//X = Moving object
function HandleMovement(X) {

    let O = structuredClone(X);

    if (O.velocity[0] >= SpeedLimit || O.velocity[0] <= (SpeedLimit * -1.0)) {
        O.velocity[0] = O.velocity[0] >= 0.0 ? SpeedLimit : SpeedLimit * -1.0;
    }
    if (O.velocity[1] >= SpeedLimit || O.velocity[1] <= (SpeedLimit * -1.0)) {
        O.velocity[1] = O.velocity[1] >= 0.0 ? SpeedLimit : SpeedLimit * -1.0;
    }

    O.location[0] += (O.velocity[0] * SpeedMod);
    O.location[1] += (O.velocity[1] * SpeedMod);

    return O;
}

//Handles direction changes of provided object based on velocity then returns it
//X = Moving object
function HandleDirection(X) {

    if (X.velocity[0] == 0.0 && X.velocity[1] == 0.0) {
        return X;
    }

    let O = structuredClone(X);

    let CurrentDirection = O.direction;

    let IntendedDirection = Math.atan2(O.velocity[1], O.velocity[0]) * (180.0 / Math.PI);
    IntendedDirection = IntendedDirection < 0.0 ? IntendedDirection + 360.0 : IntendedDirection;

    let NewDirection = IntendedDirection;

    if ((CurrentDirection <= IntendedDirection && CurrentDirection / IntendedDirection >= 0.85) || (CurrentDirection >= IntendedDirection && IntendedDirection / CurrentDirection >= 0.85)) {//close enough
        NewDirection = IntendedDirection;
    }
    else if (IntendedDirection != CurrentDirection) {

        let Change = 0.0;

        if (CurrentDirection > IntendedDirection) {
            Change = (CurrentDirection - IntendedDirection) * -1.0;
        }
        else {
            Change = IntendedDirection - CurrentDirection;
        }

        Change = Change * TurnSpeed;

        NewDirection = CurrentDirection + Change;
    }

    O.direction = NewDirection;
    return O;
}

//Handles collusion
//X = Main object
//T = Crash site
function HandleCollusion(X, T) {
    //
    let O = structuredClone(X);
}

//Checks if screen saver is in use
async function GetScreenSaverStatus() {
    return JSON.parse(await questioning("SELECT Data FROM ref WHERE Basis = ?", ['ScreenSaver_Toggle']))[0].Data.active;
}

//Updates lock on mode swapping
//K = Key required or not
async function ChangeScreenSaverStatus(K) {
    let J = {
        active: K
    }
    await questioning(
        "UPDATE ref SET Data = ? WHERE Basis = ?",
        [JSON.stringify(J), 'ScreenSaver_Toggle']
    );
}

export {
    GetScreenSaverStatus, ChangeScreenSaverStatus,
    ShipLimit, SpeedMod, SpeedLimit, Velocity_Deviation,
    Ship, Cannon, Cannonball, Ripple, Wave, Shipwreck, Whirlpool, Hurricane, Kraken,
    BuildShip,
    CleanUpScrap, GenerateVelocityDeviation, HandleMovement, HandleDirection, HandleCollusion
};

// {
//     shape: "circle",
//     radius: 0.25,
//     xOffset: 0.0,
//     yOffset: 0.0,
//     angle: 0.0,
//     fill: null,
//     stroke: [0.75, "white"]
// },
// {
//     shape: "rectangle",
//     width: 0.5,
//     height: 0.25,
//     xOffset: 0.0,
//     yOffset: 0.0,
//     angle: 0.0,
//     fill: null,
//     stroke: [0.75, "white"]
// },
// {
//     shape: "ellipse",
//     xRadius: 0.25,
//     yRadius: 0.125,
//     xOffset: 0.0,
//     yOffset: 0.0,
//     angle: 0.0,
//     fill: null,
//     stroke: [0.75, "white"]
// },
// {
//     shape: "roundRectangle",
//     width: 0.5,
//     height: 0.25,
//     radius: 15.0,
//     xOffset: 0.0,
//     yOffset: 0.0,
//     angle: 0.0,
//     fill: null,
//     stroke: [0.75, "white"]
// },
// {
//     shape: "line",
//     points: [[0.1, 0.1], [0.1, 0.5], [0.5, 0.1]],
//     xOffset: 0.0,
//     yOffset: 0.0,
//     angle: 0.0,
//     fill: null,
//     stroke: [1.5, "white"]
// },
// {
//     shape: "arc",
//     x: 0.0,
//     y: 0.0,
//     r: 0.076,
//     a1: 0.0,
//     a2: 90.0,
//     cc: false,
//     xOffset: 0.0,
//     yOffset: 0.0,
//     angle: 0.0,
//     fill: null,
//     stroke: [2.0, "white"]
// },
// {
//     shape: "arcTo",
//     x1: 0.25,
//     y1: 0.25,
//     x2: 0.25,
//     y2: 0.75,
//     r: 0.5,
//     xOffset: 0.0,
//     yOffset: 0.0,
//     angle: 0.0,
//     fill: null,
//     stroke: [2.0, "white"]
// },
// {
//     shape: "polygon",
//     points: [
//         { x: 0.1, y: 0.1 },
//         { x: 0.25, y: 0.1 },
//         { x: 0.5, y: 0.5 },
//         { x: 0.75, y: 0.75 }
//     ],
//     closed: true,
//     xOffset: 0.0,
//     yOffset: 0.0,
//     angle: 0.0,
//     fill: null,
//     stroke: [2.0, "white"]
// }