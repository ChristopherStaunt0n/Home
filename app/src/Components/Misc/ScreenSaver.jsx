'use client';
import Saver_S from "./Styles/Saver.module.css";
import { useState, useEffect, useRef } from 'react';
import { Application, extend, useTick } from '@pixi/react';
import { Container, Graphics, Rectangle, RoundedRectangle, Sprite } from 'pixi.js';
extend({ Graphics, Container });
import { TurnIntoArray, RandomColor, RandomNumber_Int, RandomNumber_Float } from "../../Backend/HandleGeneral.js";
import GenerateArt from "./BaseGraphic.jsx";
import {
    Default_Spawn_Parameters, Impactable, CausesRipple, Crashable, ImpactReaction,
    ShipLimit, RippleLimit, ShipwreckLimit, WhirlpoolLimit, HurricaneLimit,
    SpeedMod, SpeedLimit, Velocity_Deviation, Grace_Max,
    Ship, Cannon, Cannonball, Ripple, Wave, Shipwreck, Whirlpool, Hurricane, Kraken,
    BuildShip, BuildRipple, BuildShipwreck, BuildWhirlpool, BuildHurricane,
    CleanUpScrap, GenerateVelocityDeviation, HandleMovement, HandleDirection
} from "../../Backend/HandleScreenSaver.js";

