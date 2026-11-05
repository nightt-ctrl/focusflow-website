import React, {useEffect,useState} from 'react';
import {Header, useScrollReveal} from './components.jsx';
import {pages, Footer} from './content.jsx';

export default function App({path='/',releases}){
 const [motion,setMotion]=useState('full');
 useEffect(()=>{try{const value=localStorage.getItem('focusflow-motion');if(value==='full'||value==='reduced')setMotion(value);}catch{}},[]);
 const changeMotion=value=>{setMotion(value);try{localStorage.setItem('focusflow-motion',value);}catch{}};
 useScrollReveal(path,motion);
 const Page=pages[path]||pages['/404'];
 return <><Header path={path}/><Page releases={releases}/><Footer motion={motion} onMotionChange={changeMotion}/></>;
}
