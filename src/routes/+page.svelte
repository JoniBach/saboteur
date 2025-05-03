<script lang="ts">
	import { onMount } from 'svelte';
	import paper from 'paper';

	interface Card {
		n: boolean;
		s: boolean;
		e: boolean;
		w: boolean;
		name: string;
		deadEnd: boolean;
	}

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
		}
	};

	let cards = $state<Card[]>([]);
	let canvas: HTMLCanvasElement;
	let selectedCard: paper.Group | null = null;
	let draggedPaths: paper.Path[] = [];
	let gridCells: paper.Path.Rectangle[] = [];

	function createCard(x: number, y: number, card: Card) {
		const cardRect = new paper.Path.Rectangle({
			point: [x, y],
			size: [60, 60],
			fillColor: card.deadEnd ? '#ffcccc' : '#ffffff',
			strokeColor: '#000000',
			strokeWidth: 1,
			radius: 5
		});

		const paths: paper.Path[] = [];
		const center = cardRect.bounds.center;
		const pathColor = '#333333';
		const pathWidth = 8;
		const pathLength = card.deadEnd ? 15 : 30; // Shorter paths for dead ends

		if (card.n) {
			paths.push(new paper.Path.Line({
				from: card.deadEnd ? [center.x, center.y - pathLength] : [center.x, center.y],
				to: [center.x, y],
				strokeColor: pathColor,
				strokeWidth: pathWidth,
				strokeCap: 'round'
			}));
		}
		if (card.s) {
			paths.push(new paper.Path.Line({
				from: card.deadEnd ? [center.x, center.y + pathLength] : [center.x, center.y],
				to: [center.x, y + 60],
				strokeColor: pathColor,
				strokeWidth: pathWidth,
				strokeCap: 'round'
			}));
		}
		if (card.w) {
			paths.push(new paper.Path.Line({
				from: card.deadEnd ? [center.x - pathLength, center.y] : [center.x, center.y],
				to: [x, center.y],
				strokeColor: pathColor,
				strokeWidth: pathWidth,
				strokeCap: 'round'
			}));
		}
		if (card.e) {
			paths.push(new paper.Path.Line({
				from: card.deadEnd ? [center.x + pathLength, center.y] : [center.x, center.y],
				to: [x + 60, center.y],
				strokeColor: pathColor,
				strokeWidth: pathWidth,
				strokeCap: 'round'
			}));
		}

		const group = new paper.Group([cardRect, ...paths]);
		group.data = { card, isCard: true };
		return { group, paths };
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

		// Setup Paper.js
		paper.setup(canvas);
		const cardSize = 60;
		const padding = 20;

		// Create game grid (7x5)
		const gridStartX = 200;
		const gridStartY = 50;
		const gridWidth = 5;
		const gridHeight = 7;

		for (let row = 0; row < gridHeight; row++) {
			for (let col = 0; col < gridWidth; col++) {
				const x = gridStartX + col * (cardSize + padding);
				const y = gridStartY + row * (cardSize + padding);
				const cell = new paper.Path.Rectangle({
					point: [x, y],
					size: [cardSize, cardSize],
					strokeColor: '#cccccc',
					strokeWidth: 1,
					fillColor: '#f8f8f8',
					opacity: 0.5
				});
				cell.data = { isGrid: true, row, col };
				gridCells.push(cell);
			}
		}

		// Create draggable cards in a horizontal row at the bottom
		const cardStartY = 600; // Fixed Y position at bottom
		const cardsPerRow = 8; // Number of cards per row
		
		cards.forEach((card, index) => {
			const row = Math.floor(index / cardsPerRow);
			const col = index % cardsPerRow;
			const x = padding + col * (cardSize + padding);
			const y = cardStartY + row * (cardSize + padding);

			const { group, paths } = createCard(x, y, card);
			
			group.onMouseDown = (event: paper.MouseEvent) => {
				selectedCard = group;
				group.bringToFront();
			};
		});

		paper.view.onMouseDrag = (event: paper.MouseEvent) => {
			if (selectedCard) {
				selectedCard.position = selectedCard.position.add(event.delta);
				
				// Highlight grid cell under card
				gridCells.forEach(cell => {
					if (cell.bounds.contains(selectedCard!.position)) {
						cell.fillColor = new paper.Color('#e6e6e6');
					} else {
						cell.fillColor = new paper.Color('#f8f8f8');
					}
				});
			}
		};

		paper.view.onMouseUp = (event: paper.MouseEvent) => {
			if (selectedCard) {
				// Find nearest grid cell
				const nearestCell = gridCells.find(cell => 
					cell.bounds.contains(selectedCard!.position)
				);

				if (nearestCell) {
					selectedCard.position = nearestCell.bounds.center;
				}

				// Reset grid cell colors
				gridCells.forEach(cell => {
					cell.fillColor = new paper.Color('#f8f8f8');
				});

				selectedCard = null;
			}
		};

		paper.view.draw();
	});
</script>

<canvas bind:this={canvas} style="width: 100%; max-width: 1200px; height: 800px; background: #f0f0f0;"></canvas>