// Screen saver involving ships
export default function Saver(Q) {

    const Saver_Device = [Saver_S.Computer, Saver_S.Mobile];
    const Saver_Mode = [Saver_S.Public, Saver_S.Private];

    const CanvasRef = useRef(null);
    const [CanvasDimensions, setCanvasDimensions] = useState([0.0, 0.0]);
    const SecondsPerFrame = 250//1,000ms = 1s

    const [Ships, setShips] = useState([]);
    const [Sea, setSea] = useState([]);
    const [Dangers, setDangers] = useState([]);

    const Ship_Chance = 0.5;
    const Ship_Frequency = 5000;//30000;
    const [Ship_Next, setShip_Next] = useState(0);

    const Danger_Chance = 0.25;
    const Danger_Frequency = 10000;
    const [Danger_Next, setDanger_Next] = useState(0);
    const PotentialDangers = ["Whirlpool", "Hurricane"];

    const Spawner = useRef({
        Ships: [],
        Sea: [],
        Dangers: []
    });

    //Loads initial dimensions of screen saver
    useEffect(() => {
        if (CanvasRef.current) {
            setCanvasDimensions([CanvasRef.current.offsetWidth, CanvasRef.current.offsetHeight]);
            Setup();
        }
    }, []);

    //Update positions and handle collisions
    useEffect(() => {
        const interval = setInterval(() => {

            let exShips = structuredClone(Ships);
            let exSea = structuredClone(Sea);
            let exDangers = structuredClone(Dangers);

            if (Ship_Next >= Ship_Frequency) {
                setShip_Next(0);
                if (RandomNumber_Int(0, 100) <= (100 * Ship_Chance)) {
                    Spawn("Ship", Default_Spawn_Parameters.Ship);
                }
            }
            else {
                setShip_Next(Ship_Next + SecondsPerFrame);
            }

            if (Danger_Next >= Danger_Frequency) {
                setDanger_Next(0);
                if (RandomNumber_Int(0, 100) <= (100 * Danger_Chance)) {
                    let WhatSpawns = PotentialDangers[RandomNumber_Int(0, PotentialDangers.length - 1)];
                    switch (WhatSpawns) {
                        case "Whirlpool":
                            Spawn("Whirlpool", Default_Spawn_Parameters.Whirlpool);
                            break;
                        case "Hurricane":
                            Spawn("Hurricane", Default_Spawn_Parameters.Hurricane);
                            break;
                        default:
                            console.log("SS: Danger Evaded...");
                    }
                }
            }
            else {
                setDanger_Next(Danger_Next + SecondsPerFrame);
            }

            for (let i = 0; i < exShips.length; i++) {
                exShips[i] = AdvanceShip(exShips[i]);
            }
            for (let i = 0; i < exSea.length; i++) {
                exSea[i] = AdvanceSea(exSea[i]);
            }
            for (let i = 0; i < exDangers.length; i++) {
                exDangers[i] = AdvanceDanger(exDangers[i]);
            }

            if (Spawner.current.Ships.length > 0) {
                exShips = TurnIntoArray(exShips.concat(structuredClone(Spawner.current.Ships)));
                Spawner.current.Ships = [];
            }
            if (Spawner.current.Sea.length > 0) {
                exSea = TurnIntoArray(exSea.concat(structuredClone(Spawner.current.Sea)));
                Spawner.current.Sea = [];
            }
            if (Spawner.current.Dangers.length > 0) {
                exDangers = TurnIntoArray(exDangers.concat(structuredClone(Spawner.current.Dangers)));
                Spawner.current.Dangers = [];
            }

            setShips(CleanUpScrap(exShips));
            setSea(CleanUpScrap(exSea));
            setDangers(CleanUpScrap(exDangers));

            console.log("New Frame");
            console.log("Current:", exShips, exSea, Dangers);

        }, SecondsPerFrame);
        return () => clearInterval(interval);
    }, [Ships, Sea, Dangers]);

    //Spawns an objects into screen saver
    //T = Type of spawn
    //S = Initial status
    function Spawn(T, S) {
        switch (T) {
            case "Ship":
                if (ShipLimit > Ships.length) {
                    Spawner.current.Ships.push(BuildShip(S.xy, S.c, S.d, S.v, S.s, Ships, Spawner.current.Ships));
                }
                break;
            case "Ripple":
                if (RippleLimit > TurnIntoArray(Sea.concat(Spawner.current.Sea).filter(O => O.type === "Ripple")).length) {
                    Spawner.current.Sea.push(BuildRipple(S.xy, S.c, S.g, S.s, Sea, Spawner.current.Sea));
                }
                break;
            case "Shipwreck":
                if (ShipwreckLimit > TurnIntoArray(Dangers.concat(Spawner.current.Dangers).filter(O => O.type === "Shipwreck")).length) {
                    Spawner.current.Dangers.push(BuildShipwreck(S.xy, S.c, S.d, S.s, S.v, Dangers, Spawner.current.Dangers));
                }
                break;
            case "Whirlpool":
                if (WhirlpoolLimit > TurnIntoArray(Dangers.concat(Spawner.current.Dangers).filter(O => O.type === "Whirlpool")).length) {
                    Spawner.current.Dangers.push(BuildWhirlpool(S.xy, S.c, S.d, S.s, S.du, Dangers, Spawner.current.Dangers));
                }
                break;
            case "Hurricane":
                if (HurricaneLimit > TurnIntoArray(Dangers.concat(Spawner.current.Dangers).filter(O => O.type === "Hurricane")).length) {
                    Spawner.current.Dangers.push(BuildHurricane(S.xy, S.c, S.d, S.s, S.du, S.v, Dangers, Spawner.current.Dangers));
                }
                break;
            default:
                console.log("Error: Failed to spawn something in screen saver!");
        }
    }

    //Setups initial screen data
    function Setup() {
        setShips([]);
        setSea([]);
        setDangers([]);
    }

    //Checks if object collides with anything
    //O = Object JSON
    function CheckForCollusions(O) {

        let X = structuredClone(O);
        let Hit_Boundary = false;

        if (X.velocity != undefined) {

            if (X.location[0] >= 1.0 - X.hitRadius) {
                X.velocity[0] = X.velocity[0] > 0.0 ? X.velocity[0] * -1.0 + GenerateVelocityDeviation() : X.velocity[0];
                Hit_Boundary = true;
            }
            else if (X.location[0] <= 0.0 + X.hitRadius) {
                X.velocity[0] = X.velocity[0] < 0.0 ? X.velocity[0] * -1.0 + GenerateVelocityDeviation() : X.velocity[0];
                Hit_Boundary = true;
            }

            if (X.location[1] >= 1.0 - X.hitRadius) {
                X.velocity[1] = X.velocity[1] > 0.0 ? X.velocity[1] * -1.0 + GenerateVelocityDeviation() : X.velocity[1];
                Hit_Boundary = true;
            }
            else if (X.location[1] <= 0.0 + X.hitRadius) {
                X.velocity[1] = X.velocity[1] < 0.0 ? X.velocity[1] * -1.0 + GenerateVelocityDeviation() : X.velocity[1];
                Hit_Boundary = true;
            }
        }

        if (CausesRipple(X) && Hit_Boundary) {
            let P1 = Default_Spawn_Parameters.Ripple;
            P1.xy = structuredClone(X.location);
            Spawn("Ripple", P1);
        }

        if (Crashable(X)) {

            let Ocean = Ships.concat(Sea).concat(Dangers);

            if (X.grace != undefined) {
                if (X.grace >= Grace_Max) {
                    X.grace = 0;
                }
                else if (X.grace >= 1) {
                    X.grace += SecondsPerFrame;
                }
            }

            for (let Vessal of Ocean) {

                if (Vessal && Impactable(Vessal) && Vessal.id !== X.id) {

                    let dx = (X.location[0] * CanvasDimensions[0]) - (Vessal.location[0] * CanvasDimensions[0]);
                    let dy = (X.location[1] * CanvasDimensions[1]) - (Vessal.location[1] * CanvasDimensions[1]);
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    let dMod = (CanvasDimensions[0] + CanvasDimensions[1]) / 2.0

                    if (distance < (Vessal.hitRadius * dMod) + (X.hitRadius * dMod)) {

                        if (X.lives != undefined && X.grace != undefined) {

                            if (X.grace == 0) {
                                X.lives--;
                                X.grace = 1;
                            }

                            if (X.lives <= 0) {
                                X.delete = true;

                                if (X.type === "Ship") {
                                    let W = Default_Spawn_Parameters.Shipwreck;
                                    W.xy = structuredClone(X.location);
                                    W.c = structuredClone(X.color);
                                    W.d = structuredClone(X.direction);
                                    W.v = structuredClone(X.velocity);
                                    Spawn("Shipwreck", W);
                                }
                            }
                        }

                        if (ImpactReaction(Vessal) === "Bounce" && X.velocity != undefined && Vessal.velocity != undefined) {
                            X.velocity[0] += Vessal.velocity[0];
                            X.velocity[1] += Vessal.velocity[1];
                        }
                        else if (ImpactReaction(Vessal) === "Jumble" && X.velocity != undefined) {
                            X.velocity = [RandomNumber_Float(SpeedLimit * -1.0, SpeedLimit), RandomNumber_Float(SpeedLimit * -1.0, SpeedLimit)];
                        }

                        let P2 = Default_Spawn_Parameters.Ripple;
                        P2.xy = structuredClone(X.location);
                        Spawn("Ripple", P2);
                        break;
                    }
                }
            }
        }

        return X;
    }

    //Registers clicks on grapahics
    const clickedItem = (event) => {
        const x = event.global?.x || event.globalX || event.clientX;
        const y = event.global?.y || event.globalY || event.clientY;
        console.log('Clicked at:', x, y);
    }

    //Advances ships a frame
    //S = Ship
    function AdvanceShip(S) {

        let X = structuredClone(S);
        X = CheckForCollusions(X);
        X = HandleMovement(X);
        X = HandleDirection(X);

        return X;
    }

    //Advances sea a frame
    //S = Sea
    function AdvanceSea(S) {

        if (S.type === "Ripple") {

            let colorValues = S.color.match(/\d+(\.\d+)?/g).map(Number);
            let newOpacity = colorValues[3] - S.decay > 0.0 ? colorValues[3] - S.decay : 0.0;

            newOpacity = parseFloat(newOpacity.toFixed(2));
            colorValues = "rgb(" + colorValues[0] + "," + colorValues[1] + "," + colorValues[2] + "," + newOpacity + ")";
            S.color = colorValues;

            if (newOpacity <= 0.0) {
                S.delete = true;
            }

            let LargestRadius = 0.0;
            for (let k = 0; k < S.shapes.length; k++) {
                S.shapes[k].stroke = [5.0, colorValues];
                S.shapes[k].radius = S.shapes[k].radius * (1.0 + S.growth);
                if (S.shapes[k].radius * (1.0 + S.growth) > LargestRadius) {
                    LargestRadius = S.shapes[k].radius * (1.0 + S.growth);
                }
            }
        }

        return S;
    }

    //Advances dangers a frame
    //Danger
    function AdvanceDanger(D) {

        if (D.type === "Whirlpool") {
            D.duration -= SecondsPerFrame;
            D.direction += D.rotationSpeed;
            if (D.duration <= 0) {
                D.delete = true;
            }
        }
        else if (D.type === "Hurricane") {
            D = CheckForCollusions(D);
            D = HandleMovement(D);
            D.duration -= SecondsPerFrame;
            D.direction += D.rotationSpeed;
            if (D.duration <= 0) {
                D.delete = true;
            }
        }
        else if (D.type === "Shipwreck") {

            D.velocity[0] = D.velocity[0] * D.drift;
            D.velocity[1] = D.velocity[1] * D.drift;
            D = CheckForCollusions(D);
            D = HandleMovement(D);
            D = HandleDirection(D);

            let colorValues = D.color.match(/\d+(\.\d+)?/g).map(Number);
            let newOpacity = colorValues[3] - D.sink > 0.0 ? colorValues[3] - D.sink : 0.0;

            newOpacity = parseFloat(newOpacity.toFixed(2));
            colorValues = "rgb(" + colorValues[0] + "," + colorValues[1] + "," + colorValues[2] + "," + newOpacity + ")";
            D.color = colorValues;

            if (newOpacity <= 0.0) {
                D.delete = true;
            }

            for (let k = 0; k < D.shapes.length; k++) {
                D.shapes[k].fill = colorValues;
            }
        }

        return D;
    }

    //Renders visuals
    //A_Ships = Ships
    //A_Sea = Sea
    //A_Dangers = Dangers
    function RenderOcean(A_Ships, A_Sea, A_Dangers) {

        let Render_Content = A_Sea.concat(A_Dangers).concat(A_Ships);

        if (Render_Content && Render_Content.length > 0) {
            return (
                <pixiContainer resizeTo={CanvasRef} zIndex={10002} sortableChildren={true}>
                    {Render_Content.map((G, index) => (
                        <GenerateArt key={index} Dimensions={CanvasDimensions} Data={G} Device={Q.Device} Mode={Q.Mode} clickedItem={clickedItem} />
                    ))}
                </pixiContainer>
            );
        }
        else {
            return null;
        }
    }

    return (
        <div className={Saver_S.Cover}>
            <div className={Saver_S.Header}>
                <button onClick={() => Q.setInactiveScreen(null)}>X</button>
            </div>
            <div className={`${Saver_Device[Q.Device]} ${Saver_Mode[Q.Mode]}`} ref={CanvasRef}>
                <Application /* background={'rgb(0, 0, 0, 0.0)'} */ resizeTo={CanvasRef}>
                    {/* options={{backgroundAlpha: 0}} */}


                    {/* <pixiGraphics
                        draw={(g) => {
                            g.clear();
                            // g.setFillStyle("rgba(0, 0, 0, 0.25)");
                            g.rect(0, 0, CanvasDimensions[0], CanvasDimensions[1]);
                            g.fill();
                            g.interactive = true;
                            g.removeAllListeners();
                            // g.on('click', clickedItem);
                        }}
                        x={0.0}
                        y={0.0}
                        zIndex={10002}
                        eventMode="static"
                    /> */}

                    {/* {RenderStuff(Sea)} */}
                    {RenderOcean(Ships, Sea, Dangers)}
                    {/* {RenderStuff(Sea)} */}
                    {/* {RenderStuff(Dangers)} */}



                </Application>
            </div>
            <div className={Saver_S.Footer}></div>
        </div>
    );
}