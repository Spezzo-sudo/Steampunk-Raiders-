import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { View } from '@/types';

interface NavLinkProps {
  view: View;
  label: string;
  icon: string; // Emoji wird als Platzhalter für Icons verwendet
}

/**
 * Die linke Navigationsleiste.
 * Ermöglicht dem Spieler, zwischen den verschiedenen Ansichten des Spiels zu wechseln.
 */
const LeftNav: React.FC = () => {
  const activeView = useGameStore((state) => state.activeView);
  const setView = useGameStore((state) => state.setView);

  const navLinks: NavLinkProps[] = [
    { view: View.Uebersicht, label: 'Übersicht', icon: '🪐' },
    { view: View.Gebaeude, label: 'Gebäude', icon: '🏭' },
    { view: View.Forschung, label: 'Forschung', icon: '🔬' },
    { view: View.Werft, label: 'Werft', icon: '🚀' },
    { view: View.Galaxie, label: 'Galaxie', icon: '🌌' },
  ];

  return (
    <nav className="w-64 h-full steampunk-glass-dark p-4 flex flex-col shrink-0">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-cinzel text-yellow-400">CHRONOS</h1>
            <p className="text-xs text-yellow-600">Industries</p>
        </div>
        <ul className="space-y-2">
            {navLinks.map(({ view, label, icon }) => (
            <li key={view}>
                <button
                    onClick={() => setView(view)}
                    className={`w-full flex items-center p-3 rounded-md text-left transition-colors duration-200 font-cinzel ${
                        activeView === view
                        ? 'bg-yellow-800/50 text-yellow-300'
                        : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                    }`}
                >
                    <span className="mr-3 text-xl">{icon}</span>
                    {label}
                </button>
            </li>
            ))}
        </ul>
        <div className="mt-auto text-center text-xs text-gray-500">
            <p>Version 0.1.0-mvp</p>
        </div>
    </nav>
  );
};

export default LeftNav;
