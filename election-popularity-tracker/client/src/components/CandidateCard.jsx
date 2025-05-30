import React from 'react';

const CandidateCard = ({ candidate }) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-4 m-2">
            <h2 className="text-xl font-bold">{candidate.name}</h2>
            <p className="text-gray-700">{candidate.party}</p>
            <div className="mt-2">
                <p className="text-lg">Votes: <span className="font-semibold">{candidate.votes}</span></p>
                <p className="text-lg">Clicks: <span className="font-semibold">{candidate.clicks}</span></p>
                <p className="text-lg">Search Interest: <span className="font-semibold">{candidate.searchInterest}</span></p>
                <p className="text-lg">News Mentions: <span className="font-semibold">{candidate.newsMentions}</span></p>
                <p className="text-lg">Social Mentions: <span className="font-semibold">{candidate.socialMentions}</span></p>
            </div>
        </div>
    );
};

export default CandidateCard;