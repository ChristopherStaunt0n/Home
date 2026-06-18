'use client';
import Saver_S from "./Styles/Saver.module.css";
import { useState, useEffect, useRef } from 'react';
import { Application, extend, useTick } from '@pixi/react';
import { Container, Graphics, Rectangle, RoundedRectangle, Sprite } from 'pixi.js';
extend({ Graphics, Container });
import { TurnIntoArray, RandomColor, RandomNumber_Int, RandomNumber_Float } from "../../Backend/HandleGeneral.js";
import GenerateArt from "./BaseGraphic.jsx";
import {
    ShipLimit, SpeedMod, SpeedLimit, Velocity_Deviation,
    Ship, Cannon, Cannonball, Ripple, Wave, Shipwreck, Whirlpool, Hurricane, Kraken,
    BuildShip,
    CleanUpScrap, GenerateVelocityDeviation, HandleMovement, HandleDirection, HandleCollusion
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
    const Ship_Frequency = 1000//30000;
    const [Ship_Next, setShip_Next] = useState(0);

    const Danger_Chance = 0.25;
    const Danger_Frequency = 15000;
    const [Danger_Next, setDanger_Next] = useState(0);

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
                if (ShipLimit > Ships.length && RandomNumber_Int(0, 100) <= (100 * Ship_Chance)) {
                    exShips.push(BuildShip(null, null, null, null, 1.0, exShips, exSea, exDangers));
                }
            }
            else {
                setShip_Next(Ship_Next + SecondsPerFrame);
            }

            if (Danger_Next >= Danger_Frequency) {
                setDanger_Next(0);
                if (RandomNumber_Int(0, 100) <= (100 * Danger_Chance)) {
                    //
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

            setShips(CleanUpScrap(exShips));
            setSea(CleanUpScrap(exSea));
            setDangers(CleanUpScrap(exDangers));

            console.log("New Frame");
            console.log("Current Ships", exShips);
            console.log("Current Sea", exSea);
            console.log("Current Dangers", Dangers);

        }, SecondsPerFrame);
        return () => clearInterval(interval);
    }, [Ships, Sea, Dangers]);

    //Spawns an objects into screen saver
    //T = Type of spwan
    function Spawn(T) {
        switch (T) {
            case "Ship":
                let X_ships = structuredClone(Ships);
                X_ships.push(BuildShip(null, null, null, null, 1.0, Ships, Sea, Dangers));
                setShips(X_ships);
                break;
            case "Ripple":
                let X_ripples = structuredClone(Sea);
                X_ripples.push(null);
                setSea(X_ripples);
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

        Spawn("Ship");
    }

    //Checks if object collides with anything
    //O = Object JSON
    function CheckForCollusions(O) {

        let X = structuredClone(O);

        if (X.location[0] >= 1.0 - X.hitRadius) {
            X.velocity[0] = X.velocity[0] > 0.0 ? X.velocity[0] * -1.0 + GenerateVelocityDeviation() : X.velocity[0];
        }
        else if (X.location[0] <= 0.0 + X.hitRadius) {
            X.velocity[0] = X.velocity[0] < 0.0 ? X.velocity[0] * -1.0 + GenerateVelocityDeviation() : X.velocity[0];
        }

        if (X.location[1] >= 1.0 - X.hitRadius) {
            X.velocity[1] = X.velocity[1] > 0.0 ? X.velocity[1] * -1.0 + GenerateVelocityDeviation() : X.velocity[1];
        }
        else if (X.location[1] <= 0.0 + X.hitRadius) {
            X.velocity[1] = X.velocity[1] < 0.0 ? X.velocity[1] * -1.0 + GenerateVelocityDeviation() : X.velocity[1];
        }

        // Check collisions with other objects
        let Ocean = Ships.concat(Sea).concat(Dangers);

        for (let Vessal of Ocean) {

            if (Vessal && Vessal.id !== X.id) {//CanvasDimensions

                // Simple distance-based collision detection
                let dx = (X.location[0] * CanvasDimensions[0]) - (Vessal.location[0] * CanvasDimensions[0]);
                let dy = (X.location[1] * CanvasDimensions[1]) - (Vessal.location[1] * CanvasDimensions[1]);
                let distance = Math.sqrt(dx * dx + dy * dy);

                let dMod = (CanvasDimensions[0] + CanvasDimensions[1]) / 2.0

                // If objects are too close, mark for deletion
                if (distance < (Vessal.hitRadius * dMod) + (X.hitRadius * dMod)) {
                    X.delete = true;
                    return X;
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
        return S;
    }

    //Advances dangers a frame
    //Danger
    function AdvanceDanger(D) {
        return D;
    }

    //Renders visuals
    //A = Array of objects to render
    function RenderStuff(A) {
        console.log("Rendered Ships", A);
        if (A && A.length > 0) {
            return (
                <pixiContainer resizeTo={CanvasRef} zIndex={10002} sortableChildren={true}>
                    {A.map((G, index) => (
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
            <div className={Saver_S.Header}></div>
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

                    {RenderStuff(Ships)}
                    {/* {RenderStuff(Sea)} */}
                    {/* {RenderStuff(Dangers)} */}



                </Application>
            </div>
            <div className={Saver_S.Footer}></div>
        </div>
    );
}