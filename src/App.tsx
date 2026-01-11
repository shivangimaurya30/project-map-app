/**
 * Main Application Component
 * 
 * Combines the drawing toolbar and map view.
 */

import { DrawingToolbar } from './components/DrawingToolbar';
import { MapView } from './components/MapView';
import './App.css';

function App() {
  return (
    <div className="app">
      <DrawingToolbar />
      <MapView />
    </div>
  );
}

export default App;
