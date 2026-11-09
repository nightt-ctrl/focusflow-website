import React, {useEffect, useRef} from 'react';

const clamp = value => Math.min(1, Math.max(0, value));

// An independent adaptation of dqnamo's Iridescent Foil experiment.
export function IridescentFoil({children, motion}) {
 const surface = useRef(null);

 useEffect(() => {
  if (motion === 'reduced') return;

  const foil = surface.current;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let pointer;
  let frame = 0;

  function paint() {
   frame = 0;
   if (motion === 'system' && preference.matches) return;
   const bounds = foil.getBoundingClientRect();
   if (bounds.bottom < 0 || bounds.top > innerHeight) return;

   const x = pointer ? clamp((pointer.x - bounds.left) / bounds.width) : 0.5;
   const y = pointer ? clamp((pointer.y - bounds.top) / bounds.height) : 0.5;
   const progress = clamp((innerHeight - bounds.top) / (innerHeight + bounds.height));
   foil.style.setProperty('--foil-x', `${x * 100}%`);
   foil.style.setProperty('--foil-y', `${y * 100}%`);
   foil.style.setProperty('--foil-sweep', `${18 + progress * 64 + (x - 0.5) * 26}%`);
  }

  function schedule() {
   if (!frame) frame = requestAnimationFrame(paint);
  }

  function move(event) {
   if (event.pointerType === 'touch') return;
   pointer = {x: event.clientX, y: event.clientY};
   schedule();
  }

  function reset() {
   pointer = undefined;
   schedule();
  }

  foil.addEventListener('pointermove', move, {passive: true});
  foil.addEventListener('pointerleave', reset);
  window.addEventListener('scroll', schedule, {passive: true});
  window.addEventListener('resize', schedule);
  preference.addEventListener('change', schedule);
  schedule();

  return () => {
   foil.removeEventListener('pointermove', move);
   foil.removeEventListener('pointerleave', reset);
   window.removeEventListener('scroll', schedule);
   window.removeEventListener('resize', schedule);
   preference.removeEventListener('change', schedule);
   cancelAnimationFrame(frame);
   for (const property of ['--foil-x', '--foil-y', '--foil-sweep']) foil.style.removeProperty(property);
  };
 }, [motion]);

 return <figure className="foil-surface" ref={surface}>
  <div className="foil-film" aria-hidden="true" />
  {children}
 </figure>;
}
