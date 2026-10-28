import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import {createCanvasRenderer} from "./canvas-renderer";
import type { ProductKey } from "./catalog";

export type ModelOptions = { kind: ProductKey; color: string; width?: number; length?: number };

function release(root: THREE.Object3D) {
  const materials = new Set<THREE.Material>();
  root.traverse(object => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose();
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
    }
  });
  materials.forEach(material => {
    const mapped = material as THREE.MeshStandardMaterial;
    mapped.map?.dispose();
    material.dispose();
  });
}

function packagingModel({ kind, color, width = 60, length = 80 }: ModelOptions, lowDetail=false) {
  const radial=lowDetail?24:64;
  const group = new THREE.Group();
  const clear = color.toUpperCase() === "#ADCED5";
  const plastic = new THREE.MeshPhysicalMaterial({
    color, roughness: .29, metalness: .025, clearcoat: .85, clearcoatRoughness: .2,
    transparent: clear, opacity: clear ? .28 : 1, side: THREE.DoubleSide, depthWrite: !clear,
  });
  const seamMaterial = plastic.clone();
  seamMaterial.color.lerp(new THREE.Color("#d5e5ff"), .2);
  const mesh = (geometry: THREE.BufferGeometry, material: THREE.Material, x = 0, y = 0, z = 0) => {
    const result = new THREE.Mesh(geometry, material);
    result.position.set(x, y, z);
    result.castShadow = true;
    result.receiveShadow = true;
    group.add(result);
    return result;
  };
  const line = (points: number[][], radius = .009, material: THREE.Material = seamMaterial) =>
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p as [number, number, number]))), 24, radius, 5, false), material);

  if (kind === "water") {
    const bottle = new THREE.MeshPhysicalMaterial({ color: "#83b8e6", roughness: .18, metalness: .02, clearcoat: 1, transparent: !lowDetail, opacity: lowDetail ? 1 : .86 });
    const profile = [[.05,-1.12],[.5,-1.12],[.62,-1.06],[.66,-.92],[.66,.42],[.62,.63],[.46,.8],[.25,.94],[.22,1.13]];
    mesh(new THREE.LatheGeometry(profile.map(([x,y]) => new THREE.Vector2(x,y)), radial), bottle);
    const rib = bottle.clone(); rib.color.set("#b0d9f6");
    [-.97,-.81,-.63,.32,.49].forEach(y => {
      const ring = mesh(new THREE.TorusGeometry(.66,.027,8,radial),rib,0,y); ring.rotation.x = Math.PI / 2;
    });
    const wrap = plastic.clone(); wrap.transparent = true; wrap.opacity = clear ? .15 : .37; wrap.depthWrite = false;
    mesh(new THREE.CylinderGeometry(.705,.71,1.43,radial,1,true),wrap,0,-.27);
    mesh(new THREE.CylinderGeometry(.245,.245,.21,radial),new THREE.MeshStandardMaterial({color:"#204bb6",roughness:.35}),0,1.19);
    for(let i=0;i<28;i++) {
      const a=i/28*Math.PI*2;
      mesh(new THREE.CylinderGeometry(.009,.009,.16,4),seamMaterial,Math.sin(a)*.246,1.19,Math.cos(a)*.246);
    }
    const canvas = document.createElement("canvas"); canvas.width=256;canvas.height=128;
    const context=canvas.getContext("2d");
    if(context) {
      context.fillStyle="#edf6ff";context.fillRect(0,0,256,128);
      context.fillStyle="#234ea5";context.font="bold 58px Arial";context.textAlign="center";context.fillText("19 L",128,85);
      const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
      mesh(new THREE.CylinderGeometry(.719,.719,.43,32,1,true,-.65,1.3),new THREE.MeshStandardMaterial({map,roughness:.45,side:THREE.DoubleSide}),0,-.22);
    }
  } else if (kind === "carpets") {
    mesh(new THREE.CylinderGeometry(.56,.56,2.05,radial,1,true),plastic);
    const cardboard = new THREE.MeshStandardMaterial({color:"#a8906b",roughness:.9,side:THREE.DoubleSide});
    mesh(new THREE.CylinderGeometry(.15,.15,2.07,32,1,true),cardboard);
    for(const y of [-1.025,1.025]) {
      const ring=mesh(new THREE.RingGeometry(.15,.56,radial),plastic,0,y);ring.rotation.x=-Math.PI/2;
      for(let i=0;i<14;i++) {
        const edge=mesh(new THREE.TorusGeometry(.17+i*.028,.0035,4,radial),seamMaterial,0,y+.004);
        edge.rotation.x=Math.PI/2;
      }
    }
    const film=new THREE.PlaneGeometry(.9,1.6,lowDetail?8:22,lowDetail?12:28);
    const vertices=film.attributes.position;
    for(let i=0;i<vertices.count;i++) {
      const x=vertices.getX(i),y=vertices.getY(i);
      vertices.setZ(i,.1*Math.sin(y*4+x*3)+.04*Math.sin(y*13));
    }
    film.computeVertexNormals();
    const loose=plastic.clone();loose.transparent=true;loose.opacity=clear?.2:.7;loose.depthWrite=false;
    const sheet=mesh(film,loose,.64,-.18,.39);sheet.rotation.y=-.48;sheet.rotation.z=.1;
    group.rotation.z=-.22;
  } else if (kind === "tshirt") {
    const shape=new THREE.Shape();
    shape.moveTo(-.7,-1.1);shape.quadraticCurveTo(-.82,-1.08,-.82,-.92);
    shape.lineTo(-.9,1.12);shape.lineTo(-.51,1.12);shape.lineTo(-.51,.65);
    shape.bezierCurveTo(-.5,.23,.5,.23,.51,.65);shape.lineTo(.51,1.12);shape.lineTo(.9,1.12);
    shape.lineTo(.82,-.92);shape.quadraticCurveTo(.82,-1.1,.7,-1.1);shape.closePath();
    const geometry=new THREE.ExtrudeGeometry(shape,{depth:.18,bevelEnabled:true,bevelSize:.035,bevelThickness:.035,bevelSegments:3,curveSegments:24});
    geometry.translate(0,0,-.09);mesh(geometry,plastic);
    [-.73,.73].forEach(x => line([[x,1.04,.14],[x,.5,.18],[x*.88,-.87,.15]],.013));
    line([[-.71,-1.02,.15],[0,-1.04,.15],[.71,-1.02,.15]],.012);
    [-.48,.5].forEach(x=>line([[x,.23,.15],[x*.9,-.1,.22],[x*.98,-.73,.15]],.006));
  } else if (kind === "trash") {
    const profile=[[.03,-1.08],[.54,-1.08],[.82,-.94],[.88,-.65],[.79,.12],[.59,.72],[.2,.96],[.12,1.04]];
    const geometry=new THREE.LatheGeometry(profile.map(([x,y])=>new THREE.Vector2(x,y)),radial);
    const positions=geometry.attributes.position;
    for(let i=0;i<positions.count;i++) {
      const x=positions.getX(i),z=positions.getZ(i),y=positions.getY(i),a=Math.atan2(z,x);
      const ripple=1+.035*Math.sin(a*13+y*4)+.015*Math.sin(a*23-y*6);
      positions.setXYZ(i,x*ripple,y,z*ripple);
    }
    geometry.computeVertexNormals();mesh(geometry,plastic);
    const knot=mesh(new THREE.TorusGeometry(.13,.045,10,24),seamMaterial,0,1.02);knot.rotation.x=Math.PI/2;
    for(const direction of [-1,1]) {
      const tail=mesh(new THREE.BoxGeometry(.23,.38,.07,3,4,1),plastic,direction*.15,1.17);tail.rotation.z=direction*-.5;
    }
  } else {
    // A softly inflated film bag: a segmented solid with small creases and sealed edges.
    const ratio=Math.max(.65,Math.min(1.4,width/Math.max(1,length)));
    const w=1.78*Math.sqrt(ratio),h=2.26/Math.sqrt(ratio),depth=.28;
    const geometry=new THREE.BoxGeometry(w,h,depth,lowDetail?12:32,lowDetail?16:40,2);
    const positions=geometry.attributes.position;
    for(let i=0;i<positions.count;i++) {
      const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i);
      const edge=Math.max(0,1-Math.pow(Math.abs(x)/(w/2),5))*Math.max(0,1-Math.pow(Math.abs(y)/(h/2),7));
      const fold=.024*Math.sin(x*16+y*8)+.018*Math.sin(y*20-x*5);
      positions.setZ(i,Math.sign(z)*(.025+(depth/2+fold)*edge));
    }
    geometry.computeVertexNormals();mesh(geometry,plastic);
    for(const y of [-h/2+.045,h/2-.07,h/2-.105]) line([[-w/2+.025,y,.04],[0,y+.004,.055],[w/2-.025,y,.04]],.008);
    for(const x of [-w/2+.07,w/2-.07]) line([[x,h*.34,.065],[x*.94,0,.12],[x,-h*.4,.065]],.008);
    if(kind==="cookies") {
      const biscuit=new THREE.MeshStandardMaterial({color:"#bd8440",roughness:.85});
      const spot=new THREE.MeshStandardMaterial({color:"#805326",roughness:1});
      for(let i=0;i<3;i++) {
        const cookie=mesh(new THREE.CylinderGeometry(.27,.27,.075,24),biscuit,(i-1)*.42,-.05+(i%2)*.11,.21);
        cookie.rotation.x=Math.PI/2;
        for(let j=0;j<6;j++) {
          const a=j*Math.PI/3;
          mesh(new THREE.SphereGeometry(.015,6,6),spot,(i-1)*.42+Math.sin(a)*.16,-.05+(i%2)*.11+Math.cos(a)*.16,.253);
        }
      }
      const windowMaterial=new THREE.MeshPhysicalMaterial({color:"#e4eaf2",transparent:true,opacity:.16,roughness:.12,clearcoat:1,depthWrite:false});
      mesh(new THREE.BoxGeometry(1.4,.7,.008),windowMaterial,0,0,.27);
    }
    if(kind==="broccoli") {
      const green=new THREE.MeshStandardMaterial({color:"#386a44",roughness:.95});
      const stalk=new THREE.MeshStandardMaterial({color:"#95b47c",roughness:.9});
      mesh(new THREE.CylinderGeometry(.09,.13,.5,12),stalk,0,h/2-.05,0);
      [[-.3,.08,.02],[0,.2,-.04],[.3,.1,.01],[-.1,0,.16],[.18,0,.16]].forEach(([x,y,z])=>{
        const crown=mesh(new THREE.IcosahedronGeometry(.29,2),green,x,h/2+.12+y,z);crown.scale.y=.85;
      });
    }
  }
  // Keep different categories on the same stage, including very wide custom sizes.
  const box=new THREE.Box3().setFromObject(group);
  const size=box.getSize(new THREE.Vector3());
  const scale=Math.min(2.6/size.y,2.5/size.x);
  group.scale.setScalar(scale);
  group.position.y=-(box.min.y+size.y/2)*scale;
  return group;
}

