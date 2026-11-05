import React from 'react';
import {renderToString} from 'react-dom/server';
import App from './App.jsx';
export function render(path,releases){return renderToString(<App path={path} releases={releases}/>);}
