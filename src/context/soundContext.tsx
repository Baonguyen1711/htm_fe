import React, { createContext, useContext, useEffect, useRef } from 'react';

const soundFiles = [
    { key: 'correct', src: '/sounds/VeDichCauDung.mp3' },
    { key: '1', src: '/sounds/NhoNeo_MoDau.mp3' },
    { key: '2', src: '/sounds/VuotSong_MoDau.mp3' },
    { key: '3', src: '/sounds/ButPha_MoDau.mp3' },
    { key: '4', src: '/sounds/ChinhPhuc_MoDau.mp3' },
    { key: 'opening', src: '/sounds/Britains_Brainiest_Theme_Song.mp3' },

    
    
    
    { key: 'timer_1', src: '/sounds/round1/khoidong_10s.mp3' },
    { key: 'timer_2', src: '/sounds/round2/VuotSong_15s.mp3' },
    { key: 'timer_3', src: '/sounds/round3/ButToc_60s.mp3' },
    { key: 'timer_4', src: '/sounds/round4/ChinhPhuc_15s.mp3' },

    { key: 'opening_round1', src: '/sounds/round1/Britains_Brainiest_Theme_Song.mp3' },
    { key: 'buzz_round1', src: '/sounds/round1/bellsound.mp3' },
    { key: 'correct_1', src: '/sounds/round1/VCNV_cau_dung.mp3' },
    { key: 'wrong_1', src: '/sounds/round1/VuotSong_CauSai.mp3' },

    { key: 'opening_round2', src: '/sounds/round2/Britains_Brainiest_Theme_Song.mp3' },
    { key: 'buzz', src: '/sounds/round2/bellsound.mp3' },
    { key: 'correct_2', src: '/sounds/round2/VCNV_cau_dung.mp3' },
    { key: 'wrong_2', src: '/sounds/round2/VuotSong_CauSai.mp3' },

    { key: '5seconds_remain', src: '/sounds/round4/VeDich5sConLai.mp3' },
    { key: 'nshv', src: '/sounds/round4/VeDichNSHV.mp3' },

    { key: 'final', src: '/sounds/score/CongBoDiemSo.mp3' }
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