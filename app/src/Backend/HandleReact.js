import { useRef, useEffect, useState } from "react";

//Gets current value from provided useRef
//r = useRef variable
function RC(r) {
    return r.current;
}

//Set a new value to useRef current
//r = useRef variable
//v = New value
function RS(r, v) {
    r.current = v;
}

export { RC, RS };