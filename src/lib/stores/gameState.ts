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

export interface GameState {
	grid: (Card | null)[][];
	selectedCard: Card | null;
	currentPlayer: number;
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
	currentPlayer: 1
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
