import { writable } from 'svelte/store';

export interface Card {
	n: boolean;
	s: boolean;
	e: boolean;
	w: boolean;
	name: string;
	deadEnd: boolean;
	valid: boolean;
	destination: boolean;
	score: boolean;
}

export interface Player {
	name: string;
	id: string;
	pickaxe: boolean;
	cart: boolean;
	lamp: boolean;
	hand: Card[];
	role: 'saboteur' | 'miner';
	score: number;
}

export interface GameState {
	grid: (Card | null)[][];
	selectedCard: Card | null;
	currentPlayer: number;
	players: Player[];
	currentRound: number;
	roundWinner: 'miners' | 'saboteurs' | null;
	scoreCardDeck: number[];
}

export const ROUND_COUNT = 3;

// Score card deck configuration
export const SCORE_CARD_TYPES = {
	one: { value: 1, count: 4 },
	two: { value: 2, count: 4 },
	three: { value: 3, count: 4 }
};

// Create and shuffle score card deck
export const createScoreCardDeck = () => {
	const deck: number[] = [];
	Object.entries(SCORE_CARD_TYPES).forEach(([, card]) => {
		for (let i = 0; i < card.count; i++) {
			deck.push(card.value);
		}
	});

	// Shuffle the deck
	for (let i = deck.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[deck[i], deck[j]] = [deck[j], deck[i]];
	}
	return deck;
};

// Helper function to deal score cards to winners
function dealScoreCardsToWinners(
	players: Player[],
	winners: 'miners' | 'saboteurs',
	scoreCardDeck: number[]
): [Player[], number[]] {
	// Get winning players
	const winningPlayers = players.filter(
		(p) =>
			(winners === 'miners' && p.role === 'miner') ||
			(winners === 'saboteurs' && p.role === 'saboteur')
	);

	if (winningPlayers.length === 0) return [players, scoreCardDeck];

	// Deal a score card to each winner
	const updatedPlayers = players.map((player) => {
		if (winningPlayers.includes(player) && scoreCardDeck.length > 0) {
			const points = scoreCardDeck.shift() || 0;
			return {
				...player,
				score: player.score + points
			};
		}
		return player;
	});

	return [updatedPlayers, scoreCardDeck];
}

export const PLAYER_SETUP = {
	3: {
		saboteur: 1,
		miner: 3
	},
	4: {
		saboteur: 1,
		miner: 4
	},
	5: {
		saboteur: 2,
		miner: 4
	},
	6: {
		saboteur: 2,
		miner: 5
	},
	7: {
		saboteur: 3,
		miner: 5
	},
	8: {
		saboteur: 3,
		miner: 6
	},
	9: {
		saboteur: 3,
		miner: 7
	},
	10: {
		saboteur: 3,
		miner: 8
	}
};

export const STARTING_HAND_SIZE = 5;

export const CARD_COUNT = {
	elbow: 5,
	elbow_reverse: 5,
	t_bottom: 5,
	t_side: 5,
	streight_forward: 5,
	streight_side: 5,
	cross: 5,
	end_bottom: 1,
	end_side: 1,
	end_elbow: 1,
	end_elbow_reverse: 1
};

