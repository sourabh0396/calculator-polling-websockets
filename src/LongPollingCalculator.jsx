import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Calculator.css';

const LongPollingCalculator = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [logs, setLogs] = useState([]);
  const [lastLogId, setLastLogId] = useState(null);

  // Handle button clicks
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
      const res = eval(input); // Evaluate expression (use with caution)
      setResult(res);

      // Send expression to backend API
      const logResponse = await axios.post('http://localhost:5000/api/logs', {
        expression: input,
        isValid: true,
        output: res,
      });
      console.log('Log saved:', logResponse.data);
      // Clear input after evaluation
      setInput('');
    } catch (error) {
      setResult('Error');
      console.error('Error evaluating expression:', error);
      // Send invalid log to backend
      await axios.post('http://localhost:5000/api/logs', {
        expression: input,
        isValid: false,
        output: 'Error',
      });
    }
  };
  useEffect(() => {
    const fetchInitialLogs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/logs');
        setLogs(res.data); // Update state with initial logs
      } catch (error) {
        console.error('Error fetching initial logs:', error);
      }
    };
    fetchInitialLogs();
  }, []);

const longPoll = async () => {
  try {
    console.log('Long polling initiated...');
    const res = await axios.get(`http://localhost:5000/api/logs`);
    console.log('Received response:', res.data);
    
    const newLogs = res.data.filter(log => !logs.some(existingLog => existingLog._id === log._id));
    
    if (newLogs.length > 0) {
      console.log('New logs:', newLogs);
      setLogs(prevLogs => [...prevLogs, ...newLogs]);
      setLastLogId(newLogs[newLogs.length - 1]._id);
    }
    
    setTimeout(longPoll, 5000); // Retry every 5 seconds
  } catch (error) {
    console.error('Error with long polling:', error);
    setTimeout(longPoll, 5000); // Retry after error
  }
};

  // Initial fetch of logs
  useEffect(() => {
    longPoll(); // Start the long polling when the component mounts
  }, []); // Run once on component mount

  return (
    <div id='main' style={{alignItems:'center',justifyContent:'center',height:'1000',}}>
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
            <button onClick={() => handleClick('00')}>00</button>
            <button onClick={() => handleClick('0')}>0</button>
            <button className="operator" onClick={() => handleClick('.')}>.</button>
            <button className="operator eql" onClick={() => handleClick('=')}>=</button>
          </div>
        </div>
      </div>
      <div id='table' style={{ marginTop: '20px', maxHeight: '400px', overflowY: 'auto' }}>
        <table>
          <thead>
            <tr>
              {/* <th>ID</th> */}
              <th>Expression</th>
              <th>Valid</th>
              <th>Output</th>
              <th>Created On</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log._id}>
                {/* <td>{log._id}</td> */}
                <td>{log.expression}</td>
                <td>{log.isValid ? 'Yes' : 'No'}</td>
                <td>{log.output}</td>
                <td>{new Date(log.createdOn).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LongPollingCalculator;
