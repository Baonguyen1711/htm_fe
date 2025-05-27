export interface RoundBase {
    isHost?: boolean
}

export interface Question {
    questionId?: string,
    question: string;
    answer?: string;
    type?: string;
    imgUrl?: string;
    difficulty?: string
    [key: string]: any; // Để hỗ trợ các trường bổ sung
  }

export interface User {
    userName: string,
    stt: string,
    avatar: string
    answer?: string,
    [key: string]: any;
}

export interface Answer {
    answer: string,
    uid: string,
    stt: string
}

export interface Score {
    score: string,
    isCorrect?: boolean,
    playerName: string,
    avatar: string,
    isModified: boolean,
    flashColor?: string
    stt?: string
    [key: string]: any; 
}