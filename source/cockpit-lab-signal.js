// A bipolar demonstration signal shared by the scope and numeric instruments.
// Slow phase makes the -5 V to +5 V sweep readable without another animation loop.
export function labSignal(t){
 const phase=t/1000*2*Math.PI*.25,wave=Math.sin,voltage=5*wave(phase);
 return {mode:0,phase,wave,voltage,current:Math.abs(voltage)/100,meter:voltage,brightness:.96+.02*Math.sin(phase)};
}
