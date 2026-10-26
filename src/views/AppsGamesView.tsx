import React, { useState, useEffect, useRef } from 'react';
import {
  Gamepad2,
  Play,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Calculator,
  QrCode,
  ArrowRightLeft,
  X,
  Trophy,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Check,
  Download,
} from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../translations';
import { SAMPLE_APPS_GAMES } from '../sampleData';

interface AppsGamesViewProps {
  language: Language;
}

export const AppsGamesView: React.FC<AppsGamesViewProps> = ({ language }) => {
  const t = getTranslation(language);

  const [activeTab, setActiveTab] = useState<'games' | 'utilities' | 'apps'>('games');
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  // ================= 2048 GAME LOGIC =================
  const [board2048, setBoard2048] = useState<number[][]>([]);
  const [score2048, setScore2048] = useState(0);
  const [best2048, setBest2048] = useState(1024);

  const init2048 = () => {
    let newBoard = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    setBoard2048(newBoard);
    setScore2048(0);
  };

  const addRandomTile = (board: number[][]) => {
    const emptyCells: { r: number; c: number }[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return;
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    board[randomCell.r][randomCell.c] = Math.random() < 0.9 ? 2 : 4;
  };

  const move2048 = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (board2048.length === 0) return;
    let board = board2048.map((row) => [...row]);
    let pointsAdded = 0;
    let moved = false;

    const slide = (row: number[]) => {
      let arr = row.filter((val) => val !== 0);
      for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1]) {
          arr[i] *= 2;
          pointsAdded += arr[i];
          arr[i + 1] = 0;
        }
      }
      arr = arr.filter((val) => val !== 0);
      while (arr.length < 4) arr.push(0);
      return arr;
    };

    if (direction === 'left') {
      for (let r = 0; r < 4; r++) {
        const newRow = slide(board[r]);
        if (newRow.some((val, idx) => val !== board[r][idx])) moved = true;
        board[r] = newRow;
      }
    } else if (direction === 'right') {
      for (let r = 0; r < 4; r++) {
        const reversed = [...board[r]].reverse();
        const newRow = slide(reversed).reverse();
        if (newRow.some((val, idx) => val !== board[r][idx])) moved = true;
        board[r] = newRow;
      }
    } else if (direction === 'up') {
      for (let c = 0; c < 4; c++) {
        const col = [board[0][c], board[1][c], board[2][c], board[3][c]];
        const newCol = slide(col);
        for (let r = 0; r < 4; r++) {
          if (board[r][c] !== newCol[r]) moved = true;
          board[r][c] = newCol[r];
        }
      }
    } else if (direction === 'down') {
      for (let c = 0; c < 4; c++) {
        const col = [board[3][c], board[2][c], board[1][c], board[0][c]];
        const newCol = slide(col);
        for (let r = 0; r < 4; r++) {
          if (board[3 - r][c] !== newCol[r]) moved = true;
          board[3 - r][c] = newCol[r];
        }
      }
    }

    if (moved) {
      addRandomTile(board);
      setBoard2048(board);
      setScore2048((prev) => {
        const newScore = prev + pointsAdded;
        if (newScore > best2048) setBest2048(newScore);
        return newScore;
      });
    }
  };

  useEffect(() => {
    if (selectedGame === 'game-2048') {
      init2048();
    }
  }, [selectedGame]);

  // ================= RETRO SNAKE GAME LOGIC =================
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ]);
  const [food, setFood] = useState<{ x: number; y: number }>({ x: 5, y: 5 });
  const [snakeDir, setSnakeDir] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('UP');
  const [snakeScore, setSnakeScore] = useState(0);
  const [snakeGameOver, setSnakeGameOver] = useState(false);
  const snakeIntervalRef = useRef<any>(null);

  const initSnake = () => {
    setSnake([
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ]);
    setFood({ x: Math.floor(Math.random() * 18) + 1, y: Math.floor(Math.random() * 18) + 1 });
    setSnakeDir('UP');
    setSnakeScore(0);
    setSnakeGameOver(false);
  };

  useEffect(() => {
    if (selectedGame !== 'game-snake' || snakeGameOver) return;

    snakeIntervalRef.current = setInterval(() => {
      setSnake((prevSnake) => {
        const head = { ...prevSnake[0] };
        if (snakeDir === 'UP') head.y -= 1;
        if (snakeDir === 'DOWN') head.y += 1;
        if (snakeDir === 'LEFT') head.x -= 1;
        if (snakeDir === 'RIGHT') head.x += 1;

        // Collision with walls (20x20 grid)
        if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
          setSnakeGameOver(true);
          return prevSnake;
        }

        // Collision with self
        if (prevSnake.some((segment) => segment.x === head.x && segment.y === head.y)) {
          setSnakeGameOver(true);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];
        if (head.x === food.x && head.y === food.y) {
          setSnakeScore((s) => s + 10);
          setFood({
            x: Math.floor(Math.random() * 18) + 1,
            y: Math.floor(Math.random() * 18) + 1,
          });
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, 130);

    return () => clearInterval(snakeIntervalRef.current);
  }, [selectedGame, snakeDir, snakeGameOver, food]);

  // ================= CALCULATOR LOGIC =================
  const [calcInput, setCalcInput] = useState('');
  const [calcResult, setCalcResult] = useState('');

  const handleCalcPress = (val: string) => {
    if (val === 'C') {
      setCalcInput('');
      setCalcResult('');
    } else if (val === '=') {
      try {
        // Safe evaluation
        const clean = calcInput.replace(/×/g, '*').replace(/÷/g, '/');
        // Only allow math chars
        if (/^[0-9+\-*/().%\s]+$/.test(clean)) {
          const res = Function(`"use strict"; return (${clean})`)();
          setCalcResult(String(res));
        } else {
          setCalcResult('Error');
        }
      } catch {
        setCalcResult('Error');
      }
    } else {
      setCalcInput((prev) => prev + val);
    }
  };

  // ================= QR CODE GENERATOR =================
  const [qrText, setQrText] = useState('https://tamimmate.app');
  const [qrGenerated, setQrGenerated] = useState(false);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-red-500" />
            {t.apps.title}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">{t.apps.subtitle}</p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-neutral-900 border border-neutral-800">
          <button
            onClick={() => setActiveTab('games')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'games'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Playable Games
          </button>
          <button
            onClick={() => setActiveTab('utilities')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'utilities'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Productivity Tools
          </button>
          <button
            onClick={() => setActiveTab('apps')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'apps'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            FOSS Software
          </button>
        </div>
      </div>

      {/* GAMES SECTION */}
      {activeTab === 'games' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SAMPLE_APPS_GAMES.filter((item) => item.type === 'game').map((game) => (
            <div
              key={game.id}
              className="rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 p-4 flex flex-col justify-between transition-all hover:shadow-xl"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-neutral-800 mb-3 border border-neutral-700">
                  <img src={game.iconUrl} alt={game.title} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-sm font-bold text-white">{game.title}</h3>
                <span className="text-[10px] text-red-400 font-semibold">{game.category}</span>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">{game.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400">★ {game.rating}</span>
                <button
                  onClick={() => setSelectedGame(game.id)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-900/30"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Play Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UTILITIES SECTION */}
      {activeTab === 'utilities' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SAMPLE_APPS_GAMES.filter((item) => item.type === 'utility').map((tool) => (
            <div
              key={tool.id}
              className="rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 p-5 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-500 flex items-center justify-center mb-3">
                  {tool.id === 'tool-calc' ? (
                    <Calculator className="w-6 h-6" />
                  ) : tool.id === 'tool-qr' ? (
                    <QrCode className="w-6 h-6" />
                  ) : (
                    <ArrowRightLeft className="w-6 h-6" />
                  )}
                </div>
                <h3 className="text-base font-bold text-white">{tool.title}</h3>
                <p className="text-xs text-neutral-400 mt-1">{tool.description}</p>
              </div>

              <button
                onClick={() => setSelectedTool(tool.id)}
                className="mt-6 w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition-colors"
              >
                Launch Utility
              </button>
            </div>
          ))}
        </div>
      )}

      {/* FOSS SOFTWARE DIRECTORY */}
      {activeTab === 'apps' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex items-center gap-3 text-xs text-neutral-300">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{t.apps.disclaimer}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {SAMPLE_APPS_GAMES.filter((item) => item.type === 'app').map((app) => (
              <div
                key={app.id}
                className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-neutral-800 mb-3 border border-neutral-700">
                    <img src={app.iconUrl} alt={app.title} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-sm font-bold text-white">{app.title}</h4>
                  <span className="text-[10px] text-red-400">{app.category}</span>
                  <p className="text-xs text-neutral-400 mt-2">{app.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500">{app.developer}</span>
                  <a
                    href={app.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs flex items-center gap-1 font-semibold"
                  >
                    <span>Official Mirror</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 2048 GAME MODAL ================= */}
      {selectedGame === 'game-2048' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-700 p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  2048 Arcade
                </h3>
                <p className="text-xs text-neutral-400">Join the numbers to get to 2048!</p>
              </div>
              <button
                onClick={() => setSelectedGame(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score Cards */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex-1 p-2 rounded-xl bg-neutral-800 text-center">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">Score</span>
                <p className="text-base font-extrabold text-white">{score2048}</p>
              </div>
              <div className="flex-1 p-2 rounded-xl bg-neutral-800 text-center">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">Best</span>
                <p className="text-base font-extrabold text-amber-400">{best2048}</p>
              </div>
              <button
                onClick={init2048}
                className="p-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white"
                title="Restart"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* 4x4 Board */}
            <div className="grid grid-cols-4 gap-2 p-3 bg-neutral-950 rounded-2xl border border-neutral-800 aspect-square">
              {board2048.flat().map((val, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-center rounded-xl font-extrabold text-sm sm:text-base transition-all select-none ${
                    val === 0
                      ? 'bg-neutral-900 text-transparent'
                      : val === 2
                      ? 'bg-neutral-800 text-white'
                      : val === 4
                      ? 'bg-neutral-700 text-white'
                      : val === 8
                      ? 'bg-amber-600 text-white'
                      : val === 16
                      ? 'bg-orange-600 text-white'
                      : val === 32
                      ? 'bg-red-600 text-white'
                      : val >= 64
                      ? 'bg-red-500 text-white shadow-lg shadow-red-600/50 scale-105'
                      : 'bg-yellow-500 text-black'
                  }`}
                >
                  {val > 0 ? val : ''}
                </div>
              ))}
            </div>

            {/* On-screen Controls for Mobile */}
            <div className="grid grid-cols-3 gap-2 mt-4 max-w-[200px] mx-auto">
              <div />
              <button
                onClick={() => move2048('up')}
                className="p-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <div />
              <button
                onClick={() => move2048('left')}
                className="p-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => move2048('down')}
                className="p-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => move2048('right')}
                className="p-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= RETRO SNAKE MODAL ================= */}
      {selectedGame === 'game-snake' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-700 p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Retro Snake Classic</h3>
                <span className="text-xs text-amber-400 font-mono">Score: {snakeScore}</span>
              </div>
              <button
                onClick={() => setSelectedGame(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Snake Canvas Grid (20x20) */}
            <div className="relative aspect-square w-full bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden">
              {/* Snake body */}
              {snake.map((seg, i) => (
                <div
                  key={i}
                  style={{
                    left: `${(seg.x / 20) * 100}%`,
                    top: `${(seg.y / 20) * 100}%`,
                    width: '5%',
                    height: '5%',
                  }}
                  className={`absolute rounded-sm ${i === 0 ? 'bg-red-500 z-10' : 'bg-red-600/80'}`}
                />
              ))}

              {/* Food */}
              <div
                style={{
                  left: `${(food.x / 20) * 100}%`,
                  top: `${(food.y / 20) * 100}%`,
                  width: '5%',
                  height: '5%',
                }}
                className="absolute bg-emerald-400 rounded-full animate-ping"
              />
              <div
                style={{
                  left: `${(food.x / 20) * 100}%`,
                  top: `${(food.y / 20) * 100}%`,
                  width: '5%',
                  height: '5%',
                }}
                className="absolute bg-emerald-500 rounded-full"
              />

              {snakeGameOver && (
                <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-4">
                  <h4 className="text-lg font-extrabold text-red-500 mb-1">Game Over!</h4>
                  <p className="text-xs text-neutral-300 mb-3 font-mono">Final Score: {snakeScore}</p>
                  <button
                    onClick={initSnake}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Play Again
                  </button>
                </div>
              )}
            </div>

            {/* D-Pad controls */}
            <div className="grid grid-cols-3 gap-2 mt-4 max-w-[180px] mx-auto">
              <div />
              <button
                onClick={() => snakeDir !== 'DOWN' && setSnakeDir('UP')}
                className="p-3 rounded-xl bg-neutral-800 text-white flex items-center justify-center"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <div />
              <button
                onClick={() => snakeDir !== 'RIGHT' && setSnakeDir('LEFT')}
                className="p-3 rounded-xl bg-neutral-800 text-white flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => snakeDir !== 'UP' && setSnakeDir('DOWN')}
                className="p-3 rounded-xl bg-neutral-800 text-white flex items-center justify-center"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => snakeDir !== 'LEFT' && setSnakeDir('RIGHT')}
                className="p-3 rounded-xl bg-neutral-800 text-white flex items-center justify-center"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= CALCULATOR MODAL ================= */}
      {selectedTool === 'tool-calc' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-700 p-5 shadow-2xl text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-red-500" />
                Calculator
              </h3>
              <button
                onClick={() => setSelectedTool(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Display */}
            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 text-right mb-4 min-h-[70px] flex flex-col justify-end">
              <span className="text-xs text-neutral-400 font-mono truncate">{calcInput || '0'}</span>
              <span className="text-2xl font-extrabold text-white font-mono truncate">
                {calcResult || '= ' + (calcInput || '0')}
              </span>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-4 gap-2">
              {['C', '(', ')', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '%', '='].map((k) => (
                <button
                  key={k}
                  onClick={() => handleCalcPress(k)}
                  className={`py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                    k === '='
                      ? 'bg-red-600 text-white col-span-1 shadow-md'
                      : k === 'C'
                      ? 'bg-neutral-800 text-red-400'
                      : ['÷', '×', '-', '+'].includes(k)
                      ? 'bg-neutral-800 text-amber-400'
                      : 'bg-neutral-850 hover:bg-neutral-800 text-white'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= QR CODE GENERATOR MODAL ================= */}
      {selectedTool === 'tool-qr' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-700 p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-red-500" />
                QR Code Generator
              </h3>
              <button
                onClick={() => setSelectedTool(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={qrText}
                onChange={(e) => setQrText(e.target.value)}
                placeholder="Enter URL or text to encode..."
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
              />

              {/* QR Image Representation via API */}
              <div className="p-4 bg-white rounded-2xl flex items-center justify-center mx-auto aspect-square max-w-[200px]">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrText || 'Tamimmate')}`}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrText || 'Tamimmate')}`}
                download="tamimmate-qrcode.png"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                Download PNG
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
