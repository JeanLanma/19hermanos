import{e as s,o as u,r as c,N as l}from"./app-B4VnOq9P.js";const v={__name:"NavigationButton",props:{visit:{type:String,required:!1}},setup(t){const e=t,a=r=>{r&&l.visit(r)};return(r,n)=>(u(),s("button",{onClick:n[0]||(n[0]=f=>a(e.visit)),class:"w-full text-gray-600 font-bold rounded-xl border-2 border-sky-500 px-3 py-2 hover:bg-white/70 hover:shadow-md active:ring-2 active:ring-sky-300 active:ring-offset-1 active:shadow-sky-200 active:text-gray-800 duration-200"},[c(r.$slots,"default")]))}},d=t=>new Date(t).toISOString().split("T")[0].split("-").join("/"),o=t=>t==null?"":"$"+t.toString().replace(/\B(?=(\d{3})+(?!\d))/g,","),p=(t,e=2)=>Math.round(t*Math.pow(10,e))/Math.pow(10,e),i=(t,e=12)=>t==null?"":t.length<=e?t:t.substring(0,e)+"...",m={Round:p,TimestampToDate:d,FormatPrice:o,Currency:o,TruncateString:i,TruncateText:i};export{m as F,v as _};
