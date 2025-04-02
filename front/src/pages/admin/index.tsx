import React, { useEffect, useState } from 'react';

const MAX_LENGTH = 10000;

const Admin: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    return () => socket?.close();
  }, [socket]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (socket && input) {
      socket.send(input);
      setInput('');
      setOutput((prev) => [...prev, `$ ${input}`]);
    }
  };

  const handleConnectWebSocket = () => {
    if (!socket) {
      const ws = new WebSocket('ws://localhost:3001');
      ws.onopen = () => console.log('WebSocket Connected');
      ws.onmessage = handleWebSocketMessage;
      ws.onclose = () => console.log('WebSocket Disconnected');
      ws.onerror = (error) => console.error('WebSocket Error:', error);

      setSocket(ws);
    }
  };

  const handleCloseWebSocket = () => {
    if (socket) {
      socket.close();
      setSocket(null);
    }
  };

  const handleWebSocketMessage = (event: MessageEvent) => {
    setOutput((prev) => {
      const newOutput = [...prev, event.data];

      let totalLength = newOutput.reduce((sum, line) => sum + line.length, 0);

      while (totalLength > MAX_LENGTH && newOutput.length > 0) {
        totalLength -= newOutput[0].length;
        newOutput.shift();
      }

      return newOutput;
    });
  };

  return (
    <div>
      <h3>웹소켓 연결 : {socket ? '연결됨' : '끊김'}</h3>

      <div style={{ width: '50%', height: 200, border: `1px solid #000`, whiteSpace: 'pre-wrap', overflow: 'auto' }}>
        {output.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>
      <form style={{ display: 'flex', gap: 10, padding: '20px 0px' }} onSubmit={handleSubmit}>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="node cli..." />

        <button type="submit" disabled={!socket}>
          Send
        </button>
        <button type="button" onClick={handleConnectWebSocket}>
          웹소켓 연결
        </button>
        <button type="button" onClick={handleCloseWebSocket}>
          웹소켓 끊기
        </button>
      </form>

      <code>
        <div>cd</div>
        <div>dir</div>
        <div>type gitignore</div>
      </code>
    </div>
  );
};

export default Admin;
