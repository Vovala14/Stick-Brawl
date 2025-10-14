import React, { createContext, useContext, useState, ReactNode } from 'react';

type GameState = {
  currentLevel: number;
  unlockedWeapons: string[];
  selectedWeapon: string;
  customization: {
    bodyColor: string;
    armsColor: string;
    legsColor: string;
    headband: boolean;
    longHair: boolean;
  };
  coins: number;
  levelProgress: { [key: number]: { rank: string; time: number; stars: number } };
};

const initialState: GameState = {
  currentLevel: 1,
  unlockedWeapons: ['fists'],
  selectedWeapon: 'fists',
  customization: {
    bodyColor: '#00D4FF',
    armsColor: '#00D4FF',
    legsColor: '#00D4FF',
    headband: false,
    longHair: false,
  },
  coins: 0,
  levelProgress: {},
};

const GameContext = createContext<{
  state: GameState;
  updateCustomization: (key: string, value: any) => void;
  selectWeapon: (weapon: string) => void;
  completeLevel: (level: number, rank: string, time: number, stars: number) => void;
  unlockWeapon: (weapon: string) => void;
}>({
  state: initialState,
  updateCustomization: () => {},
  selectWeapon: () => {},
  completeLevel: () => {},
  unlockWeapon: () => {},
});

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<GameState>(initialState);

  const updateCustomization = (key: string, value: any) => {
    setState(prev => ({
      ...prev,
      customization: { ...prev.customization, [key]: value }
    }));
  };

  const selectWeapon = (weapon: string) => {
    setState(prev => ({ ...prev, selectedWeapon: weapon }));
  };

  const completeLevel = (level: number, rank: string, time: number, stars: number) => {
    setState(prev => ({
      ...prev,
      currentLevel: Math.max(prev.currentLevel, level + 1),
      levelProgress: { ...prev.levelProgress, [level]: { rank, time, stars } },
      coins: prev.coins + stars * 10
    }));
  };

  const unlockWeapon = (weapon: string) => {
    setState(prev => ({
      ...prev,
      unlockedWeapons: [...prev.unlockedWeapons, weapon]
    }));
  };

  return (
    <GameContext.Provider value={{ state, updateCustomization, selectWeapon, completeLevel, unlockWeapon }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
