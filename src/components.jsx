import React, {cloneElement, useEffect, useRef, useState} from 'react';

export function Icon({name, className=''}) {
 const paths={download:<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>,arrow:<path d="M5 12h14m-5-5 5 5-5 5"/>,menu:<path d="M4 7h16M4 12h16M4 17h16"/>,close:<path d="m6 6 12 12M6 18 18 6"/>};
 return <svg className={className} aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{name==='play'?<path d="M8 5v14l11-7z"/>:paths[name]}</svg>;
}

export function Header({path, theme, onThemeChange}) {
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
   <label className="theme-picker" onClick={event=>event.stopPropagation()}>
    <span>Theme</span>
    <select value={theme} onChange={event=>onThemeChange(event.target.value)}>
     <option value="violet">Violet</option>
     <option value="ocean">Ocean</option>
     <option value="sunset">Sunset</option>
    </select>
   </label>
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
 return <div className="feature-tour"><div className="feature-tabs" style={{"--active-tab":selected}} role="tablist" aria-label="Explore FocusFlow features">
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
 return <button className="motion-control" type="button" aria-pressed={enabled} onClick={()=>onChange(enabled?'reduced':'full')} title="Choose whether the website uses animations"><span className="motion-dot" aria-hidden="true"/>{enabled?'Animations on':'Animations off'}</button>;
}

export function useScrollReveal(path, mode) {
 useEffect(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const targets = [...document.querySelectorAll('[data-reveal], .download-card, .guide-content section, .feature-tour, .faq-grid')];
  let observer;

  function setup() {
   observer?.disconnect();
   document.documentElement.dataset.motion = mode;
   const reduced = mode === 'reduced' || (mode === 'system' && preference.matches);
   targets.forEach(element => element.classList.remove('reveal-pending'));
   if (reduced || !('IntersectionObserver' in window)) return;

   observer = new IntersectionObserver(entries => {
    for (const {target, isIntersecting} of entries) {
     if (!isIntersecting) continue;
     target.classList.remove('reveal-pending');
     observer.unobserve(target);
    }
   }, {rootMargin: '0px 0px -32px'});
   for (const element of targets) {
    if (element.getBoundingClientRect().top < innerHeight) continue;
    element.classList.add('reveal-pending');
    observer.observe(element);
   }
  }

  setup();
  preference.addEventListener('change', setup);
  return () => {
   observer?.disconnect();
   preference.removeEventListener('change', setup);
   targets.forEach(element => element.classList.remove('reveal-pending'));
  };
 }, [path, mode]);
}