export function createPackagingScene(host: HTMLDivElement, options: ModelOptions) {
  const surface=document.createElement("canvas");
  const gl=surface.getContext("webgl2",{alpha:true,antialias:true,powerPreference:"low-power"});
  let webgl:THREE.WebGLRenderer|null=null;
  if(gl)try{webgl=new THREE.WebGLRenderer({canvas:surface,context:gl,alpha:true,antialias:true,powerPreference:"low-power"});}catch{}
  const renderer=webgl||createCanvasRenderer();
  const software=!webgl;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(36,1,.1,40);camera.position.set(0,1.05,5.55);camera.lookAt(0,-.05,0);
  let environment:THREE.WebGLRenderTarget|null=null;
  if(webgl){
    webgl.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
    webgl.setClearColor(0x000000,0);webgl.toneMapping=THREE.ACESFilmicToneMapping;webgl.toneMappingExposure=1.2;
    webgl.shadowMap.enabled=true;webgl.shadowMap.type=THREE.PCFSoftShadowMap;
    const pmrem=new THREE.PMREMGenerator(webgl),room=new RoomEnvironment();
    environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;room.dispose();pmrem.dispose();
  }
  scene.add(new THREE.HemisphereLight(0xd4e7ff,0x1b2840,2.2));
  const key=new THREE.DirectionalLight(0xffffff,4);key.position.set(-3,5,4);key.castShadow=true;
  key.shadow.mapSize.set(512,512);key.shadow.camera.left=-3;key.shadow.camera.right=3;key.shadow.camera.top=3;key.shadow.camera.bottom=-3;
  key.shadow.bias=-.003;scene.add(key);
  const rim=new THREE.DirectionalLight(0x719dff,3);rim.position.set(3,2,-2);scene.add(rim);
  const pedestal=new THREE.Mesh(new THREE.CylinderGeometry(1.55,1.6,.09,software?32:64),new THREE.MeshStandardMaterial({color:0x172942,roughness:.6,metalness:.35}));
  pedestal.position.y=-1.49;pedestal.receiveShadow=true;scene.add(pedestal);
  const outline=new THREE.Mesh(new THREE.TorusGeometry(1.54,.009,software?3:6,software?40:80),new THREE.MeshBasicMaterial({color:0x6388dc}));outline.rotation.x=Math.PI/2;outline.position.y=-1.44;scene.add(outline);
  const pivot=new THREE.Group();scene.add(pivot);
  let model=packagingModel(options,software);pivot.add(model);pivot.rotation.set(.04,-.38,-.04);
  const canvas=renderer.domElement;canvas.setAttribute("aria-hidden","true");host.appendChild(canvas);
  let disposed=false,visible=true,spinning=!matchMedia("(prefers-reduced-motion: reduce)").matches,frame=0,previous=0;
  let pointer:number|null=null,lastX=0,lastY=0;
  const render=()=>{if(!disposed)renderer.render(scene,camera);};
  const tick=(time:number)=>{
    frame=0;if(disposed||!visible||document.hidden||!spinning)return;
    if(software&&previous&&time-previous<65){frame=requestAnimationFrame(tick);return;}
    const delta=Math.min((time-(previous||time))/1000,.1);previous=time;
    if(pointer===null)pivot.rotation.y+=delta*.22;
    render();frame=requestAnimationFrame(tick);
  };
  const wake=()=>{previous=0;if(!frame&&visible&&!document.hidden&&spinning)frame=requestAnimationFrame(tick);else render();};
  const resize=()=>{
    const {width,height}=host.getBoundingClientRect();if(!width||!height)return;
    renderer.setSize(width,height);camera.aspect=width/height;camera.position.z=camera.aspect<.85?6.6:5.55;camera.lookAt(0,-.05,0);camera.updateProjectionMatrix();render();
  };
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
  const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)wake();else{cancelAnimationFrame(frame);frame=0;}});intersection.observe(host);
  const down=(event:PointerEvent)=>{if(event.button!==0)return;pointer=event.pointerId;lastX=event.clientX;lastY=event.clientY;canvas.setPointerCapture(event.pointerId);};
  const move=(event:PointerEvent)=>{
    if(pointer!==event.pointerId)return;
    pivot.rotation.y+=(event.clientX-lastX)*.012;pivot.rotation.x=THREE.MathUtils.clamp(pivot.rotation.x+(event.clientY-lastY)*.005,-.4,.4);
    lastX=event.clientX;lastY=event.clientY;render();
  };
  const up=()=>{pointer=null;};
  const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else wake();};
  canvas.addEventListener("pointerdown",down);canvas.addEventListener("pointermove",move);canvas.addEventListener("pointerup",up);canvas.addEventListener("pointercancel",up);
  document.addEventListener("visibilitychange",visibility);
  resize();wake();
  return {
    update(next:ModelOptions){pivot.remove(model);release(model);model=packagingModel(next,software);pivot.add(model);render();},
    rotate(direction:number){pivot.rotation.y+=direction*.45;render();},
    reset(){pivot.rotation.set(.04,-.38,-.04);render();},
    autoplay(value:boolean){spinning=value;if(!value){cancelAnimationFrame(frame);frame=0;}wake();},
    dispose(){disposed=true;cancelAnimationFrame(frame);resizeObserver.disconnect();intersection.disconnect();document.removeEventListener("visibilitychange",visibility);canvas.removeEventListener("pointerdown",down);canvas.removeEventListener("pointermove",move);canvas.removeEventListener("pointerup",up);canvas.removeEventListener("pointercancel",up);release(scene);environment?.dispose();renderer.dispose();webgl?.forceContextLoss();canvas.remove();},
  };
}
