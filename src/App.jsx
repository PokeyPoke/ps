import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import CandidateCard from './components/CandidateCard';

function App() {
  const [candidates, setCandidates] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io();
    socketRef.current = socket;
    socket.on('snapshot', data => setCandidates(data));
    socket.on('update', ({ candidateId, field }) => {
      setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, [field]: c[field]+1 } : c));
    });
    return () => socket.disconnect();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-4">2028 Election Popularity Tracker</h1>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {candidates.map(c => (
          <CandidateCard key={c.id} candidate={c} socket={socketRef.current} />
        ))}
      </div>
    </div>
  );
}

export default App;
