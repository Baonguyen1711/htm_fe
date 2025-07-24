// Migration utilities for backward compatibility during Phase 3
import { store } from '../../app/store';
import { setPlayers, setCurrentQuestion, setScores } from '../../app/store/slices/gameSlice';
import { setCurrentRoom } from '../../app/store/slices/roomSlice';
import { PlayerData, Question, Score, Room } from '../types';

/**
 * Legacy context data converter
 * Converts old context data to Redux actions
 */
export class MigrationHelper {
  /**
   * Sync player data from legacy context to Redux
   */
  static syncPlayersToRedux(players: PlayerData[]): void {
    store.dispatch(setPlayers(players));
  }

  /**
   * Sync current question from legacy context to Redux
   */
  static syncQuestionToRedux(question: Question | null): void {
    store.dispatch(setCurrentQuestion(question));
  }

  /**
   * Sync scores from legacy context to Redux
   */
  static syncScoresToRedux(scores: Score[]): void {
    store.dispatch(setScores(scores));
  }

  /**
   * Sync room data from legacy context to Redux
   */
  static syncRoomToRedux(room: Room | null): void {
    store.dispatch(setCurrentRoom(room));
  }

  /**
   * Get current Redux state for legacy components
   */
  static getReduxState() {
    const state = store.getState();
    return {
      auth: state.auth,
      game: state.game,
      room: state.room,
      ui: state.ui,
    };
  }

  /**
   * Convert legacy player data format to new format
   */
  static convertLegacyPlayerData(legacyPlayer: any): PlayerData {
    return {
      id: legacyPlayer.uid || legacyPlayer.id,
      uid: legacyPlayer.uid,
      userName: legacyPlayer.userName || legacyPlayer.name,
      email: legacyPlayer.email,
      avatar: legacyPlayer.avatar || '',
      stt: legacyPlayer.stt || '1',
      lastActive: legacyPlayer.lastActive || Date.now(),
      isOnline: legacyPlayer.isOnline ?? true,
      answer: legacyPlayer.answer || '',
      score: legacyPlayer.score || 0,
      roundScores: legacyPlayer.roundScores || [null, 0, 0, 0, 0],
      time: legacyPlayer.time || 0,
      isCorrect: legacyPlayer.isCorrect || false,
      wasDeductedThisRound: legacyPlayer.wasDeductedThisRound || false,
      row: legacyPlayer.row || '',
      isObstacle: legacyPlayer.isObstacle || false,
    };
  }

  /**
   * Convert legacy question data format to new format
   */
  static convertLegacyQuestionData(legacyQuestion: any): Question {
    return {
      id: legacyQuestion.id || legacyQuestion.questionId || '',
      questionId: legacyQuestion.questionId,
      question: legacyQuestion.question || legacyQuestion.content || '',
      answer: legacyQuestion.answer || '',
      type: legacyQuestion.type,
      imgUrl: legacyQuestion.imgUrl || legacyQuestion.imageUrl,
      difficulty: legacyQuestion.difficulty || 'easy',
      round: legacyQuestion.round || 1,
      stt: legacyQuestion.stt,
      packetName: legacyQuestion.packetName,
      testId: legacyQuestion.testId,
    };
  }

  /**
   * Convert legacy score data format to new format
   */
  static convertLegacyScoreData(legacyScore: any): Score {
    return {
      playerName: legacyScore.playerName || legacyScore.name,
      avatar: legacyScore.avatar || '',
      score: legacyScore.score || 0,
      isCorrect: legacyScore.isCorrect || false,
      isModified: legacyScore.isModified || false,
      stt: legacyScore.stt || '1',
      flashColor: legacyScore.flashColor,
    };
  }

  /**
   * Batch convert and sync legacy data to Redux
   */
  static batchSyncLegacyData(legacyData: {
    players?: any[];
    question?: any;
    scores?: any[];
    room?: any;
  }): void {
    if (legacyData.players) {
      const convertedPlayers = legacyData.players.map(this.convertLegacyPlayerData);
      this.syncPlayersToRedux(convertedPlayers);
    }

    if (legacyData.question) {
      const convertedQuestion = this.convertLegacyQuestionData(legacyData.question);
      this.syncQuestionToRedux(convertedQuestion);
    }

    if (legacyData.scores) {
      const convertedScores = legacyData.scores.map(this.convertLegacyScoreData);
      this.syncScoresToRedux(convertedScores);
    }

    if (legacyData.room) {
      this.syncRoomToRedux(legacyData.room);
    }
  }
}

/**
 * Hook for components transitioning from context to Redux
 */
export const useMigrationHelper = () => {
  return {
    syncPlayersToRedux: MigrationHelper.syncPlayersToRedux,
    syncQuestionToRedux: MigrationHelper.syncQuestionToRedux,
    syncScoresToRedux: MigrationHelper.syncScoresToRedux,
    syncRoomToRedux: MigrationHelper.syncRoomToRedux,
    getReduxState: MigrationHelper.getReduxState,
    batchSyncLegacyData: MigrationHelper.batchSyncLegacyData,
  };
};

export default MigrationHelper;
