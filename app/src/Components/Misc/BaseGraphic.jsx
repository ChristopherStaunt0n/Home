import { useRef, useEffect, useState } from "react";
import { Application, extend, useTick } from '@pixi/react';
import { Container, Graphics, Sprite } from 'pixi.js';
import { useCallback } from 'react';
extend({ Graphics, Container });
import * as PIXI from 'pixi.js';

export default function GenerateArt(Q) {

    let zI = Q.z + 1;

    return (
        //<pixiContainer sortableChildren={true} x={Q.Bounds[0] * Q.Position[0]} y={Q.Bounds[1] * Q.Position[1]}>
        <pixiContainer sortableChildren={true} zIndex={zI - 1}>
            {Q.Data.shapes.map((S, index) => (
                <pixiGraphics

                    key={index}
                    zIndex={zI}
                    // rotation={S.direction * (Math.PI / 180.0)}
                    x={(Q.Dimensions[0] / 2.0)}
                    y={(Q.Dimensions[1] / 2.0)}

                    draw={(A) => {
                        A.clear();
                        if (S.shape == "circle") {

                            let r = S.radius * Q.Dimensions[1];
                            let x = 0.0;
                            let y = 0.0;
                            A.circle(x, y, r);

                            if (S.stroke) {
                                A.stroke({ width: S.stroke[0], color: S.stroke[1] });
                            }
                            if (S.fill) {
                                A.setFillStyle(S.fill);
                                A.fill();
                            }
                        }
                        else if (S.shape == "ellipse") {

                            let xR = S.xRadius * Q.Dimensions[1];
                            let yR = S.yRadius * Q.Dimensions[1];
                            let x = 0.0;
                            let y = 0.0;
                            A.ellipse(x, y, xR, yR);

                            if (S.stroke) {
                                A.stroke({ width: S.stroke[0], color: S.stroke[1] });
                            }
                            if (S.fill) {
                                A.setFillStyle(S.fill);
                                A.fill();
                            }
                        }
                        else if (S.shape == "rectangle") {

                            let w = S.width * Q.Dimensions[1];
                            let h = S.height * Q.Dimensions[1];
                            let x = w / 2.0 * -1.0;
                            let y = h / 2.0 * -1.0;
                            A.rect(x, y, w, h);

                            if (S.stroke) {
                                A.stroke({ width: S.stroke[0], color: S.stroke[1] });
                            }
                            if (S.fill) {
                                A.setFillStyle(S.fill);
                                A.fill();
                            }
                        }
                        else if (S.shape == "roundRectangle") {

                            let w = S.width * Q.Dimensions[1];
                            let h = S.height * Q.Dimensions[1];
                            let x = w / 2.0 * -1.0;
                            let y = h / 2.0 * -1.0;
                            let r = S.radius;
                            A.roundRect(x, y, w, h, r);

                            if (S.stroke) {
                                A.stroke({ width: S.stroke[0], color: S.stroke[1] });
                            }
                            if (S.fill) {
                                A.setFillStyle(S.fill);
                                A.fill();
                            }
                        }
                        else if (S.shape == "line") {
                            for (let j = 0; j < S.points.length; j++) {
                                A.lineTo(S.points[j][0] * Q.Dimensions[1], S.points[j][1] * Q.Dimensions[1]);
                            }
                            if (S.stroke) {
                                A.stroke({ width: S.stroke[0], color: S.stroke[1] });
                            }
                            if (S.fill) {
                                A.setFillStyle(S.fill);
                                A.fill();
                            }
                        }
                        else if (S.shape == "arc") {
                            let x = S.x * Q.Dimensions[1];
                            let y = S.y * Q.Dimensions[1];
                            let r = S.r * Q.Dimensions[1];
                            let angleA = S.a1 * (Math.PI / 180.0);
                            let angleB = S.a2 * (Math.PI / 180.0);
                            if (S.stroke) {
                                A.arc(x, y, r, angleA, angleB, S.cc).stroke({ width: S.stroke[0], color: S.stroke[1] });
                            }
                            else {
                                A.arc(x, y, r, angleA, angleB, S.cc);
                            }
                            if (S.fill) {
                                A.setFillStyle(S.fill);
                                A.fill();
                            }
                        }
                        else if (S.shape == "arcTo") {
                            let xA = S.x1 * Q.Dimensions[1];
                            let yA = S.y1 * Q.Dimensions[1];
                            let xB = S.x2 * Q.Dimensions[1];
                            let yB = S.y2 * Q.Dimensions[1];
                            let r = S.r * Q.Dimensions[1];
                            if (S.stroke) {
                                A.arcTo(xA, yA, xB, yB, r).stroke({ width: S.stroke[0], color: S.stroke[1] });
                            }
                            else {
                                A.arcTo(xA, yA, xB, yB, r);
                            }
                            if (S.fill) {
                                A.setFillStyle(S.fill);
                                A.fill();
                            }
                        }
                        else if (S.shape == "polygon") {
                            let p = S.points.map(point => ({
                                x: point.x * Q.Dimensions[1],
                                y: point.y * Q.Dimensions[1]
                            }));
                            if (S.stroke) {
                                A.poly(p, S.closed).stroke({ width: S.stroke[0], color: S.stroke[1] });
                            }
                            else {
                                A.poly(p, S.closed);
                            }
                            if (S.fill) {
                                A.setFillStyle(S.fill);
                                A.fill();
                            }
                        }
                        zI++;
                        A.removeAllListeners();
                    }}
                />
            ))}
        </pixiContainer>
    );
}