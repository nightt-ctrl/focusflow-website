import React, {useEffect, useRef, useState} from 'react';

const welcomeKey = 'focusflow-showcase-seen';

export function Showcase({path, welcome, onClose}) {
 const dialog = useRef(null);
 const video = useRef(null);
 const [muted, setMuted] = useState(welcome);
 const [failed, setFailed] = useState(false);

 useEffect(() => {
  const panel = dialog.current;
  const player = video.current;
  panel.showModal();
  player.muted = welcome;
  if (welcome) player.play().catch(() => {});
  return () => {
   player.pause();
   panel.close();
  };
 }, [welcome]);

 function close() {
  if (welcome && (path !== '/' || window.location.hash)) {
   window.location.assign('/');
   return;
  }
  onClose();
 }

 function enableSound() {
  video.current.muted = false;
  setMuted(false);
  video.current.play().catch(() => {});
 }

 return <dialog
  className="showcase-dialog"
  ref={dialog}
  aria-labelledby="showcase-title"
  onCancel={event => {event.preventDefault(); close();}}
 >
  <header className="showcase-header">
   <h2 id="showcase-title">Meet FocusFlow</h2>
   <button className="button secondary showcase-close" type="button" onClick={close}>
    {welcome ? 'Skip to homepage' : 'Close video'}
   </button>
  </header>
  <video
   ref={video}
   className="showcase-video"
   src="/assets/focusflow-showcase.mp4"
   poster="/assets/focusflow-showcase-poster.webp"
   controls
   playsInline
   preload="metadata"
   aria-label="FocusFlow for Windows product walkthrough"
   onVolumeChange={event => setMuted(event.currentTarget.muted)}
   onEnded={welcome ? close : undefined}
   onError={() => setFailed(true)}
  />
  <footer className="showcase-footer">
   <p>{failed ? 'The video couldn’t load. You can still continue to FocusFlow.' : 'Windows product tour · 33 seconds'}</p>
   {muted && !failed && <button className="button secondary showcase-sound" type="button" onClick={enableSound}>Turn on sound</button>}
  </footer>
 </dialog>;
}

export function useShowcaseWelcome() {
 const [showcase, setShowcase] = useState(null);

 useEffect(() => {
  try {
   if (localStorage.getItem(welcomeKey)) return;
   localStorage.setItem(welcomeKey, '1');
  } catch {
   // Storage can be disabled. Keep the manual player available.
   return;
  }
  setShowcase('welcome');
 }, []);

 return {showcase, setShowcase};
}