export const CARD_TYPES: Record<string, Card> = {
	elbow: {
		w: true,
		s: true,
		e: false,
		n: false,
		name: 'elbow',
		deadEnd: false,
		valid: true,
		destination: false,
		score: false
	},
	elbow_reverse: {
		w: false,
		s: false,
		e: true,
		n: true,
		name: 'elbow_reverse',
		deadEnd: false,
		valid: true,
		destination: false,
		score: false
	},
	t_bottom: {
		w: true,
		s: true,
		e: true,
		n: false,
		name: 't_bottom',
		deadEnd: false,
		valid: true,
		destination: false,
		score: false
	},
	t_side: {
		w: false,
		s: true,
		e: true,
		n: true,
		name: 't_side',
		deadEnd: false,
		valid: true,
		destination: false,
		score: false
	},
	streight_forward: {
		w: false,
		s: true,
		e: false,
		n: true,
		name: 'streight_forward',
		deadEnd: false,
		valid: true,
		destination: false,
		score: false
	},
	streight_side: {
		w: true,
		s: false,
		e: true,
		n: false,
		name: 'streight_side',
		deadEnd: false,
		valid: true,
		destination: false,
		score: false
	},
	cross: {
		w: true,
		s: true,
		e: true,
		n: true,
		name: 'cross',
		deadEnd: false,
		valid: true,
		destination: false,
		score: false
	},
	end_bottom: {
		w: false,
		s: true,
		e: false,
		n: false,
		name: 'end_bottom',
		deadEnd: true,
		valid: true,
		destination: false,
		score: false
	},
	end_side: {
		w: true,
		s: false,
		e: false,
		n: false,
		name: 'end_side',
		deadEnd: true,
		valid: true,
		destination: false,
		score: false
	},
	end_elbow: {
		w: true,
		s: true,
		e: false,
		n: false,
		name: 'end_elbow',
		deadEnd: true,
		valid: true,
		destination: false,
		score: false
	},
	end_elbow_reverse: {
		w: false,
		s: true,
		e: true,
		n: false,
		name: 'end_elbow_reverse',
		deadEnd: true,
		valid: true,
		destination: false,
		score: false
	},
	streight_forward_dead: {
		w: false,
		s: true,
		e: false,
		n: true,
		name: 'streight_forward',
		deadEnd: true,
		valid: true,
		destination: false,
		score: false
	},
	streight_side_dead: {
		w: true,
		s: false,
		e: true,
		n: false,
		name: 'streight_side',
		deadEnd: true,
		valid: true,
		destination: false,
		score: false
	},
	t_bottom_dead: {
		w: true,
		s: true,
		e: true,
		n: false,
		name: 't_bottom',
		deadEnd: true,
		valid: true,
		destination: false,
		score: false
	},
	t_side_dead: {
		w: false,
		s: true,
		e: true,
		n: true,
		name: 't_side',
		deadEnd: true,
		valid: true,
		destination: false,
		score: false
	},
	cross_dead: {
		w: true,
		s: true,
		e: true,
		n: true,
		name: 'cross',
		deadEnd: true,
		valid: true,
		destination: false,
		score: false
	},
	gold: {
		n: false,
		s: true,
		e: false,
		w: false,
		name: 'gold',
		deadEnd: true,
		valid: false,
		destination: true,
		score: true
	},
	coal: {
		n: false,
		s: true,
		e: false,
		w: false,
		name: 'coal',
		deadEnd: true,
		valid: false,
		destination: true,
		score: false
	}
};

// Create and shuffle path cards deck
export function createPathCardDeck(): Card[] {
	const deck: Card[] = [];

	// Add each card type according to its count
	Object.entries(CARD_COUNT).forEach(([cardName, count]) => {
		const cardType = CARD_TYPES[cardName];
		if (cardType) {
			for (let i = 0; i < count; i++) {
				deck.push({ ...cardType });
			}
		}
	});

	// Shuffle the deck
	for (let i = deck.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[deck[i], deck[j]] = [deck[j], deck[i]];
	}

	return deck;
}

// Deal cards to players from deck
function dealCardsToPlayers(players: Player[], deck: Card[]): [Player[], Card[]] {
	const updatedPlayers = players.map((player) => ({
		...player,
		hand: [] as Card[] // Clear existing hand and specify type
	}));

	// Deal STARTING_HAND_SIZE cards to each player
	for (let i = 0; i < STARTING_HAND_SIZE; i++) {
		updatedPlayers.forEach((player) => {
			if (deck.length > 0) {
				const card = deck.shift()!;
				player.hand.push(card);
			}
		});
	}

	return [updatedPlayers, deck];
}

// Initial state
const initialGrid = Array(7)
	.fill(null)
	.map(() => Array(7).fill(null));

// Place cross at [6, 3]
const crossCard: Card = {
	n: true,
	s: true,
	e: true,
	w: true,
	name: 'cross',
	deadEnd: false,
	valid: true,
	destination: false,
	score: false
};

// Define goal cards
const goldCard: Card = {
	n: false,
	s: false,
	e: false,
	w: false,
	name: 'gold',
	deadEnd: true,
	valid: true,
	destination: true,
	score: true
};

const coalCard: Card = {
	n: false,
	s: false,
	e: false,
	w: false,
	name: 'coal',
	deadEnd: true,
	valid: true,
	destination: true,
	score: false
};

// Helper function to set up the initial grid
function setupInitialGrid(grid: (Card | null)[][]): void {
	// Place cross at bottom center
	grid[6][3] = { ...crossCard };

	// Randomly place goals
	const positions = [
		[0, 1],
		[0, 3],
		[0, 5]
	];
	const cards = [goldCard, coalCard, coalCard];

	// Fisher-Yates shuffle
	for (let i = cards.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[cards[i], cards[j]] = [cards[j], cards[i]];
	}

	// Place shuffled cards
	positions.forEach((pos, i) => {
		const card = { ...cards[i] };
		// Set south connection for goal cards since they're at the top
		card.s = true;
		grid[pos[0]][pos[1]] = card;
	});
}

