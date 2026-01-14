// Game API service
import { api } from '../api/client';
import { API_ENDPOINTS } from '../../constants';
import {
  GetQuestionsRequest,
  GetQuestionsResponse,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  ScoringRequest,
  ScoringResponse,
  SendGridRequest,
  SendGridResponse,
  SetPlayerColorRequest,
  SetPlayerColorResponse,
  Question,
  Score,
  ScoreRule,
  Statistic,
  GameState,
  MultiplayerGameState
} from '../../types';
import { data } from 'react-router-dom';
import roomApi from '../room/roomApi';


export const gameApi = {
  /**
   * Get questions for a specific round
   */
  async getQuestions(params: GetQuestionsRequest): Promise<Question> {
    const response = await api.get<Question>(API_ENDPOINTS.GAME.QUESTION, {
      params: {
        room_id: params.roomId,
        test_name: params.testName,
        round: params.round,
        question_number: params.questionNumber,
        packet_name: params?.packetName,
        difficulty: params?.difficulty,
      },
    });

    console.log("getQuestions response", response)
    console.log("getQuestions data", response.data)
    return response.data;
  },

  /**
   * Auto get next question
   */
  async getNextQuestions(params: GetQuestionsRequest): Promise<Question> {
    const response = await api.get<Question>(API_ENDPOINTS.GAME.NEXT_QUESTION, {
      params: {
        room_id: params.roomId,
        test_name: params.testName,
        round: params.round,
        question_number: params.questionNumber,
        packet_name: params?.packetName,
        difficulty: params?.difficulty,
      },
    });

    console.log("getQuestions response", response)
    console.log("getQuestions data", response.data)
    return response.data;
  },

  /**
  * Auto get next question
  */
  async updateGameState(roomId: string, state: Partial<MultiplayerGameState>): Promise<Question> {
    const response = await api.post(
      `${API_ENDPOINTS.STATE.UPDATE}?room_id=${roomId}`,
      state
    );

    console.log("updateGameState response", response)
    console.log("updateGameState data", response.data)
    return response.data;
  },

  /**
   * Get questions by round
   */
  async getQuestionsByRound(params: GetQuestionsRequest): Promise<Question[]> {
    const response = await api.get<Question[]>(API_ENDPOINTS.GAME.QUESTION_BY_ROUND, {
      params: {
        test_name: params.testName,
        round: params.round,
        packet_name: params?.packetName,
        difficulty: params?.difficulty,
      },
    });
    return response.data
  },

  /**
   * Get prefetch question
   */
  async getPrefetchQuestion(params: { testName: string; round: number; questionNumber: number }): Promise<Question> {
    const response = await api.get<Question>(API_ENDPOINTS.GAME.PREFETCH, {
      params: {
        test_name: params.testName,
        round: params.round,
        question_number: params.questionNumber,
      },
    });
    return response.data;
  },

  /**
   * Send grid to players
   */
  async sendCorrectAnswer(params: { roomId: string }): Promise<void> {
    const response = await api.post(
      `${API_ENDPOINTS.GAME.CORRECT_ANSWER}?room_id=${params.roomId}`
    );

    return response.data;
  },

  /**
   * Get packet names
   */
  async getPacketNames(testName: string, roomId: string): Promise<string[]> {
    const response = await api.get<string[]>(API_ENDPOINTS.GAME.PACKETS, {
      params: { test_name: testName, room_id: roomId },
    });
    return response.data;
  },

  /**
   * Send grid to players
   */
  async sendGrid(roomId: string, grid: string[][], marked_characters_index: string): Promise<boolean> {
    const url = new URL(`${process.env.REACT_APP_BASE_URL}${API_ENDPOINTS.GAME.GRID}`);
    url.searchParams.append("room_id", roomId)
    if (marked_characters_index) url.searchParams.append("marked_characters_index", marked_characters_index)
    const response = await api.post(
      url.toString(),
      { grid: grid }
    );
    return response.data;
  },

  /**
   * Open obstacle
   */
  async openObstacle(roomId: string, grid: string[][], obstacle: string) {
    const response = await api.post(
      `${API_ENDPOINTS.GAME.OPEN_OBSTACLE}?room_id=${roomId}`,
      {
        grid: grid,
        obstacle: obstacle
      }
    );
    return response.data;
  },

  /**
   * Send selected cell
   */
  async sendSelectedCell(roomId: string, rowIndex: string, colIndex: string): Promise<boolean> {
    const response = await api.post(
      `${API_ENDPOINTS.GAME.SELECTED_CELL}?room_id=${roomId}&row_index=${rowIndex}&col_index=${colIndex}`,
    );
    return response.data;
  },

  /**
   * Send selected cell
   */
  async sendSelectedCellColor(roomId: string, rowIndex: string, colIndex: string, color: string): Promise<boolean> {
    const response = await api.post(
      `${API_ENDPOINTS.GAME.CELL_COLOR}?room_id=${roomId}&row_index=${rowIndex}&col_index=${colIndex}&color=${color}`,
    );
    return response.data;
  },


  /**
   * Start a new round
   */
  async startRound(params: { roomId: string; round: string; grid?: string[][] }): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.GAME.ROUND_START}?room_id=${params.roomId}&round=${params.round}`,
      { grid: params.grid }
    );
  },

  /**
   * send packet name to player
   */
  async sendPacketsName(params: { roomId: string; packetNames: string[] }): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.GAME.PACKETS_NAME}?room_id=${params.roomId}`,
      params.packetNames
    );
  },

  /**
   * Send a row action
   */
  async sendRowAction(params: { roomId: string, rowNumber: string, action: string, wordLength: number, selectedRowIndex: number, selectedColIndex: number, correctAnswer?: string, markedCharactersIndex?: string, isRow?: boolean }): Promise<void> {
    const url = new URL(`${process.env.REACT_APP_BASE_URL}${API_ENDPOINTS.GAME.ROW_ACTION}`);

    url.searchParams.append("room_id", params.roomId);
    url.searchParams.append("row_number", params.rowNumber);
    url.searchParams.append("action", params.action);
    url.searchParams.append("word_length", params.wordLength.toString());
    url.searchParams.append("selected_row_index", params.selectedRowIndex.toString());
    url.searchParams.append("selected_col_index", params.selectedColIndex.toString());
    if (params.correctAnswer) url.searchParams.append("correct_answer", params.correctAnswer);
    if (params.markedCharactersIndex) url.searchParams.append("marked_characters_index", params.markedCharactersIndex);
    if (params.isRow !== undefined) url.searchParams.append("is_row", params.isRow.toString());

    await api.post(
      url.toString(),
      {

      }
    );
  },

  /**
   * Add round mapping for custom test
   */
  async addRoundMappingForCustomize(params: { roomId: string, round_mapping: number[] }): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.GAME.ROUND_MAPPING}?room_id=${params.roomId}`,
      JSON.stringify(params.round_mapping)
    );
  },

  /**
   * Start a new round
   */
  async startTimer(params: { roomId: string, timeDuration?: number }): Promise<void> {
    const url = new URL(`${process.env.REACT_APP_BASE_URL}${API_ENDPOINTS.GAME.TIME_START}`);
    url.searchParams.append("room_id", params.roomId)
    if (params.timeDuration) url.searchParams.append("time_duration", params.timeDuration.toString())
    await api.post(
      url.toString(),
      {}
    );
  },

  /**
   * Submit player answer
   */
  async submitAnswer(data: SubmitAnswerRequest, room_id: string): Promise<SubmitAnswerResponse> {
    const response = await api.post<any>(
      API_ENDPOINTS.GAME.SUBMIT,
      data,
      {
        params: { room_id: room_id },
      }
    );
    return response.data;
  },



  /**
   * Broadcast player answers
   */
  async broadcastAnswers(roomId: string): Promise<any[]> {
    const response = await api.post<any[]>(
      `${API_ENDPOINTS.GAME.BROADCAST_ANSWER}?room_id=${roomId}`
    );
    return response.data;
  },

  /**
   * Update game scoring
   */
  async updateScoring(params: ScoringRequest): Promise<Score[]> {
    const response = await api.post<Score[]>(
      `${API_ENDPOINTS.GAME.SCORING}?room_id=${params.roomId}`,
      params.scores || [],
      {
        params: {
          mode: params.mode,
          round: params.round,
          stt: params.stt,
          is_obstacle_correct: params.isObstacleCorrect,
          obstacle_point: params.obstaclePoint,
          is_correct: params.isCorrect,
          round_4_mode: params.round4Mode,
          difficulty: params.difficulty,
          is_take_turn_correct: params.isTakeTurnCorrect,
          stt_take_turn: params.sttTakeTurn,
          stt_taken: params.sttTaken,
        }
      }
    );
    return response.data;
  },


  /**
   * Update current turn
   */
  async updateTurn(roomId: string, turn: number): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.GAME.TURN}?room_id=${roomId}&turn=${turn}`
    );
  },

  /**
   * Show game rules
   */
  async showRules(roomId: string, roundNumber: string): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.GAME.RULES_SHOW}?room_id=${roomId}&round_number=${roundNumber}`
    );
  },

  /**
   * Hide game rules
   */
  async hideRules(roomId: string): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.GAME.RULES_HIDE}?room_id=${roomId}`
    );
  },

  /**
   * Set selected packet name
   */
  async sendSelectedPacketName(roomId: string, packetName: string): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.GAME.SELECTED_PACKETS}?room_id=${roomId}&packet_name=${packetName}`
    );
  },

  /**
   * Set selected packet name
   */
  async sendUsedPacketName(roomId: string, usedPackets: string[]): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.GAME.USED_PACKETS}?room_id=${roomId}`,
      usedPackets
    );
  },

  /**
   * Set should return to packet selection
   */
  async sendShouldReturnToPacketSelection(roomId: string, shouldReturn: boolean): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.GAME.RETURN_TO_PACKET_SELECTION}?room_id=${roomId}&should_return=${shouldReturn}`
    );
  },

  /**
   * Set game history
   */
  async setGameHistory(roomId: string): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.GAME.HISTORY}?room_id=${roomId}`
    );
  },

  /**
   * Set game history
   */
  async setScoreRules(roomId: string, scoreRules: ScoreRule): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.GAME.RULES}?room_id=${roomId}`,
      scoreRules
    );
  },

  /**
   * send open buzz signal
   */

  async openBuzz(roomId: string): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.BUZZ.OPEN}?room_id=${roomId}`
    );
  },

  /**
   * send close buzz signal
   */
  async closeBuzz(roomId: string): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.BUZZ.CLOSE}?room_id=${roomId}`
    );
  },

  /**
   * reset buzz 
   */

  async resetBuzz(roomId: string): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.BUZZ.RESET}?room_id=${roomId}`
    );
  },

  /**
   * send star signal
   */

  async setStar(roomId: string, playerName: string): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.STAR.BASE}?room_id=${roomId}`,
      {
        player_name: playerName,
      }
    );
  },

  /**
   * reset star
   */

  async resetStar(roomId: string): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.STAR.RESET}?room_id=${roomId}`
    );
  },

  /**
   * player buzzing first
   */

  async buzzing(roomId: string, playerName: string): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.BUZZ.BASE}?room_id=${roomId}`,
      {
        player_name: playerName,
      }
    );
  },

  /**
   * send current turn to player
   */

  async sendCurrentTurn(roomId: string, turn: number): Promise<void> {
    await api.post(
      `${API_ENDPOINTS.GAME.TURN}?room_id=${roomId}&turn=${turn}`
    );
  },

  /**
   * Set player color for Round 4
   */
  async setPlayerColor(params: { roomId: string; playerStt: string; color: string }) {
    const response = await api.post(
      `${API_ENDPOINTS.GAME.PLAYER_COLOR}?room_id=${params.roomId}&player_stt=${params.playerStt}`,
      { color: params.color }
    );
    return response.data;
  },

  /**
   * Start media
   */
  async startMedia(roomId: string) {
    const response = await api.post(
      `${API_ENDPOINTS.GAME.MEDIA_PLAY}?room_id=${roomId}`
    );
    return response.data;
  },

  /**
   * Stop media
   */
  async stopMedia(roomId: string) {
    const response = await api.post(
      `${API_ENDPOINTS.GAME.MEDIA_STOP}?room_id=${roomId}`
    );
    return response.data;
  },


  /**
   * Start multiplayer game
   */
  async multiplayerStart(roomId: string, testName: string, playMode: string, currentQuestionNumber?: number) {
    console.log("currentQuestionNumber", currentQuestionNumber)
    const params = new URLSearchParams();
    params.append("room_id", roomId);
    params.append("test_name", testName);
    params.append("play_mode", playMode);
    if (currentQuestionNumber) params.append("current_question_number", currentQuestionNumber.toString());
    const response = await api.post(
      `${API_ENDPOINTS.GAME.MULTIPLAYER_START}?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Pause multiplayer game
   */
  async multiplayerPause(roomId: string) {
    const response = await api.post(
      `${API_ENDPOINTS.GAME.MULTIPLAYER_PAUSE}?room_id=${roomId}`
    );
    return response.data;
  },

  /**
   * Pause multiplayer game
   */
  async multiplayerResume(roomId: string, testName: string) {
    const response = await api.post(
      `${API_ENDPOINTS.GAME.MULTIPLAYER_RESUME}?room_id=${roomId}&test_name=${testName}`
    );
    return response.data;
  },

  /**
   * End multiplayer game
   */
  async multiplayerEnd(roomId: string) {
    const response = await api.post(
      `${API_ENDPOINTS.GAME.MULTIPLAYER_END}?room_id=${roomId}`
    );
    return response.data;
  },

  /**
   * Submit multiplayer answer
   */
  async multiplayerSubmit(params: { roomId: string; answer: string; stt: string; time: number; player_name: string; avatar: string, testName: string, groupId?: string }) {
    console.log("multiplayerSubmit params", params)
    const queryParams = new URLSearchParams();
    queryParams.append("room_id", params.roomId);
    queryParams.append("test_name", params.testName)
    if (params.groupId) queryParams.append("group_id", params.groupId);
    const response = await api.post(
      `${API_ENDPOINTS.GAME.MULTIPLAYER_SUBMIT}?${queryParams.toString()}`,
      params
    );
    return response.data;
  },

  /**
   * Invite player to join group in multiplayer game
   */
  async multiplayerInvite(params: { roomId: string; targetPlayerUid: string; playerName: string; groupId?: string }) {
    const inviteParams = new URLSearchParams();
    inviteParams.append("room_id", params.roomId);
    inviteParams.append("target_player_uid", params.targetPlayerUid);
    inviteParams.append("player_name", params.playerName);
    if (params.groupId) inviteParams.append("group_id", params.groupId);
    const response = await api.post(
      `${API_ENDPOINTS.GAME.MULTIPLAYER_INVITE}?${inviteParams.toString()}`
    );
    return response.data;
  }
  ,
  async multiplayerAcceptInvite(params: { roomId: string; groupId: string, inviterUid?: string }) {
    const inviteParams = new URLSearchParams();
    inviteParams.append("room_id", params.roomId);
    inviteParams.append("group_id", params.groupId);
    if (params.inviterUid) inviteParams.append("inviter_uid", params.inviterUid);
    const response = await api.post(
      `${API_ENDPOINTS.GAME.MULTIPLAYER_ACCEPT_INVITE}?${inviteParams.toString()}`
    );
    return response.data;
  },

  /**
   * Add new user statistic
   */
  async addStatistic(testId: string, data: Statistic) {
    const response = await api.post(
      `${API_ENDPOINTS.STATISTICS.ADD}?testId=${testId}`,
      data
    );
    return response.data;
  },

  /**
   * Get all statistic by user
   */
  async getAllStatistic() {
    const response = await api.get(
      `${API_ENDPOINTS.STATISTICS.GET_ALL}`
    );
    return response.data;
  },

  /**
   * Get all statistic by user and test
   */
  async getStatisticByTest(testId: string) {
    const response = await api.get(
      `${API_ENDPOINTS.STATISTICS.GET_BY_TEST}?test_id=${testId}`
    );
    return response.data;
  },

};

export default gameApi;
