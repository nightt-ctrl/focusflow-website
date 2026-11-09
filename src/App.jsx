import React, {useEffect,useState} from 'react';
import {Header, useScrollReveal} from './components.jsx';
import {pages, Footer} from './content.jsx';
import {Showcase, useShowcaseWelcome} from './Showcase.jsx';

const themes = ['violet', 'ocean', 'sunset'];

export default function App({path='/',releases}){
 const [theme, setTheme] = useState('violet');
 useEffect(() => {
  try {
   const savedTheme = localStorage.getItem('focusflow-theme');
   if (themes.includes(savedTheme)) setTheme(savedTheme);
  } catch {}
 }, []);
 useEffect(() => {
  document.documentElement.dataset.theme = theme;
 }, [theme]);
 function changeTheme(value) {
  if (!themes.includes(value)) return;
  setTheme(value);
  try { localStorage.setItem('focusflow-theme', value); } catch {}
 }
 const [motion,setMotion]=useState('system');
 useEffect(()=>{try{const value=localStorage.getItem('focusflow-motion');if(value==='full'||value==='reduced')setMotion(value);}catch{}},[]);
 const changeMotion=value=>{setMotion(value);try{localStorage.setItem('focusflow-motion',value);}catch{}};
 useScrollReveal(path,motion);
 const {showcase, setShowcase}=useShowcaseWelcome();
 const Page=pages[path]||pages['/404'];
 return <>
  <Header path={path} theme={theme} onThemeChange={changeTheme}/>
  <Page releases={releases} motion={motion} onWatchShowcase={()=>setShowcase('replay')}/>
  <Footer motion={motion} onMotionChange={changeMotion}/>
  {showcase && <Showcase path={path} welcome={showcase==='welcome'} onClose={()=>setShowcase(null)}/>}
 </>;
}
