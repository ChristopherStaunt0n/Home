'use client';
import Saver_S from "./Styles/Saver.module.css";
import { useState, useEffect, useRef } from 'react';
import { Application, extend, useTick } from '@pixi/react';
import { Container, Graphics, Rectangle, RoundedRectangle, Sprite } from 'pixi.js';
extend({ Graphics, Container });
import { TurnIntoArray, RandomColor, RandomNumber_Int, RandomNumber_Float } from "../../Backend/HandleGeneral.js";
import GenerateArt from "./BaseGraphic.jsx";

// Screen saver involving ships
export default function Saver(Q) {

    const Saver_Device = [Saver_S.Computer, Saver_S.Mobile];
    const Saver_Mode = [Saver_S.Public, Saver_S.Private];

    const CanvasRef = useRef(null);
    const [CanvasDimensions, setCanvasDimensions] = useState([0.0, 0.0]);
    const SecondsPerFrame = 2000//1,000ms = 1s

    const ShipLimit = 3;
    const SpeedMod = 0.25;
    const SpeedLimit = 0.9;

    const Ship = {
        delete: false,
        id: null,
        type: "Ship",
        lives: 3,
        color: null,
        shapes: [
            // {
            //     shape: "circle",
            //     radius: 0.25,
            //     fill: null,
            //     stroke: [0.75, "white"]
            // },
            // {
            //     shape: "rectangle",
            //     width: 0.5,
            //     height: 0.25,
            //     fill: null,
            //     stroke: [0.75, "white"]
            // },
            // {
            //     shape: "ellipse",
            //     xRadius: 0.25,
            //     yRadius: 0.125,
            //     fill: null,
            //     stroke: [0.75, "white"]
            // },
            // {
            //     shape: "roundRectangle",
            //     width: 0.5,
            //     height: 0.25,
            //     radius: 15.0,
            //     fill: null,
            //     stroke: [0.75, "white"]
            // },
            // {
            //     shape: "line",
            //     points: [[0.1, 0.1], [0.1, 0.5], [0.5, 0.1]],
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
            //     fill: null,
            //     stroke: [2.0, "white"]
            // }
        ],
        location: [0.0, 0.0],
        velocity: [0.0, 0.0],
        direction: null,
        z: 10010
    };
    const Cannon = {
        delete: false,
        type: "Cannon",
        color: null,
        shapes: [],
        direction: null,
        z: 10015
    };
    const Cannonball = {
        delete: false,
        type: "Cannonball",
        color: null,
        shapes: [],
        location: [0.0, 0.0],
        velocity: [0.0, 0.0],
        bounces: 1,
        z: 10020
    };

    const Ripple = {
        delete: false,
        type: "Ripple",
        color: null,
        shapes: [],
        weight: null,
        location: [0.0, 0.0],
        z: 10005
    };
    const Wave = {};

    const Shipwreck = {};
    const Whirlpool = {};
    const Hurricane = {};
    const Kraken = {};

    const [Ships, setShips] = useState([]);
    const [Sea, setSea] = useState([]);
    const [Dangers, setDangers] = useState([]);

    //Loads initial dimensions of screen saver
    useEffect(() => {
        if (CanvasRef.current) {
            setCanvasDimensions([CanvasRef.current.offsetWidth, CanvasRef.current.offsetHeight]);
            Setup();
        }
    }, []);

    //Spawns new ship based on privded info (if present)
    //xy = Coordinates
    //c = Color
    //d = Direction
    //v = Velocity
    function BuildShip(xy, c, d, v) {
        let newShip = Ship;
        let shipId = 0;
        let shipId_Found = false;
        while (!shipId_Found) {
            if (TurnIntoArray(Ships.filter(S => S.id == shipId)).length == 0) {
                break;
            }
            else {
                shipId++;
            }
        }
        newShip.id = shipId;
        newShip.location = xy ? xy : [RandomNumber_Float(0.0, 1.0), RandomNumber_Float(0.0, 1.0)];
        newShip.color = c ? c : RandomColor();
        for (let k = 0; k < newShip.shapes.length; k++) {
            newShip.shapes[k].fill = newShip.color;
        }
        newShip.direction = d ? d : RandomNumber_Float(0.0, 360.0);
        newShip.velocity = v ? v : [RandomNumber_Float(0.0, SpeedLimit), RandomNumber_Float(0.0, SpeedLimit)];
        return newShip;
    }

    //Setups initial screen data
    function Setup() {
        setShips([BuildShip([0.5, 0.5], null, 90.0, [0.1, 0.1])]);
        setSea([]);
        setDangers([]);
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
        return S;
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

    //Update positions and handle collisions
    useEffect(() => {
        const interval = setInterval(() => {

            let exShips = Ships;
            for (let i = 0; i < exShips.length; i++) {
                exShips[i] = AdvanceShip(exShips[i]);
            }
            setShips(CleanUpScrap(exShips));

            let exSea = Sea;
            for (let i = 0; i < exSea.length; i++) {
                exSea[i] = AdvanceSea(exSea[i]);
            }
            setSea(CleanUpScrap(exSea));

            let exDangers = Dangers;
            for (let i = 0; i < exDangers.length; i++) {
                exDangers[i] = AdvanceDanger(exDangers[i]);
            }
            setDangers(CleanUpScrap(exDangers));

            console.log("New Frame");
            console.log("Current Ships", Ships);
            console.log("Current Sea", Sea);
            console.log("Current Dangers", Dangers);

        }, SecondsPerFrame);
        return () => clearInterval(interval);
    }, [Ships, Sea, Dangers]);//Ships?=============================================================<

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