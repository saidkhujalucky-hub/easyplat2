"use client";
import { useId } from "react";
import type { ProductKey } from "./catalog";
import { useI18n } from "./I18n";

export default function ProductArt({kind, color="#2B5DE0", className=""}: {kind:ProductKey;color?:string;className?:string}) {
  const id = useId().replace(/:/g, "");
  const {t,lang}=useI18n();
  const clear=color.toUpperCase()==="#ADCED5";
  const g=(n:string)=>`url(#${id}-${n})`;
  return <svg className={className} viewBox="0 0 360 340" fill="none" role="img" aria-label={t({water:"Упаковка для 19-литровой бутыли",cookies:"Упаковка для печенья",broccoli:"Упаковка для брокколи",carpets:"Защитный рукав для ковров",tshirt:"Пакет «Майка»",trash:"Пакет для мусора",custom:"Упаковка по вашим параметрам"}[kind])}>
    <defs>
      <linearGradient id={`${id}-body`} x1="95" y1="100" x2="270" y2="250" gradientUnits="userSpaceOnUse"><stop stopColor={color}/><stop offset=".44" stopColor={color}/><stop offset=".72" stopColor={color}/><stop offset="1" stopColor={color}/></linearGradient>
      <linearGradient id={`${id}-light`} x1="80" y1="130" x2="280" y2="200" gradientUnits="userSpaceOnUse"><stop stopColor="white" stopOpacity=".75"/><stop offset=".2" stopColor="white" stopOpacity=".08"/><stop offset=".55" stopColor="white" stopOpacity=".26"/><stop offset=".8" stopColor="white" stopOpacity="0"/><stop offset="1" stopColor="#08164C" stopOpacity=".34"/></linearGradient>
      <linearGradient id={`${id}-edge`} x1="130" y1="50" x2="240" y2="280" gradientUnits="userSpaceOnUse"><stop stopColor="white" stopOpacity=".75"/><stop offset=".42" stopColor="white" stopOpacity=".03"/><stop offset="1" stopColor="#10203A" stopOpacity=".16"/></linearGradient>
      <linearGradient id={`${id}-bottle`} x1="98" y1="130" x2="261" y2="170" gradientUnits="userSpaceOnUse"><stop stopColor="#80B9E6"/><stop offset=".16" stopColor="#D7EFFD"/><stop offset=".31" stopColor="#A7D5F5"/><stop offset=".62" stopColor="#7AB5E3"/><stop offset=".8" stopColor="#A9D7F3"/><stop offset="1" stopColor="#4B8DC9"/></linearGradient>
      <linearGradient id={`${id}-roll`} x1="90" y1="70" x2="280" y2="240" gradientUnits="userSpaceOnUse"><stop stopColor="#F7F8FB"/><stop offset=".25" stopColor={color}/><stop offset=".44" stopColor="#F2F9FA"/><stop offset=".6" stopColor={color}/><stop offset="1" stopColor="#7D9FAE"/></linearGradient>
      <radialGradient id={`${id}-shadow`}><stop stopColor="#1F2937" stopOpacity=".22"/><stop offset="1" stopColor="#1F2937" stopOpacity="0"/></radialGradient>
    </defs>
    <ellipse cx="180" cy="291" rx="135" ry="25" fill={g("shadow")}/>
    {kind === "water" ? <g transform="rotate(-7 180 170)">
      <path d="M156 57H202V81Q202 98 220 108C246 122 260 135 260 160V247Q260 277 235 283H123Q98 277 98 247V160C98 136 112 122 138 108Q156 98 156 81Z" fill={g("bottle")} stroke="#699ED0" strokeWidth="1.3"/>
      <ellipse cx="179" cy="278" rx="58" ry="7" fill="#417CB8" fillOpacity=".2"/>
      <path d="M107 149Q179 160 251 149M103 164Q179 176 255 164M103 234Q179 247 255 234M104 250Q179 264 254 250M111 266Q179 278 247 266" stroke="#5F9BD3" strokeWidth="5" strokeOpacity=".42" strokeLinecap="round"/>
      <path d="M108 146Q179 157 250 146M104 161Q179 172 254 161M104 231Q179 244 254 231M106 247Q179 259 252 247M113 263Q179 274 245 263" stroke="#ECF8FF" strokeWidth="2.5" strokeOpacity=".75" strokeLinecap="round"/>
      <path d="M161 77V91Q158 106 140 116Q116 129 113 146M113 182V222" stroke="white" strokeWidth="6" strokeOpacity=".62" strokeLinecap="round"/>
      <path d="M91 137Q179 128 267 139L270 254L253 281L104 280L89 254Z" fill={g("body")} fillOpacity=".34"/>
      <path d="M91 137Q179 128 267 139L270 254L253 281L104 280L89 254Z" fill={g("light")} fillOpacity=".44"/>
      <path d="M95 141L108 264L126 250M263 144L253 269L233 252M108 277Q179 285 250 278" stroke="#E6F1FF" strokeWidth="1.6" strokeOpacity=".65"/>
      <rect x="153" y="47" width="52" height="22" rx="6" fill="#2452BE"/>
      <path d="M160 51V63M167 51V63M174 51V63M181 51V63M188 51V63M195 51V63" stroke="#9FBAF4" strokeOpacity=".5" strokeWidth="1.4"/>
      <rect x="154" y="69" width="50" height="5" rx="2" fill="#E0EDFE"/>
      <rect x="125" y="183" width="108" height="43" rx="6" fill="#F3F8FF" fillOpacity=".94"/>
      <text x="179" y="212" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="26" fontWeight="600" fill="#2853A6">{lang==="ru"?"19 л":"19 L"}</text>
    </g> : kind === "carpets" ? <g transform="rotate(-24 180 170)">
      <path d="M119 72L98 244C93 279 224 290 236 255L258 84Z" fill={g("roll")} stroke="#9EB5C2"/>
      <path d="M144 92L123 258M171 99L150 268M225 95L205 270" stroke="white" strokeOpacity=".65" strokeWidth="3"/>
      <path d="M100 243C113 257 215 274 236 253" stroke="#56788F" strokeOpacity=".5" strokeWidth="2"/>
      <ellipse cx="188" cy="81" rx="70" ry="28" transform="rotate(5 188 81)" fill={color} stroke="#A4BAC7" strokeWidth="2"/>
      {[62,53,44,35,26].map(r=><ellipse key={r} cx="188" cy="81" rx={r} ry={r*.37} transform="rotate(5 188 81)" stroke="white" strokeOpacity=".62" strokeWidth="1.7"/>)}
      <ellipse cx="188" cy="81" rx="18" ry="10" transform="rotate(5 188 81)" fill="#746958"/><ellipse cx="188" cy="82" rx="11" ry="6" transform="rotate(5 188 82)" fill="#3F4143"/>
      <path d="M107 230L228 244L227 257L104 243Z" fill="white" fillOpacity=".7"/>
    </g> : kind === "tshirt" ? <g transform="rotate(-8 180 170)">
      <path d="M91 63H130V111Q130 137 180 137Q230 137 230 111V63H269Q277 63 277 73L266 261Q264 281 247 283H113Q96 281 94 261L83 73Q83 63 91 63Z" fill={g("body")} fillOpacity={clear?.3:1} stroke="#B8C9D8" strokeOpacity=".35"/>
      <path d="M91 63H130V111Q130 137 180 137Q230 137 230 111V63H269Q277 63 277 73L266 261Q264 281 247 283H113Q96 281 94 261L83 73Q83 63 91 63Z" fill={g("light")} fillOpacity={clear?.3:.7}/>
      <path d="M100 72L109 110M249 72L245 113M101 144L115 253L132 266M257 143L246 254L231 268M111 274Q178 282 249 274" stroke="white" strokeOpacity=".45" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M126 148L137 163L133 235M235 151L225 163L232 237" stroke="#7E95AE" strokeOpacity=".2" strokeWidth="2"/>
      <path d="M146 201H215M157 215H204" stroke={color==="#F5F3EE"?"#829BB4":"#FFFFFF"} strokeOpacity=".5" strokeWidth="3" strokeLinecap="round"/>
    </g> : kind === "trash" ? <g transform="rotate(6 180 170)">
      <path d="M153 104L144 80L160 73L179 93L196 72L211 81L202 106Z" fill={g("body")} stroke="#829BB4" strokeOpacity=".4"/>
      <path d="M151 109C129 118 112 140 105 172L91 250Q88 282 125 286H238Q275 282 269 250L254 172C247 141 230 118 207 109Z" fill={g("body")} fillOpacity={clear?.3:1} stroke="#8DA5BB" strokeOpacity=".25"/>
      <path d="M151 109C129 118 112 140 105 172L91 250Q88 282 125 286H238Q275 282 269 250L254 172C247 141 230 118 207 109Z" fill={g("light")} fillOpacity={clear?.4:.48}/>
      <path d="M154 117L137 172L128 246M172 120L165 177L176 238M201 117L222 176L235 258M111 270L155 254M244 272L210 256" stroke="white" strokeOpacity=".13" strokeWidth="3" strokeLinecap="round"/>
      <path d="M145 107Q179 115 211 105" stroke="#C1CBD5" strokeOpacity=".55" strokeWidth="6" strokeLinecap="round"/>
      <path d="M117 182L109 241" stroke="white" strokeOpacity=".25" strokeWidth="4" strokeLinecap="round"/>
    </g> : <g transform={`rotate(${kind==="cookies"?9:-9} 180 170)`}>
      {kind==="broccoli" && <g fill="#4E7854" stroke="#3B6544" strokeWidth="1.5"><path d="M147 130L159 177H202L214 126" fill="#8EB07C"/><circle cx="132" cy="108" r="28"/><circle cx="162" cy="87" r="29"/><circle cx="197" cy="88" r="33"/><circle cx="230" cy="109" r="30"/><circle cx="174" cy="117" r="34"/></g>}
      <path d="M94 59Q176 48 266 62L254 104L273 263L256 282L99 274L85 251L103 106Z" fill={g("body")} fillOpacity={clear?.3:1} stroke={kind==="cookies"?"#D2CDBF":"#89A9D2"} strokeWidth="1"/>
      <path d="M94 59Q176 48 266 62L254 104L273 263L256 282L99 274L85 251L103 106Z" fill={g("light")}/>
      <path d="M104 77L254 80M102 85L252 87M100 267L258 274" stroke={kind==="cookies"?"#CBC7BC":"#A3C0FF"} strokeOpacity=".7" strokeWidth="2"/>
      <path d="M104 106L115 130L108 238L99 262L134 243M254 104L239 131L249 247L264 265L221 249M124 131L135 153M123 152L130 205" stroke="white" strokeOpacity=".35" strokeWidth="2"/>
      <path d="M124 116L238 119L246 248L115 242Z" fill={g("edge")}/>
      {kind==="cookies" && <g transform="rotate(-6 180 180)"><rect x="128" y="142" width="111" height="75" rx="4" fill="#D9C1A2" stroke="#D7C4AA"/><path d="M129 149H237V210H129Z" fill="#D4AB74"/>{[0,1,2].map(i=><g key={i} transform={`translate(${i*28} ${i%2*7})`}><rect x="137" y="158" width="28" height="39" rx="6" fill="#C68F49" stroke="#E8C992" strokeWidth="3"/>{[0,1,2,3].map(j=><circle key={j} cx={144+j%2*13} cy={169+Math.floor(j/2)*16} r="1.5" fill="#9A6D37"/>)}</g>)}</g>}
      {kind!=="cookies" && <><path d="M144 174H222" stroke="white" strokeOpacity=".85" strokeWidth="4" strokeLinecap="round"/><path d="M160 187H205" stroke="white" strokeOpacity=".4" strokeWidth="2" strokeLinecap="round"/></>}
      <path d="M107 93L111 120M259 94L250 119" stroke="white" strokeOpacity=".7" strokeWidth="3"/>
    </g>}
  </svg>;
}
