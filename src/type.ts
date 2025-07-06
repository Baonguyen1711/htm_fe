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
    isCorrect?: string,  // Backend sends "true"/"false" as strings
    playerName: string,
    avatar: string,
    isModified: string,  // Backend sends "true"/"false" as strings
    flashColor?: string
    stt?: string
    [key: string]: any;
}