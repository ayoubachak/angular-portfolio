import { Injectable } from '@angular/core';

// Game state type
export type GameStatus = 'playing' | 'won' | 'draw';

// Board state for Q-learning representation
// Board state is represented as a string

// Game state interface
export interface GameState {
  board: string[][];
  currentPlayer: string;
  status: GameStatus;
  winner: string | null;
}

// Q-learning parameters
interface QLearningParams {
  learningRate: number;  // Alpha: how much to update Q-values (0-1)
  discountFactor: number; // Gamma: importance of future rewards (0-1)
  explorationRate: number; // Epsilon: probability of random exploration (0-1)
}

@Injectable({
  providedIn: 'root'
})
export class TicTacToeService {
  // Game state
  private _gameState!: GameState;
    // Q-Learning related
  private readonly qTable: Map<string, Map<number, number>> = new Map(); // State -> (Action -> Value)  
  private readonly learningParams: QLearningParams = {
    learningRate: 0.3,
    discountFactor: 0.9,
    explorationRate: 0.2
  };
  private learningEnabled: boolean = true;
  private gamesPlayed: number = 0;
  private botWins: number = 0;
  private playerWins: number = 0;
  private draws: number = 0;
  private lastState: string = '';
  private lastAction: number = -1;
  
  constructor() {
    this.initGame();
  }
  
  // Initialize a new game
  initGame(): void {
    this._gameState = {
      board: Array(3).fill(null).map(() => Array(3).fill('')),
      currentPlayer: 'X', // Player is X, Bot is O
      status: 'playing',
      winner: null
    };
  }
  
  // Get current game state
  get gameState(): GameState {
    return { ...this._gameState };
  }

  // Get learning statistics
  get stats() {
    return {
      gamesPlayed: this.gamesPlayed,
      botWins: this.botWins,
      playerWins: this.playerWins,
      draws: this.draws,
      qTableSize: this.qTable.size,
      explorationRate: this.learningParams.explorationRate
    };
  }
  
  // Make a player move
  makePlayerMove(row: number, col: number): boolean {
    if (this._gameState.status !== 'playing' || 
        this._gameState.board[row][col] !== '') {
      return false;
    }
    
    // Make move
    this._gameState.board[row][col] = this._gameState.currentPlayer;
    
    // Check game status
    this.checkGameStatus();
    
    // Switch player if game is still on
    if (this._gameState.status === 'playing') {
      this._gameState.currentPlayer = 'O';
    } else {
      this.updateLearningStats();
    }
    
    return true;
  }
  
  // Make the bot move using Q-learning
  makeBotMove(): void {
    if (this._gameState.status !== 'playing' || 
        this._gameState.currentPlayer !== 'O') {
      return;
    }
    
    const state = this.getBoardStateString();
    this.lastState = state; // Remember the state for learning
      // Find available actions (empty cells)
    const availableActions = this.getAvailableActions();
    
    // Initialize action variable
    let action;
    
    // Q-learning action selection (epsilon-greedy)
    if (this.learningEnabled && Math.random() < this.learningParams.explorationRate) {
      // Exploration: choose random move
      const randomIndex = Math.floor(Math.random() * availableActions.length);
      action = availableActions[randomIndex];
    } else {
      // Exploitation: choose best move according to Q-values
      action = this.getBestAction(state, availableActions);
    }
    
    // Save the action for learning update
    this.lastAction = action;
    
    // Convert action index to board position
    const row = Math.floor(action / 3);
    const col = action % 3;
    
    // Make the move
    this._gameState.board[row][col] = 'O';
    
    // Check if game ended
    this.checkGameStatus();
    
    // Switch back to player if game continues
    if (this._gameState.status === 'playing') {
      this._gameState.currentPlayer = 'X';
    } else {
      this.updateLearningStats();
      
      // Update Q-values with the final reward
      if (this.learningEnabled && this.lastAction >= 0) {
        const reward = this.getRewardForCurrentState();
        this.updateQValue(this.lastState, this.lastAction, reward, '');
      }
    }
  }
  
  // Get reward for the current state
  private getRewardForCurrentState(): number {
    switch(this._gameState.status) {
      case 'won':
        return this._gameState.winner === 'O' ? 1.0 : -1.0;
      case 'draw':
        return 0.2; // Small positive reward for draw
      default:
        return 0; // No reward during gameplay
    }
  }
  
