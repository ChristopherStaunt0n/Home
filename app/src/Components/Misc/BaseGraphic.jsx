import { useRef, useEffect, useState } from "react";
import { Application, extend, useTick } from '@pixi/react';
import { Container, Graphics, Sprite } from 'pixi.js';
import { useCallback } from 'react';
extend({ Graphics, Container });
import * as PIXI from 'pixi.js';

export default function GenerateArt(Q) {

    let zI = Q.z + 1;

    return (
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
                        zI++;
                        A.removeAllListeners();
                    }}
                />
            ))}
        </pixiContainer>
    );

    //     return (
    //         <pixiContainer sortableChildren={true} x={Q.Bounds[0] * Q.Position[0]} y={Q.Bounds[1] * Q.Position[1]}>

    //                         else if (asset.shape == "line") {
    //                             //A.lineTo(xA, yA);A.lineTo(xB, yB);
    //                         }
    //                         else if (asset.shape == "arc") {
    //                             A.setFillStyle(asset.color);

    //                             // let x = Q.Bounds[0] * asset.dim[0] * Q.Scale;
    //                             // let y = Q.Bounds[0] * asset.dim[1] * Q.Scale;
    //                             // let r = Q.Bounds[0] * asset.dim[2] * Q.Scale;
    //                             // let angleA = asset.dim[3] * (Math.PI / 180.0);
    //                             // let angleB = asset.dim[4] * (Math.PI / 180.0);
    //                             // A.arc(x, y, r, angleA, angleB, /* counterClockwise? */false);
    //                             // A.stroke({ width: 2, color: 0xff0000 });

    //                             //red (quarter circle)
    //                             A
    //                                 .arc(0, 0, 50, 0, Math.PI / 2)
    //                                 .stroke({ width: 2, color: 0xff0000 });
    //                             A.fill();

    //                             //yellow (full circle)
    //                             A
    //                                 .arc(100, 100, 30, 0, Math.PI * 2)
    //                                 .stroke({ color: 0x00ff00 });
    //                             A.fill();

    //                             //blue (counterclockwise arc)
    //                             A
    //                                 .arc(50, 50, 40, Math.PI, 0, true)
    //                                 .stroke({ width: 2, color: 0x0000ff });
    //                             A.fill();
    //                         }
    //                         else if (asset.shape == "arcTo") {
    //                             // let Da = [0.3, 0.18, 0.3, 0.3, 0.04];
    //                             // let Db = [0.3, 0.3, 0.18, 0.3, 0.04];
    //                             // let Dc = [0.18, 0.3, 0.18, 0.18, 0.04];
    //                             // let Dd = [0.18, 0.18, 0.3, 0.18, 0.04];
    //                             // let D = [[0.18, 0.18], [Da, Db, Dc, Dd]];

    //                             let Da = [0.0, -0.135, 0.2, -0.135, 0.04];
    //                             let Db = [0.2, 0.2, 0.08, 0.2, 0.04];
    //                             let Dc = [0.08, 0.2, 0.08, 0.08, 0.04];
    //                             let Dd = [0.08, 0.08, 0.2, 0.08, 0.04];
    //                             let D = [[0.08, 0.08], [Da, Db, Dc, Dd]];

    //                             // let assset = { shape: "arcTo", color: "rgba(100, 100, 100)", dim: D, direction: 0.0, z: 5 };
    //                             // A.setFillStyle(assset.color);
    //                             // A.moveTo(
    //                             //     Q.Bounds[0] * assset.dim[0][0] * Q.Scale,
    //                             //     Q.Bounds[0] * assset.dim[0][1] * Q.Scale
    //                             // );
    //                             // for (let i = 0; i < assset.dim[1].length; i++) {
    //                             //     A.arcTo(
    //                             //         Q.Bounds[0] * assset.dim[1][i][0] * Q.Scale,
    //                             //         Q.Bounds[0] * assset.dim[1][i][1] * Q.Scale,
    //                             //         Q.Bounds[0] * assset.dim[1][i][2] * Q.Scale,
    //                             //         Q.Bounds[0] * assset.dim[1][i][3] * Q.Scale,
    //                             //         Q.Bounds[0] * assset.dim[1][i][4] * Q.Scale
    //                             //     );
    //                             // }
    //                             A.arcTo(
    //                                 Da[0] * Q.Bounds[0] * Q.Scale,
    //                                 Da[1] * Q.Bounds[0] * Q.Scale,
    //                                 Da[2] * Q.Bounds[0] * Q.Scale,
    //                                 Da[3] * Q.Bounds[0] * Q.Scale,
    //                                 Da[4] * Q.Bounds[0] * Q.Scale
    //                             );
    //                             A.stroke({ width: 5, color: 0xff0000 });
    //                             A.fill();
    //                             // A.arcTo(x1, y1, x2, y2, r);
    //                             // A.stroke({ width: 5, color: 0xff0000 });
    //                             // A.fill();

    //                             // Start at (50, 200)
    //                             A.moveTo(50, 200);

    //                             // Draw a line to (150, 200), which is the first tangent point.
    //                             A.lineTo(150, 200);

    //                             // Create an arc from the first tangent (150, 200) to the second (150, 300)
    //                             // with a radius of 50.
    //                             A.arcTo(150, 300, 250, 300, 50);

    //                             // Continue the line from the end of the arc to (250, 300)
    //                             A.lineTo(250, 300);

    //                             // A
    //                             //     .moveTo(150, 150)
    //                             //     .arcTo(250, 150, 250, 250, 30) // Top right corner
    //                             //     .arcTo(250, 250, 150, 250, 30) // Bottom right corner
    //                             //     .arcTo(150, 250, 150, 150, 30) // Bottom left corner
    //                             //     .arcTo(150, 150, 250, 150, 30) // Top left corner
    //                             //     .fill({ color: 0x00ff00 });
    //                             // let qQ = [150, 150];
    //                             // let qA = [250, 150, 250, 250, 30];
    //                             // let qB = [250, 250, 150, 250, 30];
    //                             // let qC = [150, 250, 150, 150, 30];
    //                             // let qD = [150, 150, 250, 150, 30];
    //                             // qQ[0] = qQ[0] / Q.Scale / Q.Bounds[0];
    //                             // qQ[1] = qQ[1] / Q.Scale / Q.Bounds[0]
    //                             // for (let i = 0; i < qA.length; i++) {
    //                             //     qA[i] = qA[i] / Q.Scale / Q.Bounds[0];
    //                             //     qB[i] = qB[i] / Q.Scale / Q.Bounds[0];
    //                             //     qC[i] = qC[i] / Q.Scale / Q.Bounds[0];
    //                             //     qD[i] = qD[i] / Q.Scale / Q.Bounds[0];
    //                             // }
    //                             // console.log(qQ, qA, qB, qC, qD);
    //                         }
    //                         else if (asset.shape == "polygon") {//Not Working
    //                             //A.stroke({ width: 2, color: "rgba(255, 255, 255)" });
    //                             // let points = asset.dim.reduce((polyPoints, point) => {
    //                             //     polyPoints.push(
    //                             //         [point[0] * Q.Bounds[0] * Q.Scale, point[1] * Q.Bounds[0] * Q.Scale]
    //                             //     );
    //                             //     return polyPoints;
    //                             // }, []);
    //                             // A.setFillStyle(asset.color);
    //                             // A.poly(asset.dim/* points */);
    //                             // A.stroke({ width: 2, color: 0xff0000 });
    //                             // A.fill();

    //                             //triangle
    //                             A
    //                                 .poly([0, 0, 50, 50, -50, 50], true)
    //                                 .fill({ color: 0xff0000 });

    //                             // Draw a polygon using point objects
    //                             A
    //                                 .poly([
    //                                     { x: 200, y: 50 },
    //                                     { x: 250, y: 100 },
    //                                     { x: 200, y: 150 },
    //                                     { x: 150, y: 100 }
    //                                 ])
    //                                 .fill({ color: 0x00ff00 });

    //                             // Draw an open polygon with stroke
    //                             A
    //                                 .poly([100, 50, 150, 50, 150, 100, 100, 100], false)
    //                                 .stroke({
    //                                     width: 2,
    //                                     color: 0x0000ff,
    //                                     join: 'round'
    //                                 });
    //                         }
}