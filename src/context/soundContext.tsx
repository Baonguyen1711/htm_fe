import React, { createContext, useContext, useEffect, useRef } from 'react';

const soundFiles = [
    { key: 'correct', src: '/sounds/VeDichCauDung.mp3' },
    { key: '1', src: '/sounds/NhoNeo_MoDau.mp3' },
    { key: '2', src: '/sounds/VuotSong_MoDau.mp3' },
    { key: '3', src: '/sounds/ButPha_MoDau.mp3' },
    { key: '4', src: '/sounds/ChinhPhuc_MoDau.mp3' },
    { key: 'opening', src: '/sounds/Britains_Brainiest_Theme_Song.mp3' },

    
    { key: 'timer_3', src: '/sounds/ButToc_60s.mp3' },


    { key: 'timer_2', src: '/sounds/round2/VuotSong_15s.mp3' },
    { key: 'buzz', src: '/sounds/round2/bellsound.mp3' },
    { key: 'correct_2', src: '/sounds/round2/VCNV_cau_dung.mp3' },
    { key: 'wrong_2', src: '/sounds/round2/VuotSong_CauSai.mp3' },
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