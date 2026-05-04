import React, { useState } from 'react';

export default function TicTacToe() {
  const [cells, setCells] = useState<string[]>(Array(9).fill(''));
  const [turn, setTurn] = useState<'X' | 'O'>('X');

  function play(i: number) {
    if (cells[i]) return;
    const next = [...cells];
    next[i] = turn;
    setCells(next);
    setTurn(turn === 'X' ? 'O' : 'X');
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-1 w-48 h-48">
        {cells.map((c, i) => (
          <button
            key={i}
            onClick={() => play(i)}
            className="border-2 border-black flex items-center justify-center text-2xl bg-[#fff]"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
