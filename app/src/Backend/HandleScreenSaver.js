import { questioning } from "./DatabaseConnection.js";
import { TurnIntoArray, RandomColor, RandomNumber_Int, RandomNumber_Float } from "./HandleGeneral.js";

const ShipLimit = 3;
const ShipwreckLimit = 3;
const CannonballLimit = 3;
const RippleLimit = 6;
const WhirlpoolLimit = 2;
const HurricaneLimit = 1;

const SpeedMod = 0.0625;
const SpeedLimit = 0.75;
const Velocity_Deviation = 0.05;
const TurnSpeed = 0.5;
const ReloadSpeed = 0.1;

const Grace_Max = 1500;//1,000ms = 1s

const Impact_Reactions = {
    bounce: ["Ship", "Shipwreck", "Cannonball"],
    jumble: ["Whirlpool", "Hurricane"]
};
const ImpactAble_Types = ["Ship", "Shipwreck", "Whirlpool", "Hurricane", "Cannonball"];
const CrashAble_Types = ["Ship", "Shipwreck", "Cannonball"];
const RippleAble_Types = ["Ship", "Shipwreck"];

const Default_Spawn_Parameters = {
    Ship: {
        xy: null,
        c: null,
        d: null,
        v: null,
        s: 1.0
    },
    Ripple: {
        xy: null,
        c: null,
        g: 0.1,
        s: 1.0
    },
    Shipwreck: {
        xy: null,
        c: null,
        d: null,
        v: null,
        s: 1.0
    },
    Whirlpool: {
        xy: null,
        c: null,
        d: null,
        s: 1.0,
        du: 30000
    },
    Hurricane: {
        xy: null,
        c: null,
        d: null,
        v: null,
        s: 1.0,
        du: 10000
    },
    Cannonball: {
        xy: null,
        c: null,
        d: null,
        v: null,
        s: 1.0,
    }
};

const Ship = {
    hitRadius: 0.025,
    delete: false,
    id: null,
    type: "Ship",
    lives: 3,
    grace: 0,
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
    cannonLoad: 0.5,
    direction: null,
    z: 10200,
    cannon: null
};
const Cannon = {
    delete: false,
    id: null,
    type: "Cannon",
    color: null,
    shapes: [
        {
            shape: "rectangle",
            width: 0.035,
            height: 0.01,
            xOffset: 0.03,
            yOffset: 0.0,
            angle: 0.0,
            fill: null,
            stroke: [0.75, "white"],
            origin: [-0.0175, 0.0]
        }
    ],
    scale: null,
    location: [0.0, 0.0],
    direction: null,
    maxAngle: 45.0,
    z: 10210
};
const Cannonball = {
    hitRadius: 0.01,
    delete: false,
    lives: 1,
    id: null,
    type: "Cannonball",
    color: null,
    shapes: [
        {
            shape: "circle",
            radius: 0.01,
            xOffset: 0.0,
            yOffset: 0.0,
            angle: 0.0,
            fill: null,
            stroke: [0.75, "white"]
        }
    ],
    location: [0.0, 0.0],
    velocity: [0.0, 0.0],
    bounces: 1,
    z: 10220
};

const Ripple = {
    hitRadius: 0.3,
    delete: false,
    id: null,
    type: "Ripple",
    color: null,
    shapes: [
        {
            shape: "circle",
            radius: 0.1,
            xOffset: 0.0,
            yOffset: 0.0,
            angle: 0.0,
            fill: null,
            stroke: null
        },
        {
            shape: "circle",
            radius: 0.2,
            xOffset: 0.0,
            yOffset: 0.0,
            angle: 0.0,
            fill: null,
            stroke: null
        },
        {
            shape: "circle",
            radius: 0.3,
            xOffset: 0.0,
            yOffset: 0.0,
            angle: 0.0,
            fill: null,
            stroke: null
        }
    ],
    weight: null,
    growth: null,
    decay: 0.1,
    location: [0.0, 0.0],
    direction: 0.0,
    z: 10100
};
const Wave = {};

