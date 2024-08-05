import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Calculator.css';
import { evaluate } from 'mathjs'; // Use math.js for safe evaluation

const ShortPollingCalculator = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [logs, setLogs] = useState([]);

  // Handle button clicks
  const handleClick = (value) => {
    if (value === 'AC') {
      setInput('');
      setResult('');
    } else if (value === 'DEL') {
      setInput(input.slice(0, -1));
    } else if (value === '=') {
      evaluateExpression(); // Only evaluate when '=' is clicked
    } else {
      setInput(input + value);
    }
  };

  // Evaluate expression and send to backend
  const evaluateExpression = async () => {
    try {
      const res = evaluate(input); // Safely evaluate expression using math.js
      setResult(res);

      // Send expression to backend API
      await axios.post('http://localhost:5000/api/logs', {
        expression: input,
        isValid: true,
        output: res,
      });

      // Fetch logs after posting the evaluation result
      fetchLogs();
    } catch (error) {
      console.error('Error evaluating expression:', error);
      setResult('Error');
    }
  };

  // Fetch logs from backend
  const fetchLogs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/logs');
      setLogs(res.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  // Initial fetch of logs on component mount
  useEffect(() => {
    fetchLogs(); // Fetch existing logs on component load
  });

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
            <button onClick={() => handleClick('00')}>00</button>
            <button onClick={() => handleClick('0')}>0</button>
            <button className="operator" onClick={() => handleClick('.')}>.</button>
            <button className="operator eql" onClick={() => handleClick('=')}>=</button>
          </div>
        </div>
      </div>
      <div id="table">
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
            {logs.map((log, index) => (
              <tr key={log._id || index}>
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

export default ShortPollingCalculator;
