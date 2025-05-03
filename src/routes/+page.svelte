<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';
	import paper from 'paper';
	import { gameState, type Card, placeCard, selectCard } from '$lib/stores/gameState';

	let canvas: HTMLCanvasElement;
	let cards: Card[];
	let paperInitialized = false;
	let currentPlayer = 'a';
	let players = [
		{
			name: 'Player 1',
			id: 'a'
		},
		{
			name: 'Player 2',
			id: 'b'
		},
		{
			name: 'Player 3',
			id: 'c'
		},
		{
			name: 'Player 4',
			id: 'd'
		}
	];

	$: grid = $gameState.grid;
	$: selectedCard = $gameState.selectedCard;

	afterUpdate(() => {
		if (paperInitialized) {
			console.log('Redrawing after update');
			drawGrid();
		}
	});

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
		end_elbow_reverse: 1,
		gold: 1,
		coal: 2
	};

	const CARD_TYPES: Record<string, Card> = {
		elbow: {
			w: true,
			s: true,
			e: false,
			n: false,
			name: 'elbow',
			deadEnd: false
		},
		elbow_reverse: {
			w: false,
			s: false,
			e: true,
			n: true,
			name: 'elbow_reverse',
			deadEnd: false
		},
		t_bottom: {
			w: true,
			s: true,
			e: true,
			n: false,
			name: 't_bottom',
			deadEnd: false
		},
		t_side: {
			w: false,
			s: true,
			e: true,
			n: true,
			name: 't_side',
			deadEnd: false
		},
		streight_forward: {
			w: false,
			s: true,
			e: false,
			n: true,
			name: 'streight_forward',
			deadEnd: false
		},
		streight_side: {
			w: true,
			s: false,
			e: true,
			n: false,
			name: 'streight_side',
			deadEnd: false
		},
		cross: {
			w: true,
			s: true,
			e: true,
			n: true,
			name: 'cross',
			deadEnd: false
		},
		end_bottom: {
			w: false,
			s: true,
			e: false,
			n: false,
			name: 'end_bottom',
			deadEnd: true
		},
		end_side: {
			w: true,
			s: false,
			e: false,
			n: false,
			name: 'end_side',
			deadEnd: true
		},
		end_elbow: {
			w: true,
			s: true,
			e: false,
			n: false,
			name: 'end_elbow',
			deadEnd: true
		},
		end_elbow_reverse: {
			w: false,
			s: true,
			e: true,
			n: false,
			name: 'end_elbow_reverse',
			deadEnd: true
		},
		streight_forward_dead: {
			w: false,
			s: true,
			e: false,
			n: true,
			name: 'streight_forward',
			deadEnd: true
		},
		streight_side_dead: {
			w: true,
			s: false,
			e: true,
			n: false,
			name: 'streight_side',
			deadEnd: true
		},
		t_bottom_dead: {
			w: true,
			s: true,
			e: true,
			n: false,
			name: 't_bottom',
			deadEnd: true
		},
		t_side_dead: {
			w: false,
			s: true,
			e: true,
			n: true,
			name: 't_side',
			deadEnd: true
		},
		cross_dead: {
			w: true,
			s: true,
			e: true,
			n: true,
			name: 'cross',
			deadEnd: true
		},
		gold: {
			n: false,
			s: true,
			e: false,
			w: false,
			name: 'gold',
			deadEnd: true
		},
		coal: {
			n: false,
			s: true,
			e: false,
			w: false,
			name: 'coal',
			deadEnd: true
		}
	};

	function drawGrid() {
		if (!paper.project) return;

		console.log('Drawing grid', { grid, selectedCard });
		paper.project.clear();
		const cellSize = 80;
		const startX = 100;
		const startY = 100;

		// Draw grid cells and cards
		for (let row = 0; row < 7; row++) {
			for (let col = 0; col < 7; col++) {
				const x = startX + col * cellSize;
				const y = startY + row * cellSize;

				// Draw cell border with hover effect
				const rect = new paper.Path.Rectangle({
					point: [x, y],
					size: [cellSize, cellSize],
					strokeColor: 'black',
					fillColor: 'white'
				});

				// Draw card if exists
				const card = grid[row][col];
				if (card) {
					drawCard(x, y, cellSize, card);
				}

				// Add click handler for cell
				rect.onClick = (event: paper.MouseEvent) => {
					if (selectedCard) {
						console.log('Placing card at', row, col);
						placeCard(row, col, selectedCard);
					}
				};
			}
		}

		// Draw available cards
		const cardY = startY + 8 * cellSize;
		cards.forEach((card, index) => {
			const x = startX + index * cellSize;
			const cardGroup = new paper.Group();

			// Draw card background
			const rect = new paper.Path.Rectangle({
				point: [x, cardY],
				size: [cellSize, cellSize],
				strokeColor: 'black',
				fillColor: card === selectedCard ? '#e0e0ff' : 'white'
			});
			cardGroup.addChild(rect);

			// Draw card paths
			drawCard(x, cardY, cellSize, card, cardGroup);

			// Add click handler for card selection
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

		// Adjust angles to be 90 degrees counter-clockwise
		if (card.n) paths.push(drawPath(center, 270, size, card.deadEnd, card.name)); // was 0
		if (card.e) paths.push(drawPath(center, 0, size, card.deadEnd, card.name)); // was 90
		if (card.s) paths.push(drawPath(center, 90, size, card.deadEnd, card.name)); // was 180
		if (card.w) paths.push(drawPath(center, 180, size, card.deadEnd, card.name)); // was 270

		if (group) {
			paths.forEach((path) => group.addChild(path));
		} else {
			// Make special cards more prominent
			let strokeWidth = 3;
			if (card.name === 'cross') strokeWidth = 4;
			if (card.name === 'gold') strokeWidth = 5;
			paths.forEach((path) => (path.strokeWidth = strokeWidth));
		}

		// Add goal indicators
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
			// For dead ends, only draw 1/3 of the way from the edge
			end = center.add(
				new paper.Point({
					length: size / 6,
					angle: angle
				})
			);
			// Move the start point to the edge
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

	onMount(() => {
		cards = [
			CARD_TYPES.elbow,
			CARD_TYPES.elbow_reverse,
			CARD_TYPES.t_bottom,
			CARD_TYPES.t_side,
			CARD_TYPES.streight_forward,
			CARD_TYPES.streight_side,
			CARD_TYPES.cross,
			CARD_TYPES.end_bottom,
			CARD_TYPES.end_side,
			CARD_TYPES.end_elbow,
			CARD_TYPES.end_elbow_reverse,
			CARD_TYPES.streight_forward_dead,
			CARD_TYPES.streight_side_dead,
			CARD_TYPES.t_bottom_dead,
			CARD_TYPES.t_side_dead,
			CARD_TYPES.cross_dead
		];

		paper.setup(canvas);
		paperInitialized = true;
		drawGrid();

		return () => {
			paper.project.clear();
		};
	});
</script>

<canvas
	bind:this={canvas}
	style="width: 100%; max-width: 1200px; height: 1000px; background: #f0f0f0;"
></canvas>