// Helper function to assign roles
function assignRoles(playerCount: number): ('saboteur' | 'miner')[] {
	const setup = PLAYER_SETUP[playerCount as keyof typeof PLAYER_SETUP];
	if (!setup) {
		throw new Error(`Invalid player count: ${playerCount}`);
	}

	const roles: ('saboteur' | 'miner')[] = [];
	// Add saboteurs
	for (let i = 0; i < setup.saboteur; i++) {
		roles.push('saboteur');
	}
	// Add miners
	for (let i = 0; i < setup.miner; i++) {
		roles.push('miner');
	}

	// Shuffle the roles array
	for (let i = roles.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[roles[i], roles[j]] = [roles[j], roles[i]];
	}

	return roles;
}

const initialState: GameState = {
	grid: initialGrid,
	selectedCard: null,
	currentPlayer: 1,
	currentRound: 1,
	roundWinner: null,
	players: [
		{
			name: 'Player 1',
			id: '1',
			pickaxe: true,
			cart: true,
			lamp: true,
			hand: [],
			role: 'miner',
			score: 0
		}
	],
	scoreCardDeck: createScoreCardDeck()
};

// Create the store
export const gameState = writable<GameState>(initialState);

// Start a new round
export function startNewRound() {
	gameState.update((state) => {
		// Only proceed if we haven't exceeded ROUND_COUNT
		if (state.currentRound >= ROUND_COUNT) {
			return state;
		}

		// Reset the grid
		const newGrid = Array(7)
			.fill(null)
			.map(() => Array(7).fill(null));
		setupInitialGrid(newGrid);

		// Create fresh path cards deck
		const pathDeck = createPathCardDeck();

		// Reassign roles
		const roles = assignRoles(state.players.length);

		// Update players with new roles and deal fresh hands
		const updatedPlayers = state.players.map((player, index) => ({
			...player,
			role: roles[index],
			hand: [] as Card[] // Clear hand, will be refilled by dealCardsToPlayers
		}));

		const [playersWithHands] = dealCardsToPlayers(updatedPlayers, pathDeck);

		return {
			...state,
			grid: newGrid,
			players: playersWithHands,
			currentRound: state.currentRound + 1,
			roundWinner: null,
			currentPlayer: 1,
			selectedCard: null,
			scoreCardDeck: createScoreCardDeck() // Fresh score card deck each round
		};
	});
}

// Initialize game with players and assign roles
export function initializeGame(playerCount: number) {
	const roles = assignRoles(playerCount);
	const grid = Array(7)
		.fill(null)
		.map(() => Array(7).fill(null));
	setupInitialGrid(grid);

	// Create initial path cards deck
	const pathDeck = createPathCardDeck();

	// Create and deal to players
	const players = Array(playerCount)
		.fill(null)
		.map((_, i) => ({
			name: `Player ${i + 1}`,
			id: (i + 1).toString(),
			pickaxe: true,
			cart: true,
			lamp: true,
			hand: [] as Card[],
			role: roles[i],
			score: 0
		}));

	const [playersWithHands] = dealCardsToPlayers(players, pathDeck);

	gameState.update((state) => ({
		...state,
		grid,
		players: playersWithHands,
		currentRound: 1,
		roundWinner: null,
		currentPlayer: 1,
		selectedCard: null,
		scoreCardDeck: createScoreCardDeck()
	}));
}

// Game actions
export const placeCard = (row: number, col: number, card: Card) => {
	console.log('Placing card', card.name, 'at', row, col);
	gameState.update((state: GameState) => {
		const newGrid = state.grid.map((r) => [...r]);
		newGrid[row][col] = card;

		// Remove the card from the player's hand
		const currentPlayerIndex = state.currentPlayer - 1;
		const currentPlayer = state.players[currentPlayerIndex];
		const newPlayers = [...state.players];
		newPlayers[currentPlayerIndex] = {
			...currentPlayer,
			hand: currentPlayer.hand.filter((c) => c !== card)
		};

		// Check if this card completed a path
		const pathConnectsToGold = checkPathToDestination(newGrid, 'gold');
		const pathConnectsToCoal = checkPathToDestination(newGrid, 'coal');

		if (pathConnectsToGold || pathConnectsToCoal) {
			const winners = pathConnectsToGold ? 'miners' : 'saboteurs';
			const [updatedPlayers, newScoreCardDeck] = dealScoreCardsToWinners(newPlayers, winners, [
				...state.scoreCardDeck
			]);

			return {
				...state,
				grid: newGrid,
				selectedCard: null,
				players: updatedPlayers,
				roundWinner: winners,
				scoreCardDeck: newScoreCardDeck
			};
		}

		// If no path is completed, just move to next turn
		const nextPlayerState = {
			...state,
			grid: newGrid,
			selectedCard: null,
			players: newPlayers,
			currentPlayer: (state.currentPlayer % state.players.length) + 1
		};

		return nextPlayerState;
	});
};

