import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/base.css';
import './styles/layout.css';
import './styles/modal.css';

// Reactの開発時チェックを有効にして、#app要素へアプリ全体を描画する。
createRoot(document.getElementById('app')).render(<StrictMode><App /></StrictMode>);
