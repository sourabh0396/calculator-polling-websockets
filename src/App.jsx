import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import ShortPollingCalculator from './ShortPollingCalculator';
import LongPollingCalculator from './LongPollingCalculator';
import WebSocketCalculator from './WebSocketCalculator';
import './App.css';

function App() {
  return (
    <Router>
      <div className="calculator-selection">
        <Link to="/calculator/short-polling">
          <button className='pollingBtn'>ShortPollingCalculator</button>
        </Link>
        <Link to="/calculator/long-polling">
          <button className='pollingBtn'>LongPollingCalculator</button>
        </Link>
        <Link to="/calculator/web-socket">
          <button className='pollingBtn'>WebSocketCalculator</button>
        </Link>
      </div>
      <Routes>
        <Route path="/calculator/short-polling" element={<ShortPollingCalculator />} />
        <Route path="/calculator/long-polling" element={<LongPollingCalculator />} />
        <Route path="/calculator/web-socket" element={<WebSocketCalculator />} />
      </Routes>
    </Router>
  )
}
export default App;
// import React from 'react';
// import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
// import ShortPollingCalculator from './ShortPollingCalculator';
// import LongPollingCalculator from './LongPollingCalculator';
// import WebSocketCalculator from './WebSocketCalculator';
// import './App.css';

// const App = () => {
//   return (
//     <Router>
//       <div className="calculator-selection">
//         <Link to="/calculator/short-polling">
//           <button className='pollingBtn'>ShortPollingCalculator</button>
//         </Link>
//         <Link to="/calculator/long-polling">
//           <button className='pollingBtn'>LongPollingCalculator</button>
//         </Link>
//         <Link to="/calculator/web-socket">
//           <button className='pollingBtn'>WebSocketCalculator</button>
//         </Link>
//       </div>
//       <Routes>
//         <Route path="/calculator/short-polling" element={<ShortPollingCalculator />} />
//         <Route path="/calculator/long-polling" element={<LongPollingCalculator />} />
//         <Route path="/calculator/web-socket" element={<WebSocketCalculator />} />
//       </Routes>
//     </Router>
//   );
// };

// export default App;
