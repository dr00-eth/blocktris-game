import React from 'react';

const ScoreBoard = ({ score, linesCleared, level, gameOver }) => {
  return (
    <div className="score-board bg-gray-800 p-4 rounded-md">
      <h3 className="text-lg font-medium mb-3 text-center">Stats</h3>
      
      <div className="grid grid-cols-1 gap-3">
        <div className="stat-item">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Score:</span>
            <span className="text-2xl font-bold text-green-400">{score}</span>
          </div>
          <div className="w-full bg-gray-700 h-1 mt-1"></div>
        </div>
        
        <div className="stat-item">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Level:</span>
            <span className="text-xl font-bold text-yellow-400">{level}</span>
          </div>
          <div className="w-full bg-gray-700 h-1 mt-1"></div>
        </div>
        
        <div className="stat-item">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Lines:</span>
            <span className="text-xl font-bold text-blue-400">{linesCleared}</span>
          </div>
          <div className="w-full bg-gray-700 h-1 mt-1"></div>
        </div>
      </div>
      
      {gameOver && (
        <div className="mt-4 p-3 bg-red-900 bg-opacity-50 rounded-md">
          <h4 className="text-center text-red-400 font-bold">GAME OVER</h4>
          <p className="text-center text-gray-300 text-sm mt-1">
            Final Score: <span className="font-bold text-white">{score}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default ScoreBoard;
