import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Calculator.css';

const LongPollingCalculator = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [logs, setLogs] = useState([]);
  const [evaluationCounter, setEvaluationCounter] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch logs when evaluationCounter reaches a multiple of 5
  useEffect(() => {
    if (evaluationCounter > 0 && evaluationCounter % 5 === 0) {
      const fetchNewLogs = async () => {
        setLoading(true);
        setError('');

        try {
          const response = await axios.get('http://localhost:5000/api/long-polling/logs');
          let responseData = response.data;

          // Check if the response is a string (concatenated JSON objects)
          if (typeof responseData === 'string') {
            // Split the string into individual JSON objects using a regex pattern
            const logsArray = responseData.match(/{[^}]+}/g).map(log => JSON.parse(log));

            if (Array.isArray(logsArray)) {
              // Combine and sort logs
              const combinedLogs = [...logs, ...logsArray];
              const sortedLogs = combinedLogs.sort((a, b) => new Date(a.createdOn) - new Date(b.createdOn));
              const latestLogs = sortedLogs.slice(-5); // Keep only the latest 5 logs
              setLogs(latestLogs);
            } else {
              console.error('Unexpected response format:', responseData);
              setError('Unexpected response format');
            }
          } else {
            console.error('Unexpected response format:', responseData);
            setError('Unexpected response format');
          }
        } catch (error) {
          setError('Error fetching logs');
          console.error('Error fetching logs:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchNewLogs(); // Fetch logs when the counter is a multiple of 5
    }
  }, [evaluationCounter]); // Dependency on evaluationCounter

  // Handle equal button click
  const handleEqual = async () => {
    if (!input) {
      alert('Expression is empty');
      return;
    }

    let calculationResult;
    try {
      calculationResult = eval(input).toString();
      setResult(calculationResult);
    } catch (error) {
      setResult('Error');
      return;
    }

    const isValid = calculationResult !== 'Error';
    try {
      await axios.post('http://localhost:5000/api/logs', {
        expression: input,
        isValid, // Corrected key name to match backend
        output: isValid ? parseFloat(calculationResult) : null,
      });

      if (isValid) {
        setInput(calculationResult);
        setEvaluationCounter(prev => prev + 1); // Increment counter
      } else {
        alert('Expression is invalid');
        setInput('');
      }
    } catch (error) {
      console.error('Error adding log:', error);
    }
  };

  // Handle input button click
  const handleClick = (value) => {
    if (input.length < 15) {
      setInput(prev => prev + value);
    }
  };

  const handleClear = () => {
    setInput('');
    setResult('');
  };

  const handleBackspace = () => {
    setInput(prev => prev.slice(0, -1));
  };

  return (
    <div className='main' style={{ display: 'flex' }}>
      <div className="calculator">
        <div className="display">
          <div className="input" style={{ textAlign: 'right', color: 'white' }}>{input || ''}</div>
          <div className="#resultBox" style={{ textAlign: 'right', color: 'white' }}>{result}</div>
        </div>
        <div className="buttons">
          <button className="operator" onClick={handleClear}>AC</button>
          <button className="operator" onClick={() => handleClick('%')}>%</button>
          <button className="operator" onClick={handleBackspace}>⌫</button>
          <button className="operator operation" onClick={() => handleClick('/')}>÷</button>
          <button onClick={() => handleClick('7')}>7</button>
          <button onClick={() => handleClick('8')}>8</button>
          <button onClick={() => handleClick('9')}>9</button>
          <button className="operator operation" onClick={() => handleClick('*')}>×</button>
          <button onClick={() => handleClick('4')}>4</button>
          <button onClick={() => handleClick('5')}>5</button>
          <button onClick={() => handleClick('6')}>6</button>
          <button className="operator operation" onClick={() => handleClick('-')}>-</button>
          <button onClick={() => handleClick('1')}>1</button>
          <button onClick={() => handleClick('2')}>2</button>
          <button onClick={() => handleClick('3')}>3</button>
          <button className="operator operation" onClick={() => handleClick('+')}>+</button>
          <button onClick={() => handleClick('0')}>0</button>
          <button onClick={() => handleClick('00')}>00</button>
          <button onClick={() => handleClick('.')}>.</button>
          <button onClick={handleEqual} className="operator operation equal">=</button>
        </div>
      </div>
      <div className="log-table">
        <h2>Calculator Logs</h2>
        {loading && <p>Loading logs...</p>}
        {error && <p className="error">{error}</p>}
        <table id='log'>
          <thead>
            <tr>
              <th>ID</th>
              <th>Expression</th>
              <th>Is Valid</th>
              <th>Output</th>
              <th>Created On</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={log._id}>
                <td>{index + 1}</td>
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

// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import './Calculator.css';

// const LongPollingCalculator = () => {
//   const [input, setInput] = useState('');
//   const [result, setResult] = useState('');
//   const [logs, setLogs] = useState([]);
//   const [executionCount, setExecutionCount] = useState(0);

//   const pollingInterval = useRef(null);

//   // Handle button clicks
//   const handleClick = (value) => {
//     if (value === 'AC') {
//       setInput('');
//       setResult('');
//     } else if (value === 'DEL') {
//       setInput(input.slice(0, -1));
//     } else if (value === '=') {
//       evaluateExpression();
//     } else {
//       setInput(input + value);
//     }
//   };

//   // Evaluate expression and store log
//   const evaluateExpression = async () => {
//     try {
//       const res = eval(input); // Evaluate expression
//       setResult(res);
//       const isValid = !isNaN(res);
//       await axios.post('http://localhost:5000/api/logs', {
//         expression: input,
//         isValid: true,
//         output: res,
//       });

//       setExecutionCount((prevCount) => {
//         const newCount = prevCount + 1;
//         if (newCount >= 5) {
//           fetchBulkLogs(); // Fetch logs when 5 executions are done
//         }
//         return newCount;
//       });
//     } catch (error) {
//       setResult('Error');
//     }
//   };

//   // Fetch bulk logs from the server
//   const fetchBulkLogs = async () => {
//     try {
//       const res = await axios.get('http://localhost:5000/api/bulk-logs');
//       if (res.data.length > 0) {
//         setLogs((prevLogs) => [...prevLogs, ...res.data]);
//       }
//     } catch (error) {
//       console.error('Error fetching bulk logs:', error);
//     }
//   };

//   // Long polling logic
//   const longPollLogs = async () => {
//     try {
//       const res = await axios.get(`http://localhost:5000/api/long-polling/logs`);
//       if (res.status === 204) {
//         // No new logs, continue polling
//         setTimeout(longPollLogs, 1000);
//       } else if (res.data.length > 0) {
//         setLogs((prevLogs) => [...prevLogs, ...res.data]);
//       }
//     } catch (error) {
//       console.error('Error fetching new logs:', error);
//       // Retry logic with exponential backoff
//       setTimeout(longPollLogs, 2000);
//     }
//   };

//   // Start long polling and fetch initial logs
//   useEffect(() => {
//     // longPollLogs(); // Start long polling

//     return () => {
//       if (pollingInterval.current) {
//         clearInterval(pollingInterval.current);
//       }
//     };
//   }, []);

//   return (
//     <div id="main">
//       <div className="calculator">
//         <div className="display">
//           <input type="text" value={input} placeholder="0" readOnly />
//           <div id="resultBox" className="result">{result}</div>
//         </div>
//         <div className="keypad">
//           <div>
//             <button className="operator" onClick={() => handleClick('AC')}>AC</button>
//             <button className="operator" onClick={() => handleClick('%')}>%</button>
//             <button className="operator" onClick={() => handleClick('DEL')}>DEL</button>
//             <button className="operator" onClick={() => handleClick('/')}>/</button>
//           </div>
//           <div>
//             <button onClick={() => handleClick('7')}>7</button>
//             <button onClick={() => handleClick('8')}>8</button>
//             <button onClick={() => handleClick('9')}>9</button>
//             <button className="operator" onClick={() => handleClick('*')}>*</button>
//           </div>
//           <div>
//             <button onClick={() => handleClick('4')}>4</button>
//             <button onClick={() => handleClick('5')}>5</button>
//             <button onClick={() => handleClick('6')}>6</button>
//             <button className="operator" onClick={() => handleClick('-')}>-</button>
//           </div>
//           <div>
//             <button onClick={() => handleClick('1')}>1</button>
//             <button onClick={() => handleClick('2')}>2</button>
//             <button onClick={() => handleClick('3')}>3</button>
//             <button className="operator" onClick={() => handleClick('+')}>+</button>
//           </div>
//           <div>
//             <button onClick={() => handleClick('00')}>00</button>
//             <button onClick={() => handleClick('0')}>0</button>
//             <button className="operator" onClick={() => handleClick('.')}>.</button>
//             <button className="operator eql" onClick={() => handleClick('=')}>=</button>
//           </div>
//         </div>
//       </div>
//       <div id="table">
//         <table>
//           <thead>
//             <tr>
//               <th>Expression</th>
//               <th>Valid</th>
//               <th>Output</th>
//               <th>
//                 Created On
//                 <br />
//                 Date & Time
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {logs.map((log) => (
//               <tr key={log._id}>
//                 <td>{log.expression}</td>
//                 <td>{log.isValid ? 'Yes' : 'No'}</td>
//                 <td>{log.output}</td>
//                 <td>{new Date(log.createdOn).toLocaleString()}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default LongPollingCalculator;
// // import React, { useState, useEffect } from 'react';
// // import axios from 'axios';
// // import './Calculator.css';

// // const LongPollingCalculator = () => {
// //   const [input, setInput] = useState('');
// //   const [result, setResult] = useState('');
// //   const [logs, setLogs] = useState([]);
// //   const [lastLogId, setLastLogId] = useState(null);

// //   // Handle button clicks
// //   const handleClick = (value) => {
// //     if (value === 'AC') {
// //       setInput('');
// //       setResult('');
// //     } else if (value === 'DEL') {
// //       setInput(input.slice(0, -1));
// //     } else if (value === '=') {
// //       evaluateExpression();
// //     } else {
// //       setInput(input + value);
// //     }
// //   };

// //   const evaluateExpression = async () => {
// //     try {
// //       const res = eval(input); // Evaluate expression (use with caution)
// //       setResult(res);

// //       // Send expression to backend API
// //       const logResponse = await axios.post('http://localhost:5000/api/logs', {
// //         expression: input,
// //         isValid: true,
// //         output: res,
// //       });
// //       console.log('Log saved:', logResponse.data);
// //       // Clear input after evaluation
// //       setInput('');
// //     } catch (error) {
// //       setResult('Error');
// //       console.error('Error evaluating expression:', error);
// //       // Send invalid log to backend
// //       await axios.post('http://localhost:5000/api/logs', {
// //         expression: input,
// //         isValid: false,
// //         output: 'Error',
// //       });
// //     }
// //   };
// //   useEffect(() => {
// //     const fetchInitialLogs = async () => {
// //       try {
// //         const res = await axios.get('http://localhost:5000/api/logs');
// //         setLogs(res.data); // Update state with initial logs
// //       } catch (error) {
// //         console.error('Error fetching initial logs:', error);
// //       }
// //     };
// //     fetchInitialLogs();
// //   }, []);

// // const longPoll = async () => {
// //   try {
// //     console.log('Long polling initiated...');
// //     const res = await axios.get(`http://localhost:5000/api/logs`);
// //     console.log('Received response:', res.data);
    
// //     const newLogs = res.data.filter(log => !logs.some(existingLog => existingLog._id === log._id));
    
// //     if (newLogs.length > 0) {
// //       console.log('New logs:', newLogs);
// //       setLogs(prevLogs => [...prevLogs, ...newLogs]);
// //       setLastLogId(newLogs[newLogs.length - 1]._id);
// //     }
    
// //     setTimeout(longPoll, 5000); // Retry every 5 seconds
// //   } catch (error) {
// //     console.error('Error with long polling:', error);
// //     setTimeout(longPoll, 5000); // Retry after error
// //   }
// // };

// //   // Initial fetch of logs
// //   useEffect(() => {
// //     longPoll(); // Start the long polling when the component mounts
// //   }, []); // Run once on component mount

// //   return (
// //     <div id='main' style={{alignItems:'center',justifyContent:'center',height:'1000',}}>
// //       <div className="calculator">
// //         <div className="display">
// //           <input type="text" value={input} placeholder="0" readOnly />
// //           <div id="resultBox" className="result">{result}</div>
// //         </div>
// //         <div className="keypad">
// //           <div>
// //             <button className="operator" onClick={() => handleClick('AC')}>AC</button>
// //             <button className="operator" onClick={() => handleClick('%')}>%</button>
// //             <button className="operator" onClick={() => handleClick('DEL')}>DEL</button>
// //             <button className="operator" onClick={() => handleClick('/')}>/</button>
// //           </div>
// //           <div>
// //             <button onClick={() => handleClick('7')}>7</button>
// //             <button onClick={() => handleClick('8')}>8</button>
// //             <button onClick={() => handleClick('9')}>9</button>
// //             <button className="operator" onClick={() => handleClick('*')}>*</button>
// //           </div>
// //           <div>
// //             <button onClick={() => handleClick('4')}>4</button>
// //             <button onClick={() => handleClick('5')}>5</button>
// //             <button onClick={() => handleClick('6')}>6</button>
// //             <button className="operator" onClick={() => handleClick('-')}>-</button>
// //           </div>
// //           <div>
// //             <button onClick={() => handleClick('1')}>1</button>
// //             <button onClick={() => handleClick('2')}>2</button>
// //             <button onClick={() => handleClick('3')}>3</button>
// //             <button className="operator" onClick={() => handleClick('+')}>+</button>
// //           </div>
// //           <div>
// //             <button onClick={() => handleClick('00')}>00</button>
// //             <button onClick={() => handleClick('0')}>0</button>
// //             <button className="operator" onClick={() => handleClick('.')}>.</button>
// //             <button className="operator eql" onClick={() => handleClick('=')}>=</button>
// //           </div>
// //         </div>
// //       </div>
// //       <div id='table' style={{ marginTop: '20px', maxHeight: '400px', overflowY: 'auto' }}>
// //         <table>
// //           <thead>
// //             <tr>
// //               {/* <th>ID</th> */}
// //               <th>Expression</th>
// //               <th>Valid</th>
// //               <th>Output</th>
// //               <th>Created On</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {logs.map(log => (
// //               <tr key={log._id}>
// //                 {/* <td>{log._id}</td> */}
// //                 <td>{log.expression}</td>
// //                 <td>{log.isValid ? 'Yes' : 'No'}</td>
// //                 <td>{log.output}</td>
// //                 <td>{new Date(log.createdOn).toLocaleString()}</td>
// //               </tr>
// //             ))}
// //           </tbody>
// //         </table>
// //       </div>
// //     </div>
// //   );
// // };

// // export default LongPollingCalculator;
