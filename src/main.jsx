import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './dashboard.css';
import './plans.css';
import './mobile.css';

createRoot(document.getElementById('app')).render(<StrictMode><App /></StrictMode>);
