import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
const WebSocketCalculator = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [log, setLog] = useState([]); // Updated to an array
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    const socketInstance = io('http://localhost:5000'); // Corrected URL
    setSocket(socketInstance);
    // Listening for new logs from the server
    socketInstance.on('new-log', (data) => {
      console.log('Received log:', data);
      setLog((prevLogs) => [data, ...prevLogs]); // Add the new log to the top
    });
    socketInstance.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });
    socketInstance.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });
    return () => {
      socketInstance.disconnect();
    };
  }, []);
  const handleClick = (value) => {
    if (value === 'AC') {
      setInput('');
      setResult('');
    } else if (value === 'DEL') {
      setInput(input.slice(0, -1));
    } else if (value === '=') {
      evaluateExpression();
    } else {
      setInput(input + value);
    }
  };

  const evaluateExpression = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/logs', { expression: input });

      setResult(res.data.output);

      if (socket) {
        socket.emit('log', {
          expression: input,
          isValid: res.data.isValid,
          output: res.data.output,
          createdOn: new Date().toISOString(),
        });
      }
    } catch (error) {
      setResult('Error');
      console.error('Error evaluating expression:', error);
    }
  };

  return (
    <div id="main">
      <div className="calculator">
        <div className="display">
          <input type="text" value={input} placeholder="0" readOnly />
          <div id="resultBox" className="result">{result}</div>
        </div>
        <div className="keypad">
          <div>
            <button className="operator" onClick={() => handleClick('AC')}>AC</button>
            <button className="operator" onClick={() => handleClick('%')}>%</button>
            <button className="operator" onClick={() => handleClick('DEL')}>DEL</button>
            <button className="operator" onClick={() => handleClick('/')}>/</button>
          </div>
          <div>
            <button onClick={() => handleClick('7')}>7</button>
            <button onClick={() => handleClick('8')}>8</button>
            <button onClick={() => handleClick('9')}>9</button>
            <button className="operator" onClick={() => handleClick('*')}>*</button>
          </div>
          <div>
            <button onClick={() => handleClick('4')}>4</button>
            <button onClick={() => handleClick('5')}>5</button>
            <button onClick={() => handleClick('6')}>6</button>
            <button className="operator" onClick={() => handleClick('-')}>-</button>
          </div>
          <div>
            <button onClick={() => handleClick('1')}>1</button>
            <button onClick={() => handleClick('2')}>2</button>
            <button onClick={() => handleClick('3')}>3</button>
            <button className="operator" onClick={() => handleClick('+')}>+</button>
          </div>
          <div>
            <button onClick={() => handleClick('0')}>00</button>
            <button onClick={() => handleClick('0')}>0</button>
            <button onClick={() => handleClick('.')}>.</button>
            <button id="equals" onClick={() => handleClick('=')}>=</button>
          </div>
        </div>
      </div>
      <div className="logs">
        <h2>Logs</h2>
        <table>
          <thead>
            <tr>
              <th>Expression</th>
              <th>Valid</th>
              <th>Output</th>
              <th>Created On</th>
            </tr>
          </thead>
          <tbody>
            {log.map((entry, index) => (
              <tr key={index}>
                <td>{entry.expression}</td>
                <td>{entry.isValid ? 'Yes' : 'No'}</td>
                <td>{entry.output !== null ? entry.output : 'N/A'}</td>
                <td>{new Date(entry.createdOn).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WebSocketCalculator;
