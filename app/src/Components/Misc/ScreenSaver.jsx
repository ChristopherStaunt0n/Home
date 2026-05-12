'use client';
import Saver_S from "./Styles/Saver.module.css";
import { useState, useEffect, useRef } from 'react';
import { Application, extend, useTick } from '@pixi/react';
import { Container, Graphics, Rectangle, RoundedRectangle, Sprite } from 'pixi.js';
extend({ Graphics, Container });
import { RandomColor, RandomNumber_Int } from "../../Backend/HandleGeneral.js";
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

    const Ship = {
        id: null,
        type: "Ship",
        lives: 3,
        color: null,
        shapes: [
            {
                type: circle
            }
        ],
        location: [0.0, 0.0],
        velocity: [0.0, 0.0],
        direction: null
    };
    const Cannon = {
        type: "Cannon",
        color: null,
        shapes: [],
        direction: null
    };
    const Cannonball = {
        type: "Cannonball",
        color: null,
        shapes: [],
        location: [0.0, 0.0],
        velocity: [0.0, 0.0],
        bounces: 1
    };

    const Ripple = {
        type: "Ripple",
        color: null,
        shapes: [],
        weight: null,
        location: [0.0, 0.0],
        z: 10003
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

    //Setups initial screen data
    function Setup() {
        let firstSail = [Ship];
        firstSail[0].id = 0;
        firstSail[0].color = RandomColor();
        firstSail[0].location = [0.5, 0.5];
        firstSail[0].direction = [90];
        firstSail[0].velocity = [1.0, 0.0];
        setShips(firstSail);
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
    function AdvanceShips() {
        //
    }

    //Advances sea a frame
    function AdvanceSea() {
        //
    }

    //Advances dangers a frame
    function AdvanceDangers() {
        //
    }

    //Update positions and handle collisions
    useEffect(() => {
        const interval = setInterval(() => {
            AdvanceShips();
            AdvanceSea();
            AdvanceDangers();
            console.log("New Frame");
        }, SecondsPerFrame);
        return () => clearInterval(interval);
    }, []);

    //Renders ships
    //A = Ships
    function RenderShips(A) {
        return (
            <pixiContainer resizeTo={CanvasRef}>
                {Ships.map((G, index) => (
                    <GenerateArt key={index} Data={G} Device={Q.Device} Mode={Q.Mode} clickedItem={clickedItem} />
                ))}
            </pixiContainer>
        );
    }

    //Renders sea
    //A = Sea
    function RenderSea(A) {
        //
        return null;
    }

    //Renders dangers
    //A = Dangers
    function RenderDangers(A) {
        //
        return null;
    }

    return (
        <div className={Saver_S.Cover}>
            <div className={Saver_S.Header}></div>
            <div className={`${Saver_Device[Q.Device]} ${Saver_Mode[Q.Mode]}`} ref={CanvasRef}>
                <Application /* background={'rgb(0, 0, 0, 0.0)'} */ resizeTo={CanvasRef}>



                    <pixiGraphics
                        draw={(g) => {
                            g.clear();
                            g.setFillStyle("rgba(0, 0, 0, 0.25)");
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
                    />

                    {RenderShips(Ships)}
                    {/* {RenderSea(Sea)} */}
                    {/* {RenderDangers(Dangers)} */}



                </Application>
            </div>
            <div className={Saver_S.Footer}></div>
        </div>
    );
}