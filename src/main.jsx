import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { LangProvider } from './LangContext.jsx';
import { AdSenseLoader } from './AdSense.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LangProvider>
      <AdSenseLoader />
      <App />
    </LangProvider>
  </React.StrictMode>
);
