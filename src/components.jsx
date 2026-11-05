import React, {cloneElement, useEffect, useRef, useState} from 'react';

export function Icon({name, className=''}) {
 const paths={arrow:<path d="M5 12h14m-5-5 5 5-5 5"/>,menu:<path d="M4 7h16M4 12h16M4 17h16"/>,close:<path d="m6 6 12 12M6 18 18 6"/>};
 return <svg className={className} aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export function Header({path}) {
 const [open,setOpen]=useState(false);
 const button=useRef(null);
 useEffect(()=>{
  if(!open)return;
  const escape=event=>{if(event.key==='Escape'){setOpen(false);button.current?.focus();}};
  document.addEventListener('keydown',escape);
  return ()=>document.removeEventListener('keydown',escape);
 },[open]);
 return <><a className="skip" href="#main">Skip to content</a><header className="site-header"><nav className="container nav" aria-label="Main navigation">
  <a className="brand" href="/" aria-label="FocusFlow home"><img src="/assets/logo.svg" width="30" height="30" alt=""/>FocusFlow</a>
  <button className="menu-button" ref={button} onClick={()=>setOpen(value=>!value)} aria-expanded={open} aria-controls="nav-links" aria-label={open?'Close navigation':'Open navigation'}><Icon name={open?'close':'menu'}/></button>
  <div className={`nav-links${open?' open':''}`} id="nav-links" onClick={()=>setOpen(false)}>
   <a href="/#features">Features</a><a href="/#family">For families</a><a href="/guide" aria-current={path==='/guide'?'page':undefined}>Get started</a>
   <a href="/download" className="nav-download" aria-current={path==='/download'?'page':undefined}><span>Download</span><Icon name="arrow"/></a>
  </div>
 </nav></header></>;
}

export function FeatureTour({panels}) {
 const [selected,setSelected]=useState(0);
 const tabRefs=useRef([]);
 const names=['Focus sessions','Make it yours','Study hours'];
 const ids=['sessions','appearance','hours'];
 function keyboard(event,index){
  const keys={ArrowRight:(index+1)%3,ArrowLeft:(index+2)%3,Home:0,End:2};
  if(keys[event.key]===undefined)return;
  event.preventDefault();setSelected(keys[event.key]);tabRefs.current[keys[event.key]]?.focus();
 }
 return <div className="feature-tour"><div className="feature-tabs" role="tablist" aria-label="Explore FocusFlow features">
  {names.map((name,index)=><button key={ids[index]} ref={el=>{tabRefs.current[index]=el;}} id={`tab-${ids[index]}`} role="tab" aria-selected={selected===index} aria-controls={`panel-${ids[index]}`} tabIndex={selected===index?0:-1} onClick={()=>setSelected(index)} onKeyDown={event=>keyboard(event,index)}>{name}</button>)}
 </div>{panels.map((panel,index)=>cloneElement(panel,{key:ids[index],hidden:selected!==index,tabIndex:0}))}</div>;
}

export function CopyButton({value}) {
 const [status,setStatus]=useState('Copy checksum');
 const timer=useRef(null);
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 async function copy(){
  clearTimeout(timer.current);
  try{await navigator.clipboard.writeText(value);setStatus('Copied');}
  catch{setStatus('Select the checksum below');}
  timer.current=setTimeout(()=>setStatus('Copy checksum'),2300);
 }
 return <button className="copy-button" onClick={copy} aria-live="polite">{status}</button>;
}

export function MotionControl({mode,onChange}){
 const [systemReduced,setSystemReduced]=useState(false);
 useEffect(()=>{
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  const update=()=>setSystemReduced(preference.matches);
  update();preference.addEventListener('change',update);
  return ()=>preference.removeEventListener('change',update);
 },[]);
 const enabled=mode==='full'||(mode==='system'&&!systemReduced);
 return <button className="motion-control" type="button" aria-pressed={enabled} onClick={()=>onChange(enabled?'reduced':'full')} title="Choose whether the website uses animations"><span className="motion-dot"/>{enabled?'Animations on':'Animations off'}</button>;
}

export function useScrollReveal(path,mode){
 useEffect(()=>{
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0;
  const selector='[data-reveal], .download-card, .guide-content section, .feature-tabs, .feature-panel > div, .faq-grid > div:first-child, .faq-list details';
  const targets=[...document.querySelectorAll(selector)].filter(el=>!el.parentElement?.closest(selector));
  function update(){
   frame=0;
   document.documentElement.dataset.motion=mode;
   const reduced=mode==='reduced'||(mode==='system'&&preference.matches);
   if(reduced){
    targets.forEach(el=>{el.classList.remove('scroll-linked');el.style.removeProperty('--reveal-progress');});
    return;
   }
   const viewport=window.innerHeight;
   // offsetTop ignores the reveal transform, so progress cannot feed back into its own measurement.
   const values=targets.map(el=>{
    let top=0,node=el;
    while(node){top+=node.offsetTop;node=node.offsetParent;}
    const progress=Math.max(0,Math.min(1,(viewport*.94-(top-window.scrollY))/(viewport*.48)));
    return [el,progress];
   });
   values.forEach(([el,progress])=>{
    el.classList.add('scroll-linked');
    el.style.setProperty('--reveal-progress',String(progress));
   });
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(update);}
  update();
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule);
  document.addEventListener('click',schedule);
  document.addEventListener('load',schedule,true);
  preference.addEventListener('change',schedule);
  return ()=>{
   cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);document.removeEventListener('click',schedule);document.removeEventListener('load',schedule,true);preference.removeEventListener('change',schedule);
   targets.forEach(el=>{el.classList.remove('scroll-linked');el.style.removeProperty('--reveal-progress');});
  };
 },[path,mode]);
}