const Shipwreck = {
    hitRadius: 0.025,
    delete: false,
    id: null,
    type: "Shipwreck",
    grace: 0,
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
    sink: 0.025,
    drift: 0.9,
    location: [0.0, 0.0],
    direction: null,
    z: 10200
};
const Whirlpool = {
    hitRadius: 0.05,
    delete: false,
    id: null,
    type: "Whirlpool",
    color: null,
    shapes: [
        {
            shape: "circle",
            radius: 0.05,
            xOffset: 0.0,
            yOffset: 0.0,
            angle: 0.0,
            fill: null,
            stroke: [2.0, "white"]
        },
        {
            shape: "circle",
            radius: 0.035,
            xOffset: 0.0,
            yOffset: 0.0,
            angle: 0.0,
            fill: null,
            stroke: [1.5, "white"]
        },
        {
            shape: "circle",
            radius: 0.02,
            xOffset: 0.0,
            yOffset: 0.0,
            angle: 0.0,
            fill: null,
            stroke: [1.0, "white"]
        },
        {
            shape: "arc",
            x: 0.0,
            y: 0.0,
            r: 0.04,
            a1: 0.0,
            a2: 270.0,
            cc: false,
            xOffset: 0.0,
            yOffset: 0.0,
            angle: 0.0,
            fill: null,
            stroke: [2.0, "white"]
        }
    ],
    scale: null,
    location: [0.0, 0.0],
    direction: null,
    rotationSpeed: 45.0,
    duration: 0.0,
    z: 10110

};
const Hurricane = {
    hitRadius: 0.1,
    delete: false,
    id: null,
    type: "Hurricane",
    color: null,
    shapes: [
        {
            shape: "circle",
            radius: 0.1,
            xOffset: 0.0,
            yOffset: 0.0,
            angle: 0.0,
            fill: null,
            stroke: [2.0, "white"]
        },
        {
            shape: "circle",
            radius: 0.07,
            xOffset: 0.0,
            yOffset: 0.0,
            angle: 0.0,
            fill: null,
            stroke: [1.5, "white"]
        },
        {
            shape: "circle",
            radius: 0.04,
            xOffset: 0.0,
            yOffset: 0.0,
            angle: 0.0,
            fill: null,
            stroke: [1.0, "white"]
        },
        {
            shape: "arc",
            x: 0.0,
            y: 0.0,
            r: 0.085,
            a1: 0.0,
            a2: 240.0,
            cc: false,
            xOffset: 0.0,
            yOffset: 0.0,
            angle: 0.0,
            fill: null,
            stroke: [2.0, "white"]
        },
        {
            shape: "arc",
            x: 0.0,
            y: 0.0,
            r: 0.06,
            a1: 45.0,
            a2: 315.0,
            cc: false,
            xOffset: 0.0,
            yOffset: 0.0,
            angle: 0.0,
            fill: null,
            stroke: [1.5, "white"]
        }

    ],
    scale: null,
    location: [0.0, 0.0],
    velocity: [0.0, 0.0],
    direction: null,
    rotationSpeed: 22.5,
    duration: 0.0,
    z: 10500
};
const Kraken = {};

//Builds a new ship based on provided info (if present)
//xy = Coordinates
//c = Color
//d = Direction
//v = Velocity
//s = Scale
//l_sh_r = List of existing ships
//l_sh_u = List of ships awaiting spawn next frame
function BuildShip(xy, c, d, v, s, l_sh_r, l_sh_u) {

    let newShip = structuredClone(Ship);

    let shipId = 0;
    let shipId_Found = false;
    let Fleet = TurnIntoArray(l_sh_r.concat(l_sh_u));
    let UsedIDs = [];
    for (let Boat of Fleet) {
        UsedIDs.push(Number(Boat.id[5]));
    }
    while (!shipId_Found) {
        if (!UsedIDs.includes(shipId)) {
            break;
        }
        else {
            shipId++;
        }
    }
    newShip.id = "Ship_" + shipId;

    newShip.location = xy != null ? xy : [RandomNumber_Float(0.0, 1.0), RandomNumber_Float(0.0, 1.0)];
    newShip.color = c != null ? c : RandomColor();
    for (let k = 0; k < newShip.shapes.length; k++) {
        newShip.shapes[k].fill = newShip.color;
    }
    newShip.direction = d != null ? d : RandomNumber_Float(0.0, 360.0);
    newShip.velocity = v != null ? v : [RandomNumber_Float(SpeedLimit * -1.0, SpeedLimit), RandomNumber_Float(SpeedLimit * -1.0, SpeedLimit)];
    newShip.scale = s != null ? s : Default_Spawn_Parameters.Ship.s;
    newShip.hitRadius = newShip.hitRadius * newShip.scale;

    newShip.cannon = BuildCannon(newShip);

    return newShip;
}