  // Update the Q-value after an action
  private updateQValue(state: string, action: number, reward: number, nextState: string): void {
    if (!this.qTable.has(state)) {
      this.qTable.set(state, new Map());
    }
    
    const stateQValues = this.qTable.get(state)!;
    const oldValue = stateQValues.get(action) ?? 0;
    
    let maxNextQ = 0;
    if (nextState) {
      maxNextQ = this.getMaxQValue(nextState);
    }
    
    // Q(s,a) = Q(s,a) + α * (r + γ * max(Q(s',a')) - Q(s,a))
    const newValue = oldValue + this.learningParams.learningRate * 
      (reward + this.learningParams.discountFactor * maxNextQ - oldValue);
    
    stateQValues.set(action, newValue);
  }
  
  // Get the maximum Q-value for a state
  private getMaxQValue(state: string): number {
    if (!this.qTable.has(state)) return 0;
    
    const qValues = Array.from(this.qTable.get(state)!.values());
    return qValues.length > 0 ? Math.max(...qValues) : 0;
  }
  
  // Get the best action based on Q-values
  private getBestAction(state: string, availableActions: number[]): number {
    if (!this.qTable.has(state)) {
      // If state not in Q-table, choose randomly
      const randomIndex = Math.floor(Math.random() * availableActions.length);
      return availableActions[randomIndex];
    }
    
    const stateQValues = this.qTable.get(state)!;
    
    // Initialize with first available action
    let bestAction = availableActions[0];
    let bestValue = stateQValues.get(bestAction) ?? 0;
    
    // Find best action
    for (const action of availableActions) {
      const value = stateQValues.get(action) ?? 0;
      if (value > bestValue) {
        bestValue = value;
        bestAction = action;
      }
    }
    
    // If all actions have the same value, choose randomly
    if (availableActions.every(a => (stateQValues.get(a) ?? 0) === bestValue)) {
      const randomIndex = Math.floor(Math.random() * availableActions.length);
      return availableActions[randomIndex];
    }
    
    return bestAction;
  }
  
  // Get a string representation of the board state
  private getBoardStateString(): string {
    return this._gameState.board.flat().map(cell => {
      if (cell === '') return '-';
      return cell;
    }).join('');
  }
  
  // Get indices of empty cells as available actions
  private getAvailableActions(): number[] {
    const actions: number[] = [];
    
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (this._gameState.board[row][col] === '') {
          actions.push(row * 3 + col); // Convert to 1D index
        }
      }
    }
    
    return actions;
  }
    // Check if the game has ended
  private checkGameStatus(): void {
    // Check for win
    if (this.checkWin()) {
      this._gameState.status = 'won';
      this._gameState.winner = this._gameState.currentPlayer;
    }
    // Check for draw
    else if (this.checkDraw()) {
      this._gameState.status = 'draw';
    }
  }
  
  // Update learning statistics after a game
  private updateLearningStats(): void {
    this.gamesPlayed++;
    
    if (this._gameState.status === 'won') {
      if (this._gameState.winner === 'X') {
        this.playerWins++;
      } else {
        this.botWins++;
      }
    } else if (this._gameState.status === 'draw') {
      this.draws++;
    }
    
    // Decrease exploration rate over time (annealing)
    if (this.gamesPlayed % 10 === 0 && this.learningParams.explorationRate > 0.1) {
      this.learningParams.explorationRate *= 0.95;
    }
  }
  
  // Check for a win
  private checkWin(): boolean {
    const b = this._gameState.board;
    const lines = [
      [b[0][0],b[0][1],b[0][2]], // rows
      [b[1][0],b[1][1],b[1][2]],
      [b[2][0],b[2][1],b[2][2]],
      [b[0][0],b[1][0],b[2][0]], // columns
      [b[0][1],b[1][1],b[2][1]],
      [b[0][2],b[1][2],b[2][2]],
      [b[0][0],b[1][1],b[2][2]], // diagonals
      [b[0][2],b[1][1],b[2][0]],
    ];
    
    return lines.some(line => 
      line[0] !== '' && line.every(cell => cell === line[0])
    );
  }
  
  // Check for a draw
  private checkDraw(): boolean {
    return this._gameState.board.flat().every(cell => cell !== '');
  }
  
  // Toggle learning mode
  toggleLearning(enabled: boolean): void {
    this.learningEnabled = enabled;
  }
  
  // Reset game
  resetGame(): void {
    this.initGame();
  }
  
  // Reset all stats and learning data
  resetLearning(): void {
    this.qTable.clear();
    this.gamesPlayed = 0;
    this.playerWins = 0;
    this.botWins = 0;
    this.draws = 0;
    this.learningParams.explorationRate = 0.2;
  }
}
