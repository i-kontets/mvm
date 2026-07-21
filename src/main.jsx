import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './dashboard.css';
import './plans.css';
import './mobile.css';
import './record-first.css';
import './app.css';
import './modal-fix.css';
import './video-nav.css';
import './schedule-detail.css';

createRoot(document.getElementById('app')).render(<StrictMode><App /></StrictMode>);