//Buils a new cannon based on provided info (if present)
//S = Ship owner
function BuildCannon(S) {

    let newCan = structuredClone(Cannon);

    newCan.id = S.id + "_C";

    newCan.color = S.color;
    for (let k = 0; k < newCan.shapes.length; k++) {
        newCan.shapes[k].fill = newCan.color;
    }

    newCan.direction = S.direction;
    newCan.location = S.location;
    newCan.scale = S.scale;

    return newCan;
}

//Builds a new cannonball based on provided info (if present)
//xy = Coordinates
//c = Color
//d = Direction
//v = Velocity
//s = Scale
//l_d_r = List of existing dangers
//l_d_u = List of dangers awaiting spawn next frame
function BuildCannonball(xy, c, d, v, s, l_d_r, l_d_u) {

    let newBall = structuredClone(Cannonball);

    let dangerId = 0;
    let dangerId_Found = false;
    let Ocean = TurnIntoArray(l_d_r.concat(l_d_u));
    let UsedIDs = [];
    for (let Debris of Ocean) {
        UsedIDs.push(Number(Debris.id[7]));
    }
    while (!dangerId_Found) {
        if (!UsedIDs.includes(dangerId)) {
            break;
        }
        else {
            dangerId++;
        }
    }
    newBall.id = "Danger_" + dangerId;

    newBall.location = xy != null ? xy : [RandomNumber_Float(0.0, 1.0), RandomNumber_Float(0.0, 1.0)];
    newBall.direction = d != null ? d : RandomNumber_Float(0.0, 360.0);
    newBall.velocity = v != null ? v : [RandomNumber_Float(SpeedLimit * -1.0, SpeedLimit), RandomNumber_Float(SpeedLimit * -1.0, SpeedLimit)];
    newBall.scale = s != null ? s : Default_Spawn_Parameters.Cannonball.s;
    newBall.hitRadius = newBall.hitRadius * newBall.scale;

    newBall.color = c != null ? c : RandomColor();
    for (let k = 0; k < newBall.shapes.length; k++) {
        newBall.shapes[k].fill = newBall.color;
    }

    return newBall;
}

//Builds a new ripple based on provided info (if present)
//xy = Coordinates
//c = Color
//g = Growth rate
//s = scale
//l_se_r = List of existing sea
//l_se_u = List of sea awaiting spawn next frame
function BuildRipple(xy, c, g, s, l_se_r, l_se_u) {

    let newRipple = structuredClone(Ripple);

    let seaId = 0;
    let seaId_Found = false;
    let Ocean = TurnIntoArray(l_se_r.concat(l_se_u));
    let UsedIDs = [];
    for (let Salt of Ocean) {
        UsedIDs.push(Number(Salt.id[4]));
    }
    while (!seaId_Found) {
        if (!UsedIDs.includes(seaId)) {
            break;
        }
        else {
            seaId++;
        }
    }
    newRipple.id = "Sea_" + seaId;

    newRipple.color = c != null ? c : RandomColor();
    for (let k = 0; k < newRipple.shapes.length; k++) {
        newRipple.shapes[k].stroke = [10.0, newRipple.color];
    }

    newRipple.location = xy != null ? xy : [RandomNumber_Float(0.0, 1.0), RandomNumber_Float(0.0, 1.0)];
    newRipple.scale = s != null ? s : Default_Spawn_Parameters.Ripple.s;
    newRipple.hitRadius = newRipple.hitRadius * newRipple.scale;
    newRipple.growth = g != null ? g : Default_Spawn_Parameters.Ripple.g;

    return newRipple;
}

//Builds a new shipwreck based on provided info (if present)
//xy = Coordinates
//c = Color
//d = Direction
//s = Scale
//l_d_r = List of existing dangers
//l_d_u = List of dangers awaiting spawn next frame
function BuildShipwreck(xy, c, d, s, v, l_d_r, l_d_u) {

    let newWreck = structuredClone(Shipwreck);

    let dangerId = 0;
    let dangerId_Found = false;
    let Ocean = TurnIntoArray(l_d_r.concat(l_d_u));
    let UsedIDs = [];
    for (let Debris of Ocean) {
        UsedIDs.push(Number(Debris.id[7]));
    }
    while (!dangerId_Found) {
        if (!UsedIDs.includes(dangerId)) {
            break;
        }
        else {
            dangerId++;
        }
    }
    newWreck.id = "Danger_" + dangerId;

    newWreck.color = c != null ? c : RandomColor();
    for (let k = 0; k < newWreck.shapes.length; k++) {
        newWreck.shapes[k].fill = newWreck.color;
    }

    newWreck.location = xy != null ? xy : [RandomNumber_Float(0.0, 1.0), RandomNumber_Float(0.0, 1.0)];
    newWreck.direction = d != null ? d : RandomNumber_Float(0.0, 360.0);
    newWreck.scale = s != null ? s : Default_Spawn_Parameters.Shipwreck.s;
    newWreck.hitRadius = newWreck.hitRadius * newWreck.scale;
    newWreck.velocity = v != null ? v : [RandomNumber_Float(SpeedLimit * -1.0, SpeedLimit), RandomNumber_Float(SpeedLimit * -1.0, SpeedLimit)];

    return newWreck;
}

