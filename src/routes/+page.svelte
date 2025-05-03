<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';
	import paper from 'paper';
	import { gameState, type Card, placeCard, selectCard } from '$lib/stores/gameState';

	let canvas: HTMLCanvasElement;
	let cards: Card[];
	let paperInitialized = false;
	let currentPlayer = 'a';
	let deck: Card[] = [];
	let players = [
		{
			name: 'Player 1',
			id: 'a',
			pickaxe: true,
			cart: true,
			lamp: true
		},
		{
			name: 'Player 2',
			id: 'b',
			pickaxe: true,
			cart: true,
			lamp: true
		},
		{
			name: 'Player 3',
			id: 'c',
			pickaxe: true,
			cart: true,
			lamp: true
		},
		{
			name: 'Player 4',
			id: 'd',
			pickaxe: true,
			cart: true,
			lamp: true
		}
	];

	$: grid = $gameState.grid;
	$: selectedCard = $gameState.selectedCard;

	$: playablePositions = getPlayablePositions(grid, selectedCard);
	$: console.log('Playable positions', playablePositions);
	afterUpdate(() => {
		if (paperInitialized) {
			console.log('Redrawing after update');
			drawGrid();
		}
	});

	const SCORE_CARDS = {
		1: 16,
		2: 8,
		3: 4
	};

	const PLAYER_SETUP = {
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

	const STARTING_HAND_SIZE = 5;

	const CARD_COUNT = {
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

	const CARD_TYPES: Record<string, Card> = {
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

	function rotateCard(card: Card) {
		const newCard = { ...card };
		newCard.n = card.s;
		newCard.s = card.n;
		newCard.e = card.w;
		newCard.w = card.e;
		return newCard;
	}

	function rotateHand(cards: Card[]) {
		return cards.map((card) => rotateCard(card));
	}

	function drawGrid() {
		if (!paper.project) return;

		console.log('Drawing grid', { grid, selectedCard });
		paper.project.clear();
		const cellSize = 80;
		const startX = 100;
		const startY = 100;

		for (let row = 0; row < 7; row++) {
			for (let col = 0; col < 7; col++) {
				const x = startX + col * cellSize;
				const y = startY + row * cellSize;

				// Draw cell border with highlight for valid positions
				const isValidPosition =
					selectedCard && playablePositions.some((pos) => pos.row === row && pos.col === col);
				const rect = new paper.Path.Rectangle({
					point: [x, y],
					size: [cellSize, cellSize],
					strokeColor: 'black',
					fillColor: isValidPosition ? '#90EE90' : 'white'
				});

				const card = grid[row][col];
				if (card) {
					drawCard(x, y, cellSize, card);
				}

				rect.onClick = (event: paper.MouseEvent) => {
					if (selectedCard) {
						const isValidPosition = playablePositions.some(
							(pos) => pos.row === row && pos.col === col
						);
						if (isValidPosition) {
							console.log('Placing card at', row, col);
							placeCard(row, col, selectedCard);
							cards = cards.filter((c) => c !== selectedCard);
							drawGrid();
						} else {
							console.log('Invalid position for card placement');
						}
					}
				};
			}
		}

		const deckX = startX + 8 * cellSize;
		const deckY = startY;
		const deckGroup = new paper.Group();

		for (let i = 0; i < 3; i++) {
			const offset = i * 2;
			new paper.Path.Rectangle({
				point: [deckX + offset, deckY - offset],
				size: [cellSize, cellSize],
				strokeColor: 'black',
				fillColor: '#e8e8e8',
				parent: deckGroup
			});
		}

		const deckTop = new paper.Path.Rectangle({
			point: [deckX + 4, deckY - 4],
			size: [cellSize, cellSize],
			strokeColor: 'black',
			fillColor: 'white',
			parent: deckGroup
		});

		new paper.Path.Circle({
			center: [deckX + 4 + cellSize / 2, deckY - 4 + cellSize / 2],
			radius: cellSize / 4,
			strokeColor: '#666',
			fillColor: null,
			parent: deckGroup
		});

		new paper.PointText({
			point: [deckX + 4 + cellSize / 2, deckY - 4 - 10],
			content: `${deck.length}`,
			justification: 'center',
			fillColor: 'black',
			fontSize: 14,
			parent: deckGroup
		});

		players.forEach((player, index) => {
			const playerY = deckY + (index + 1.5) * cellSize;
			const playerCard = new paper.Path.Rectangle({
				point: [deckX, playerY],
				size: [cellSize, cellSize],
				strokeColor: 'black',
				fillColor: player.id === currentPlayer ? '#e0e0ff' : 'white'
			});

			new paper.PointText({
				point: [deckX + cellSize + 10, playerY + cellSize/2],
				content: player.name,
				fillColor: player.id === currentPlayer ? 'blue' : 'black',
				fontSize: 14
			});
		});

		deckGroup.onClick = (event: paper.MouseEvent) => {
			if (deck.length > 0) {
				const newCards = drawCards(1);
				drawGrid();
			}
		};

		const cardY = startY + 8 * cellSize;
		const maxCardsPerRow = 7;
		const cardPadding = 10;

		const rotateButtonSize = 40;
		const rotateButton = new paper.Path.Rectangle({
			point: [startX - rotateButtonSize - 10, cardY],
			size: [rotateButtonSize, rotateButtonSize],
			strokeColor: 'black',
			fillColor: '#e0e0e0',
			radius: 5
		});

		const arrowSize = rotateButtonSize * 0.6;
		const arrowCenter = new paper.Point(
			startX - rotateButtonSize / 2 - 10,
			cardY + rotateButtonSize / 2
		);

		const arrow = new paper.Path.Circle({
			center: arrowCenter,
			radius: arrowSize / 2,
			strokeColor: 'black',
			fillColor: null,
			strokeWidth: 2
		});

		const arrowhead = new paper.Path({
			segments: [
				[arrowCenter.x + arrowSize / 2, arrowCenter.y],
				[arrowCenter.x + arrowSize / 2 + 8, arrowCenter.y - 8],
				[arrowCenter.x + arrowSize / 2 + 8, arrowCenter.y + 8]
			],
			fillColor: 'black',
			closed: true
		});

		const rotateButtonGroup = new paper.Group([rotateButton, arrow, arrowhead]);

		rotateButtonGroup.onClick = (event: paper.MouseEvent) => {
			cards = rotateHand(cards);
			drawGrid();
		};

		cards.forEach((card, index) => {
			const row = Math.floor(index / maxCardsPerRow);
			const col = index % maxCardsPerRow;
			const x = startX + col * (cellSize + cardPadding);
			const y = cardY + row * (cellSize + cardPadding);
			const cardGroup = new paper.Group();

			const rect = new paper.Path.Rectangle({
				point: [x, y],
				size: [cellSize, cellSize],
				strokeColor: 'black',
				fillColor: card === selectedCard ? '#e0e0ff' : 'white'
			});
			cardGroup.addChild(rect);

			drawCard(x, y, cellSize, card, cardGroup);

			cardGroup.onClick = (event: paper.MouseEvent) => {
				console.log('Selecting card', card.name);
				selectCard(card);
			};
		});

		paper.view.update();
	}

	function drawCard(x: number, y: number, size: number, card: Card, group?: paper.Group) {
		const paths: paper.Path[] = [];
		const center = new paper.Point(x + size / 2, y + size / 2);

		if (card.n) paths.push(drawPath(center, 270, size, card.deadEnd, card.name));
		if (card.e) paths.push(drawPath(center, 0, size, card.deadEnd, card.name));
		if (card.s) paths.push(drawPath(center, 90, size, card.deadEnd, card.name));
		if (card.w) paths.push(drawPath(center, 180, size, card.deadEnd, card.name));

		if (group) {
			paths.forEach((path) => group.addChild(path));
		} else {
			let strokeWidth = 3;
			if (card.name === 'cross') strokeWidth = 4;
			if (card.name === 'gold') strokeWidth = 5;
			paths.forEach((path) => (path.strokeWidth = strokeWidth));
		}

		if (!group) {
			if (card.name === 'gold') {
				const circle = new paper.Path.Circle({
					center: center,
					radius: size / 8,
					fillColor: '#FFD700',
					strokeColor: '#B8860B',
					strokeWidth: 1
				});
			} else if (card.name === 'coal') {
				const circle = new paper.Path.Circle({
					center: center,
					radius: size / 8,
					fillColor: '#8B4513',
					strokeColor: '#654321',
					strokeWidth: 1
				});
			}
		}
	}

	function drawPath(
		center: paper.Point,
		angle: number,
		size: number,
		isDeadEnd: boolean,
		cardName: string
	) {
		const path = new paper.Path();
		let pathColor = 'black';
		if (isDeadEnd) {
			pathColor = cardName === 'gold' ? '#FFD700' : '#8B4513';
		}
		path.strokeColor = new paper.Color(pathColor);
		path.strokeWidth = 2;

		const start = center;
		let end;

		if (isDeadEnd) {
			end = center.add(
				new paper.Point({
					length: size / 6,
					angle: angle
				})
			);
			const edgeStart = center.add(
				new paper.Point({
					length: size / 2,
					angle: angle
				})
			);
			path.moveTo(edgeStart);
		} else {
			end = center;
			const edgeStart = center.add(
				new paper.Point({
					length: size / 2,
					angle: angle
				})
			);
			path.moveTo(edgeStart);
		}

		path.lineTo(end);
		return path;
	}

	function fillDeck() {
		const unshuffledDeck = Object.entries(CARD_COUNT).flatMap(([type, count]) =>
			Array(count)
				.fill(null)
				.map(() => ({ ...CARD_TYPES[type] }))
		);

		deck = [...unshuffledDeck];
		for (let i = deck.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[deck[i], deck[j]] = [deck[j], deck[i]];
		}
	}

	function drawCards(count: number) {
		const drawnCards = deck.splice(0, count);
		cards = [...(cards || []), ...drawnCards];
		return drawnCards;
	}

	function compareRouteCards(cardA: Card, cardB: Card) {
		if (cardA.n && cardB.s) return true;
		if (cardA.s && cardB.n) return true;
		if (cardA.e && cardB.w) return true;
		if (cardA.w && cardB.e) return true;
		return false;
	}

	function getPlayablePositions(existingCards: (Card | null)[][], activeCard: Card | null) {
		if (!activeCard) return [];

		const playablePositions: { row: number; col: number }[] = [];

		for (let row = 0; row < existingCards.length; row++) {
			for (let col = 0; col < existingCards[row].length; col++) {
				if (existingCards[row][col]) continue;

				let canPlace = false;

				if (
					row > 0 &&
					existingCards[row - 1][col] &&
					activeCard.n &&
					existingCards[row - 1][col]!.s &&
					existingCards[row - 1][col]!.valid
				) {
					canPlace = true;
				}

				if (
					row < existingCards.length - 1 &&
					existingCards[row + 1][col] &&
					activeCard.s &&
					existingCards[row + 1][col]!.n &&
					existingCards[row + 1][col]!.valid
				) {
					canPlace = true;
				}

				if (
					col < existingCards[row].length - 1 &&
					existingCards[row][col + 1] &&
					activeCard.e &&
					existingCards[row][col + 1]!.w &&
					existingCards[row][col + 1]!.valid
				) {
					canPlace = true;
				}

				if (
					col > 0 &&
					existingCards[row][col - 1] &&
					activeCard.w &&
					existingCards[row][col - 1]!.e &&
					existingCards[row][col - 1]!.valid
				) {
					canPlace = true;
				}

				if (canPlace) {
					playablePositions.push({ row, col });
				}
			}
		}

		return playablePositions;
	}

	onMount(() => {
		paper.setup(canvas);
		paperInitialized = true;

		fillDeck();
		cards = drawCards(STARTING_HAND_SIZE);
		drawGrid();
	});
</script>

<canvas
	bind:this={canvas}
	style="width: 100%; max-width: 1200px; height: 1000px; background: #f0f0f0;"
></canvas>
