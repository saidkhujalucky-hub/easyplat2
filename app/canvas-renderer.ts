import * as THREE from "three";

// A lightweight painter for browsers without WebGL. It projects the same mesh
// geometry, so category changes, drag rotation and custom dimensions still work.
export function createCanvasRenderer() {
  const domElement=document.createElement("canvas");
  const context=domElement.getContext("2d",{alpha:true});
  if(!context)throw new Error("Canvas is unavailable");
  const ctx=context;
  const ratio=Math.min(devicePixelRatio||1,1.25);
  let width=1,height=1;
  type Triangle={points:number[];depth:number;colour:string;alpha:number;uv?:number[];image?:CanvasImageSource};
  const light=new THREE.Vector3(-.45,.7,1).normalize(),halfLight=new THREE.Vector3(-.25,.3,1).normalize(),highlight=new THREE.Color("#e5f1ff");
  const cache=new WeakMap<THREE.BufferGeometry,{indices:number[];normals:THREE.Vector3[]}>();
  const projection=new THREE.Matrix4(),normalMatrix=new THREE.Matrix3(),vertex=new THREE.Vector3();
  const colour=new THREE.Color();
  return {
    domElement,
    setSize(w:number,h:number){width=w;height=h;domElement.width=Math.round(w*ratio);domElement.height=Math.round(h*ratio);domElement.style.width=`${w}px`;domElement.style.height=`${h}px`;},
    render(scene:THREE.Scene,camera:THREE.Camera){
      ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
      scene.updateMatrixWorld();camera.updateMatrixWorld();
      const triangles:Triangle[]=[];
      scene.traverse(object=>{
        if(!(object instanceof THREE.Mesh)||!object.visible)return;
        const geometry=object.geometry as THREE.BufferGeometry,positions=geometry.attributes.position;
        if(!positions)return;
        let data=cache.get(geometry);
        if(!data){
          const indices=geometry.index?Array.from(geometry.index.array):Array.from({length:positions.count},(_,i)=>i);
          const normals:THREE.Vector3[]=[];
          const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),attribute=geometry.attributes.normal;
          for(let i=0;i<indices.length;i+=3){
            if(attribute){a.fromBufferAttribute(attribute,indices[i]);b.fromBufferAttribute(attribute,indices[i+1]);c.fromBufferAttribute(attribute,indices[i+2]);normals.push(a.add(b).add(c).normalize());}
            else{a.fromBufferAttribute(positions,indices[i]);b.fromBufferAttribute(positions,indices[i+1]);c.fromBufferAttribute(positions,indices[i+2]);normals.push(b.sub(a).cross(c.sub(a)).normalize());}
          }
          data={indices,normals};cache.set(geometry,data);
        }
        const view=new THREE.Matrix4().multiplyMatrices(camera.matrixWorldInverse,object.matrixWorld);
        projection.multiplyMatrices(camera.projectionMatrix,view);normalMatrix.getNormalMatrix(view);
        const projected=new Float32Array(positions.count*3);
        for(let i=0;i<positions.count;i++){vertex.fromBufferAttribute(positions,i).applyMatrix4(projection);projected[i*3]=(vertex.x*.5+.5)*width;projected[i*3+1]=(-vertex.y*.5+.5)*height;projected[i*3+2]=vertex.z;}
        const material=(Array.isArray(object.material)?object.material[0]:object.material) as THREE.MeshStandardMaterial;
        if(!material.visible)return;
        const uv=geometry.attributes.uv;
        for(let i=0;i<data.indices.length;i+=3){
          const ids=[data.indices[i],data.indices[i+1],data.indices[i+2]],n=data.normals[i/3].clone().applyMatrix3(normalMatrix).normalize();
          if(n.z<0&&material.side!==THREE.DoubleSide)continue;
          const points=ids.flatMap(index=>[projected[index*3],projected[index*3+1]]);
          const depth=ids.reduce((sum,index)=>sum+projected[index*3+2],0)/3;
          if(depth>1||depth< -1)continue;
          const shade=.52+Math.max(0,n.dot(light))*.75;
          colour.copy(material.color||new THREE.Color("#ffffff")).multiplyScalar(shade);
          const gloss=Math.pow(Math.max(0,n.dot(halfLight)),28)*.23;
          colour.lerp(highlight,gloss);
          const triangle:Triangle={points,depth,colour:colour.getStyle(),alpha:material.transparent?material.opacity:1};
          if(material.map&&uv){
            triangle.image=material.map.image as CanvasImageSource;
            triangle.uv=ids.flatMap(index=>[uv.getX(index),1-uv.getY(index)]);
          }
          triangles.push(triangle);
        }
      });
      // Soft contact shadow under the object, independent of the mesh painter.
      const gradient=ctx.createRadialGradient(width*.5,height*.84,0,width*.5,height*.84,width*.25);
      gradient.addColorStop(0,"#02071370");gradient.addColorStop(1,"#02071300");ctx.fillStyle=gradient;ctx.fillRect(0,height*.6,width,height*.4);
      triangles.sort((a,b)=>b.depth-a.depth);
      for(const triangle of triangles){
        const p=triangle.points;
        ctx.globalAlpha=triangle.alpha;
        ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(p[2],p[3]);ctx.lineTo(p[4],p[5]);ctx.closePath();
        ctx.fillStyle=triangle.colour;ctx.fill();
        if(triangle.alpha===1){ctx.strokeStyle=triangle.colour;ctx.lineWidth=.35;ctx.stroke();}
        if(triangle.image&&triangle.uv){
          const image=triangle.image as HTMLCanvasElement,u=triangle.uv;
          const u0=u[0]*image.width,v0=u[1]*image.height,u1=u[2]*image.width,v1=u[3]*image.height,u2=u[4]*image.width,v2=u[5]*image.height;
          const det=(u1-u0)*(v2-v0)-(u2-u0)*(v1-v0);if(Math.abs(det)<.0001)continue;
          const a=((p[2]-p[0])*(v2-v0)-(p[4]-p[0])*(v1-v0))/det;
          const b=((p[3]-p[1])*(v2-v0)-(p[5]-p[1])*(v1-v0))/det;
          const c=((p[4]-p[0])*(u1-u0)-(p[2]-p[0])*(u2-u0))/det;
          const d=((p[5]-p[1])*(u1-u0)-(p[3]-p[1])*(u2-u0))/det;
          ctx.save();ctx.clip();ctx.transform(a,b,c,d,p[0]-a*u0-c*v0,p[1]-b*u0-d*v0);ctx.drawImage(image,0,0);ctx.restore();
        }
      }
      ctx.globalAlpha=1;
    },
    dispose(){domElement.width=1;domElement.height=1;},
  };
}