//Builds a whirlpool
//xy = Coordinates
//c = Color
//d = Direction
//s = Scale
//du = Duration
//l_d_r = List of existing dangers
//l_d_u = List of dangers awaiting spawn next frame
function BuildWhirlpool(xy, c, d, s, du, l_d_r, l_d_u) {

    let newPool = structuredClone(Whirlpool);

    let dangerId = 0;
    let dangerId_Found = false;
    let Ocean = TurnIntoArray(l_d_r.concat(l_d_u));
    let UsedIDs = [];
    for (let Debris of Ocean) {
        UsedIDs.push(Number(Debris.id[7]));
    }
    while (!dangerId_Found) {
        if (!UsedIDs.includes(dangerId)) {
            break;
        }
        else {
            dangerId++;
        }
    }
    newPool.id = "Danger_" + dangerId;

    newPool.color = c != null ? c : RandomColor();
    for (let k = 0; k < newPool.shapes.length; k++) {
        newPool.shapes[k].stroke = [newPool.shapes[k].stroke[0], newPool.color];
    }

    newPool.location = xy != null ? xy : [RandomNumber_Float(0.0, 1.0), RandomNumber_Float(0.0, 1.0)];
    newPool.direction = d != null ? d : RandomNumber_Float(0.0, 360.0);
    newPool.scale = s != null ? s : Default_Spawn_Parameters.Whirlpool.s;
    newPool.hitRadius = newPool.hitRadius * newPool.scale;
    newPool.duration = du != null ? du : Default_Spawn_Parameters.Whirlpool.du;

    return newPool;
}

//Builds a hurricane
//xy = Coordinates
//c = Color
//d = Direction
//s = Scale
//du = Duration
//v = Velocity
//l_d_r = List of existing dangers
//l_d_u = List of dangers awaiting spawn next frame
function BuildHurricane(xy, c, d, s, du, v, l_d_r, l_d_u) {

    let newStorm = structuredClone(Hurricane);

    let dangerId = 0;
    let dangerId_Found = false;
    let Ocean = TurnIntoArray(l_d_r.concat(l_d_u));
    let UsedIDs = [];
    for (let Debris of Ocean) {
        UsedIDs.push(Number(Debris.id[7]));
    }
    while (!dangerId_Found) {
        if (!UsedIDs.includes(dangerId)) {
            break;
        }
        else {
            dangerId++;
        }
    }
    newStorm.id = "Danger_" + dangerId;

    newStorm.color = c != null ? c : RandomColor();
    for (let k = 0; k < newStorm.shapes.length; k++) {
        if (newStorm.shapes[k].stroke) {
            newStorm.shapes[k].stroke = [newStorm.shapes[k].stroke[0], newStorm.color];
        }
    }

    newStorm.location = xy != null ? xy : [RandomNumber_Float(0.0, 1.0), RandomNumber_Float(0.0, 1.0)];
    newStorm.direction = d != null ? d : RandomNumber_Float(0.0, 360.0);
    newStorm.scale = s != null ? s : Default_Spawn_Parameters.Hurricane.s;
    newStorm.hitRadius = newStorm.hitRadius * newStorm.scale;
    newStorm.duration = du != null ? du : Default_Spawn_Parameters.Hurricane.du;
    newStorm.velocity = v != null ? v : [RandomNumber_Float(SpeedLimit * -1.0, SpeedLimit), RandomNumber_Float(SpeedLimit * -1.0, SpeedLimit)];

    return newStorm;
}

//Checks if object is of a type that can be impacted
//V = Object to check
function Impactable(V) {
    if (V && V.type != undefined && ImpactAble_Types.includes(V.type)) {
        return true;
    }
    else {
        return false;
    }
}

