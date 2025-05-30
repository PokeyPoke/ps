import { useState, useEffect, useRef } from 'react';

export default function CandidateCard({ candidate, socket }) {
  const { id, name, party, votes, clicks, trends, news, social } = candidate;
  const [hasVoted, setHasVoted] = useState(false);
  const [clickActive, setClickActive] = useState(false);
  const timers = useRef([]);

  useEffect(() => {
    const schedule = () => {
      const wait = Math.random()*10000 + 10000; // 10-20s
      const t1 = setTimeout(() => {
        setClickActive(true);
        const t2 = setTimeout(() => {
          setClickActive(false);
          schedule();
        }, 2500);
        timers.current.push(t2);
      }, wait);
      timers.current.push(t1);
    };
    schedule();
    return () => timers.current.forEach(clearTimeout);
  }, []);

  const vote = () => {
    if (hasVoted) return;
    socket.emit('vote', { candidateId: id });
    setHasVoted(true);
    setTimeout(() => setHasVoted(false), 24*60*60*1000);
  };

  const click = () => {
    if (!clickActive) return;
    socket.emit('click', { candidateId: id });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col">
      <h2 className="text-xl font-semibold mb-2">{name} <span className="text-sm text-gray-600">({party})</span></h2>
      <p className="mb-1">Votes: <span className="font-bold">{votes}</span></p>
      <p className="mb-1">Clicks: <span className="font-bold">{clicks}</span></p>
      <p className="mb-1">Search Interest: <span className="font-bold">{trends}</span></p>
      <p className="mb-1">News (24h): <span className="font-bold">{news}</span></p>
      <p className="mb-2">Social (24h): <span className="font-bold">{social}</span></p>

      <button onClick={vote} disabled={hasVoted}
        className={"px-4 py-2 rounded text-white mb-2 " + (hasVoted ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700")}>
        {hasVoted ? "Voted ✓" : "Vote Today"}
      </button>

      <button onClick={click} disabled={!clickActive}
        className={"px-4 py-2 rounded text-white " + (clickActive ? "bg-orange-600 hover:bg-orange-700 animate-pulse" : "bg-orange-300 cursor-not-allowed")}>
        Click!
      </button>
    </div>
  );
}
