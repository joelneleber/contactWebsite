// Subtract a projected opaque silhouette from background pencil strokes.
// Foreground objects and the monitor's own contour remain untouched.
export function outsidePolygon(points, polygon){
 const inside=(x,y)=>{let hit=false;for(let i=0,j=polygon.length-2;i<polygon.length;j=i,i+=2){const ax=polygon[i],ay=polygon[i+1],bx=polygon[j],by=polygon[j+1];if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)hit=!hit;}return hit;};
 const pieces=[];
 for(let i=2;i<points.length;i+=2){
  const ax=points[i-2],ay=points[i-1],dx=points[i]-ax,dy=points[i+1]-ay,cuts=[0,1];
  for(let j=0,k=polygon.length-2;j<polygon.length;k=j,j+=2){
   const bx=polygon[k],by=polygon[k+1],ex=polygon[j]-bx,ey=polygon[j+1]-by,den=dx*ey-dy*ex;if(Math.abs(den)<1e-9)continue;
   const t=((bx-ax)*ey-(by-ay)*ex)/den,u=((bx-ax)*dy-(by-ay)*dx)/den;
   if(t>0&&t<1&&u>=0&&u<=1)cuts.push(t);
  }
  cuts.sort((a,b)=>a-b);
  for(let j=1;j<cuts.length;j++){const a=cuts[j-1],b=cuts[j],m=(a+b)/2;if(b-a<1e-8||inside(ax+dx*m,ay+dy*m))continue;const pts=[ax+dx*a,ay+dy*a,ax+dx*b,ay+dy*b];pieces.push({pts,len:Math.hypot(dx,dy)*(b-a)});}
 }
 return pieces;
}
