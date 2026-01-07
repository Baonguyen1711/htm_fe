import React, { useEffect, useMemo, useState } from 'react';
import { Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useAppSelector } from '../app/store';
import { useFirebaseListener } from '../shared/hooks';
import { PlayerData } from '../shared/types';
import { useSearchParams } from 'react-router-dom';

export function PlayerAnswers() {
  const { players } = useAppSelector(state => state.game);
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId") || "1";

  const [currentTurn, setCurrentTurn] = useState<number | null>(null);
  const { listenToCurrentTurn, listenToBroadcastedAnswer } = useFirebaseListener();

  /* ---------------- Firebase current turn ---------------- */
  useEffect(() => {
    const unsub = listenToCurrentTurn(turn => {
      setCurrentTurn(Number(turn));
    });
    return () => unsub();
  }, [roomId]);

  useEffect(() => {
    const unsubscribeBroadcastedAnswer = listenToBroadcastedAnswer()

    return () => {
      unsubscribeBroadcastedAnswer();
    };
  }, [roomId]);

  /* ---------------- Normalize players ---------------- */
  const normalizedPlayers = useMemo(() => {
    if (!Array.isArray(players)) return [];

    return players.map((p: PlayerData) => ({
      id: Number(p.stt),
      name: p.userName,
      avatar: p.avatar ? (
        <img src={p.avatar} className="w-full h-full object-cover rounded-full" />
      ) : (
        p.userName?.charAt(0)
      ),
      answer: p.answer,
      timeElapsed: p.time,
      isCorrect: p.isCorrect,
      isCurrentTurn: Number(p.stt) === currentTurn
    }));
  }, [players, currentTurn]);

  const answeredPlayers = normalizedPlayers.filter(p => p.answer);
  const waitingPlayers = normalizedPlayers.filter(p => !p.answer);

  /* ---------------- UI ---------------- */
  return (
    <div className="bg-gradient-to-br from-cyan-800/40 to-blue-900/40 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-3 shadow-2xl h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-cyan-100">Live Player Answers</h2>
        <div className="text-cyan-300 text-xs">
          {answeredPlayers.length} / {normalizedPlayers.length}
        </div>
      </div>

      {/* Players grid */}
      <div className="grid grid-cols-3 gap-2">
        {normalizedPlayers.map(player => {
          const hasAnswered = !!player.answer;

          return (
            <div
              key={player.id}
              className={`relative overflow-hidden rounded-lg border-2 p-2 transition-all duration-300
                ${hasAnswered
                  ? player.isCorrect
                    ? 'bg-green-500/20 border-green-400/60'
                    : 'bg-red-500/20 border-red-400/60'
                  : 'bg-blue-900/30 border-cyan-600/30 animate-pulse-slow'
                }
                ${player.isCurrentTurn ? 'ring-2 ring-yellow-400' : ''}
              `}
            >
              {/* Status icon */}
              <div className="absolute top-1 right-1">
                {hasAnswered && (
                  player.isCorrect ? (
                    <CheckCircle2 className="text-green-400" size={12} />
                  ) : (
                    <XCircle className="text-red-400" size={12} />
                  )
                )}
              </div>

              {/* Player header */}
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs border border-cyan-400/50">
                  {player.avatar}
                </div>
                <div className="text-cyan-50 text-[10px] truncate pr-3">
                  {player.name}
                </div>
              </div>

              {/* Answer */}
              {hasAnswered && (
                <div className="space-y-1">
                  <div className="bg-blue-950/40 border border-cyan-600/20 rounded p-1">
                    <div className="text-cyan-50 text-[9px] truncate">
                      {player.answer}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-cyan-300 text-[9px]">
                    <Clock size={8} />
                    <span>{player.timeElapsed}s</span>
                  </div>
                </div>
              ) }
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {answeredPlayers.length > 0 && (
        <div className="mt-2 pt-2 border-t border-cyan-600/30">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-green-500/10 border border-green-400/30 rounded p-1">
              <div className="text-green-400 text-[9px]">Correct</div>
              <div className="text-green-200">
                {answeredPlayers.filter(p => p.isCorrect).length}
              </div>
            </div>
            <div className="bg-red-500/10 border border-red-400/30 rounded p-1">
              <div className="text-red-400 text-[9px]">Incorrect</div>
              <div className="text-red-200">
                {answeredPlayers.filter(p => !p.isCorrect).length}
              </div>
            </div>
            <div className="bg-cyan-500/10 border border-cyan-400/30 rounded p-1">
              <div className="text-cyan-400 text-[9px]">Waiting</div>
              <div className="text-cyan-200">
                {waitingPlayers.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
