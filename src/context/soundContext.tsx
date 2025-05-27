import React, { createContext, useContext, useEffect, useRef } from 'react';

const soundFiles = [
    { key: 'correct', src: '/sounds/VeDichCauDung.mp3' },
    { key: '1', src: '/sounds/NhoNeo_MoDau.mp3' },
    { key: '2', src: '/sounds/VuotSong_MoDau.mp3' },
    { key: '3', src: '/sounds/ButPha_MoDau.mp3' },
    { key: '4', src: '/sounds/ChinhPhuc_MoDau.mp3' },
    { key: 'opening', src: '/sounds/Britains_Brainiest_Theme_Song.mp3' },
];

type AudioRefs = Record<string, HTMLAudioElement>;
const SoundContext = createContext<AudioRefs>({});

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const audioRefs = useRef<AudioRefs>({});

    useEffect(() => {
        soundFiles.forEach(({ key, src }) => {
            const audio = new Audio(src);
            audio.preload = 'auto';
            audio.load();
            audioRefs.current[key] = audio;
        });
    }, []);

    return (
        <SoundContext.Provider value={audioRefs.current}>
            {children}
        </SoundContext.Provider>
    );
};

export const useSounds = () => useContext(SoundContext);