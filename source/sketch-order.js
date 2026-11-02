// Draw every retained contour in descending projected length: large, medium, small.
// Stable sorting preserves the original order of equally sized strokes.
export function orderSketch(lines){
 return [...lines].sort((a,b)=>b.len-a.len);
}