//Returns response based on what was crashed into
//R = Object crashed into
function ImpactReaction(R) {

    if (Impact_Reactions.bounce.includes(R.type)) {
        return "Bounce";
    }
    else if (Impact_Reactions.jumble.includes(R.type)) {
        return "Jumble";
    }
    else {
        console.log("Error: Failed to figure out impact reaction! Bouncing for now!");
        return "Bounce";
    }
}

//Checks if object can crash into something
//C = Object to check
function Crashable(C) {
    if (C && C.type != undefined && CrashAble_Types.includes(C.type)) {
        return true;
    }
    else {
        return false;
    }
}

//Checks if object can cause ripple
//R = Object to check
function CausesRipple(R) {
    if (R && R.type != undefined && RippleAble_Types.includes(R.type)) {
        return true;
    }
    else {
        return false;
    }
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

//Handles functionality of given ship's cannon returning a json of results
//S = Ship
//Fleet = List of all ships
//Dim = Boundary dimensions
function ReadyCannon(S, Fleet, Dim) {

    let Results = {
        Ship: S,
        Cannonball: null
    }

    Results.Ship.cannon.direction = S.direction;

    if (S.cannonLoad >= 1.0) {
        
        let AimReady = false;

        if (S.cannon != null) {

            let theCannon = S.shapes[S.shapes.length - 1];
            let shipDirection = S.direction != null ? S.direction : 0.0;

            let cannonAngle = S.cannon.direction != null ? S.cannon.direction : 0.0;
            let cannonDirection = cannonAngle;

            const normalize = (a) => { a = a % 360.0; return a < 0 ? a + 360.0 : a; };
            cannonDirection = normalize(cannonDirection);
            const ANGLE_TOLERANCE = 10.0;

            for (let Boat of Fleet) {

                if (!Boat || Boat.id === S.id) continue;
                if (!Boat.location || !S.location) continue;

                let dx = (Boat.location[0] * Dim[0]) - (S.location[0] * Dim[0]);
                let dy = (Boat.location[1] * Dim[1]) - (S.location[1] * Dim[1]);
                let boatDirection = Math.atan2(dy, dx) * (180.0 / Math.PI);

                boatDirection = normalize(boatDirection);

                let directionDifference = Math.abs(cannonDirection - boatDirection);

                if (directionDifference > 180.0) directionDifference = 360.0 - directionDifference;

                if (directionDifference <= ANGLE_TOLERANCE) {
                    AimReady = true;
                    break;
                }
            }

            if (AimReady) {
                let CB_S = Default_Spawn_Parameters.Cannonball;
                CB_S.d = 0.0;
                CB_S.c = S.color;

                let angleRad = cannonDirection * Math.PI / 180;
                let lengthPx = S.cannon.shapes[0].width * Dim[1];
                let tipX = (S.location[0] * Dim[0] + lengthPx * Math.cos(angleRad)) / Dim[0];
                let tipY = (S.location[1] * Dim[1] + lengthPx * Math.sin(angleRad)) / Dim[1];
                CB_S.xy = [tipX, tipY];

                let c_Speed = RandomNumber_Float(0.0, SpeedLimit);
                CB_S.v = [0.0, 0.0];
                CB_S.v[0] = c_Speed * Math.cos(cannonDirection * (Math.PI / 180));
                CB_S.v[1] = c_Speed * Math.sin(cannonDirection * (Math.PI / 180));
                Results.Cannonball = CB_S;

                Results.Ship.velocity[0] += (CB_S.v[0] * -1.0);
                Results.Ship.velocity[1] += (CB_S.v[1] * -1.0);

                Results.Ship.cannonLoad = 0.0;
            }
        }

    }
    else if (S.cannonLoad < 1.0) {
        S.cannonLoad += ReloadSpeed;
    }

    return Results;

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
    GetScreenSaverStatus, ChangeScreenSaverStatus, Default_Spawn_Parameters, Impactable, CausesRipple, Crashable, ImpactReaction,
    ShipLimit, RippleLimit, ShipwreckLimit, WhirlpoolLimit, HurricaneLimit, CannonballLimit,
    SpeedMod, SpeedLimit, Velocity_Deviation, Grace_Max,
    Ship, Cannon, Cannonball, Ripple, Wave, Shipwreck, Whirlpool, Hurricane, Kraken,
    BuildShip, BuildRipple, BuildShipwreck, BuildWhirlpool, BuildHurricane, BuildCannonball,
    CleanUpScrap, GenerateVelocityDeviation, HandleMovement, HandleDirection, ReadyCannon
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