export const selectCard = (card: Card) => {
	console.log('Selecting card', card.name);
	gameState.update((state: GameState) => ({
		...state,
		selectedCard: card
	}));
};

export const nextTurn = () => {
	gameState.update((state: GameState) => {
		const nextPlayer = (state.currentPlayer % state.players.length) + 1;
		return {
			...state,
			currentPlayer: nextPlayer
		};
	});
};

export const drawCard = () => {
	gameState.update((state: GameState) => {
		const currentPlayerIndex = state.currentPlayer - 1;
		const player = state.players[currentPlayerIndex];
		if (!player) return state;

		return {
			...state,
			players: state.players.map((p, i) => {
				if (i === currentPlayerIndex) {
					return {
						...p,
						hand: [...p.hand]
					};
				}
				return p;
			})
		};
	});
};

export const removeCardFromHand = (card: Card) => {
	gameState.update((state: GameState) => {
		const currentPlayerIndex = state.currentPlayer - 1;
		return {
			...state,
			players: state.players.map((p, i) => {
				if (i === currentPlayerIndex) {
					return {
						...p,
						hand: p.hand.filter((c) => c !== card)
					};
				}
				return p;
			})
		};
	});
};

// Check if path connects to destination and update scores
export function checkPathAndScore() {
	gameState.update((state: GameState) => {
		// // Implement path checking logic here to determine if path connects to gold or coal
		// const pathConnectsToGold = checkPathToDestination(state.grid, 'gold');
		// const pathConnectsToCoal = checkPathToDestination(state.grid, 'coal');

		// if (pathConnectsToGold || pathConnectsToCoal) {
		// 	const winners = pathConnectsToGold ? 'miners' : 'saboteurs';
		// 	const [updatedPlayers, newScoreCardDeck] = dealScoreCardsToWinners(state.players, winners, [
		// 		...state.scoreCardDeck
		// 	]);

		// 	return {
		// 		...state,
		// 		players: updatedPlayers,
		// 		roundWinner: winners,
		// 		scoreCardDeck: newScoreCardDeck
		// 	};
		// }

		return state;
	});
}

// Helper function to check if path connects to a destination
function checkPathToDestination(
	grid: (Card | null)[][],
	destinationType: 'gold' | 'coal'
): boolean {
	// Start from the bottom center (cross card)
	const startRow = 6;
	const startCol = 3;

	// Create a visited set to track explored cells
	const visited = new Set<string>();

	// Helper function for DFS
	function dfs(row: number, col: number): boolean {
		// Check bounds
		if (row < 0 || row >= 7 || col < 0 || col >= 7) return false;

		const key = `${row},${col}`;
		if (visited.has(key)) return false;
		visited.add(key);

		const currentCard = grid[row][col];
		if (!currentCard) return false;

		// Check if we found the destination
		if (currentCard.destination && currentCard.score === (destinationType === 'gold')) {
			return true;
		}

		// Check all connected directions
		if (currentCard.n && row > 0) {
			const nextCard = grid[row - 1][col];
			if (nextCard?.s && dfs(row - 1, col)) return true;
		}
		if (currentCard.s && row < 6) {
			const nextCard = grid[row + 1][col];
			if (nextCard?.n && dfs(row + 1, col)) return true;
		}
		if (currentCard.e && col < 6) {
			const nextCard = grid[row][col + 1];
			if (nextCard?.w && dfs(row, col + 1)) return true;
		}
		if (currentCard.w && col > 0) {
			const nextCard = grid[row][col - 1];
			if (nextCard?.e && dfs(row, col - 1)) return true;
		}

		return false;
	}

	return dfs(startRow, startCol);
}

export function rotateCard(card: Card): Card {
	return {
		...card,
		n: card.s,
		s: card.n,
		e: card.w,
		w: card.e
	};
}

export function rotateHand() {
	gameState.update((state) => {
		const currentPlayerIndex = state.currentPlayer - 1;
		const player = state.players[currentPlayerIndex];
		if (!player) return state;

		const rotatedHand = player.hand.map((card) => rotateCard(card));

		return {
			...state,
			players: state.players.map((p, i) =>
				i === currentPlayerIndex ? { ...p, hand: rotatedHand } : p
			)
		};
	});
}
