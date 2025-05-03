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
}

export interface GameState {
	grid: (Card | null)[][];
	selectedCard: Card | null;
	currentPlayer: number;
	players: Player[];
}

export const SCORE_CARDS = {
	1: 16,
	2: 8,
	3: 4
};

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
		score: false
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
		score: true
	}
};

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
	deadEnd: true
};

const coalCard: Card = {
	n: false,
	s: false,
	e: false,
	w: false,
	name: 'coal',
	deadEnd: true
};

// Place cross at bottom center
initialGrid[6][3] = crossCard;

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
	initialGrid[pos[0]][pos[1]] = card;
});

const initialState: GameState = {
	grid: initialGrid,
	selectedCard: null,
	currentPlayer: 1,
	players: [
		{ name: 'Player 1', id: 'a', pickaxe: true, cart: true, lamp: true, hand: [] },
		{ name: 'Player 2', id: 'b', pickaxe: true, cart: true, lamp: true, hand: [] },
		{ name: 'Player 3', id: 'c', pickaxe: true, cart: true, lamp: true, hand: [] },
		{ name: 'Player 4', id: 'd', pickaxe: true, cart: true, lamp: true, hand: [] }
	]
};

// Create the store
export const gameState = writable<GameState>(initialState);

// Game actions
export const placeCard = (row: number, col: number, card: Card) => {
	console.log('Placing card', card.name, 'at', row, col);
	gameState.update((state) => {
		if (state.grid[row][col] !== null) {
			console.log('Cell already occupied');
			return state;
		}

		const newGrid = state.grid.map((r) => [...r]);
		newGrid[row][col] = card;

		return {
			...state,
			grid: newGrid,
			selectedCard: null
		};
	});
};

export const selectCard = (card: Card) => {
	console.log('Selecting card', card.name);
	gameState.update((state) => ({
		...state,
		selectedCard: card
	}));
};

export const nextTurn = () => {
	gameState.update((state) => {
		const nextPlayer = (state.currentPlayer % state.players.length) + 1;
		return {
			...state,
			currentPlayer: nextPlayer
		};
	});
};

export const drawCard = () => {
	gameState.update((state) => {
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
	gameState.update((state) => {
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
