"use client";
import {useEffect,useRef,useState} from "react";
import {ChevronLeft,ChevronRight,RotateCcw,Pause,Play,MoveHorizontal,Box} from "lucide-react";
import {useI18n} from "./I18n";
import ProductArt from "./ProductArt";
import {products} from "./catalog";
import type {ModelOptions,createPackagingScene} from "./packaging-scene";

export default function Product3D(props:ModelOptions) {
  const {t}=useI18n();
  const host=useRef<HTMLDivElement>(null);
  const scene=useRef<ReturnType<typeof createPackagingScene>|null>(null);
  const latest=useRef(props);latest.current=props;
  const [status,setStatus]=useState<"loading"|"ready"|"fallback">("loading");
  const [spinning,setSpinning]=useState(false);
  useEffect(()=>{
    let cancelled=false;
    const element=host.current;
    if(!element)return;
    const observer=new IntersectionObserver(async([entry])=>{
      if(!entry.isIntersecting)return;observer.disconnect();
      try {
        const {createPackagingScene}=await import("./packaging-scene");
        if(cancelled)return;
        scene.current=createPackagingScene(element,latest.current);
        const auto=!matchMedia("(prefers-reduced-motion: reduce)").matches;
        scene.current.autoplay(auto);setSpinning(auto);setStatus("ready");
      } catch {if(!cancelled)setStatus("fallback");}
    },{rootMargin:"120px"});
    observer.observe(element);
    return()=>{cancelled=true;observer.disconnect();scene.current?.dispose();scene.current=null;};
  },[]);
  useEffect(()=>{scene.current?.update(props);},[props.kind,props.color,props.width,props.length]);
  const name=products.find(product=>product.key===props.kind)?.name||"Свой вариант";
  return <div className={`product-3d ${status}`} role="group" aria-label={`${t("3D-просмотр")}: ${t(name)}`}>
    <div className="model-badge"><Box size={13}/>{status==="fallback"?t("Визуализация"):t("3D-просмотр")}</div>
    <div ref={host} className="model-canvas"/>
    {status!=="ready"&&<div className="model-fallback"><ProductArt kind={props.kind} color={props.color}/></div>}
    <div className="model-bottom"><span className="model-hint"><MoveHorizontal size={14}/>{t(status==="ready"?"Потяните, чтобы повернуть":"Внешний вид упаковки")}</span>
      {status==="ready"&&<div className="model-controls">
        <button type="button" aria-label={t("Повернуть влево")} onClick={()=>scene.current?.rotate(-1)}><ChevronLeft size={16}/></button>
        <button type="button" aria-label={t(spinning?"Остановить вращение":"Включить вращение")} aria-pressed={spinning} onClick={()=>{scene.current?.autoplay(!spinning);setSpinning(!spinning);}}>{spinning?<Pause size={14}/>:<Play size={14}/>}</button>
        <button type="button" aria-label={t("Повернуть вправо")} onClick={()=>scene.current?.rotate(1)}><ChevronRight size={16}/></button>
        <button type="button" aria-label={t("Сбросить ракурс")} onClick={()=>scene.current?.reset()}><RotateCcw size={14}/></button>
      </div>}
    </div>
  </div>;
}
