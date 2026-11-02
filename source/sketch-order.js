// Start with the longest contour, then mix in detail so fast loads show objects,
// not just the room's largest outlines. Every retained stroke appears exactly once.
export function orderSketch(lines,width){
 const sorted=[...lines].sort((a,b)=>b.len-a.len);if(!sorted.length)return [];
 const result=[sorted.shift()],structure=[],detail=[];
 for(const line of sorted)(line.len>width*.025?structure:detail).push(line);
 let i=0,j=0;
 while(i<structure.length||j<detail.length){
  if(i<structure.length)result.push(structure[i++]);
  for(let n=0;n<10&&j<detail.length;n++)result.push(detail[j++]);
 }
 return result;
}
