<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';
	import paper from 'paper';
	import {
		gameState,
		type Card,
		type Player,
		initializeGame,
		placeCard,
		rotateHand,
		selectCard,
		nextTurn,
		STARTING_HAND_SIZE,
		startNewRound as startNewRoundFromGameState,
		ROUND_COUNT,
		isValidCardPlacement,
		createMixedDeck,
		type ActionCard,
		ACTION_ICON,
		ACTION_DETAILS
	} from '$lib/stores/gameState';

	let canvas: HTMLCanvasElement;
	let paperInitialized = false;
	let deck: Card[] = [];

	$: grid = $gameState.grid;
	$: selectedCard = $gameState.selectedCard;
	$: players = $gameState.players;
	$: currentPlayer = $gameState.currentPlayer;
	$: currentPlayerDetails = $gameState.players[currentPlayer - 1];
	$: currentPlayerHand = $gameState.players[currentPlayer - 1]?.hand || [];
	$: currentRound = $gameState.currentRound;
	$: roundWinner = $gameState.roundWinner;

	afterUpdate(() => {
		if (paperInitialized) {
			drawGrid();
		}
	});

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
				const isValidPosition = selectedCard && isValidCardPlacement(grid, row, col, selectedCard);
				const rect = new paper.Path.Rectangle({
					point: [x, y],
					size: [cellSize, cellSize],
					strokeColor: 'black',
					fillColor: isValidPosition ? '#90EE90' : 'white'
				});

				const card = grid[row][col];
				if (card) {
					renderCard(x, y, cellSize, card);
				}

				rect.onClick = (event: paper.MouseEvent) => {
					if (selectedCard) {
						const isValidPosition = isValidCardPlacement(grid, row, col, selectedCard);
						if (isValidPosition) {
							placeCard(row, col, selectedCard);
							removeLocalCardFromHand(selectedCard);
							nextTurn();
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

		deckGroup.onClick = (event: paper.MouseEvent) => {
			if (deck.length > 0) {
				const drawnCard = drawLocalCard();
				if (drawnCard) {
					nextTurn();
					drawGrid();
				}
			}
		};

		const cardY = startY + 8 * cellSize;
		const maxCardsPerRow = 6;
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
			rotateHand();
			drawGrid();
		};

		currentPlayerHand.forEach((card, index) => {
			const row = Math.floor(index / maxCardsPerRow);
			const col = index % maxCardsPerRow;
			const x = startX + col * (cellSize + cardPadding);
			const y = cardY + row * (cellSize + cardPadding);
			const cardGroup = new paper.Group();

			const color =
				!currentPlayerDetails.pickaxe || !currentPlayerDetails.cart || !currentPlayerDetails.lamp
					? '#ffdddd'
					: card === selectedCard
						? '#e0e0ff'
						: 'white';

			const rect = new paper.Path.Rectangle({
				point: [x, y],
				size: [cellSize, cellSize],
				strokeColor: 'black',
				fillColor: color
			});
			cardGroup.addChild(rect);

			renderCard(x, y, cellSize, card, cardGroup);

			cardGroup.onClick = (event: paper.MouseEvent) => {
				selectCard(card, currentPlayerDetails);
			};
		});

		paper.view.update();
	}

	$: console.log('selected card', selectedCard);
	function renderCard(
		x: number,
		y: number,
		size: number,
		card: ActionCard | Card,
		group?: paper.Group
	) {
		if (card.type === 'action') {
			renderActionCard(x, y, size, card, group);
		} else {
			renderPathCard(x, y, size, card, group);
		}
	}
	function renderActionCard(
		x: number,
		y: number,
		size: number,
		card: ActionCard,
		group?: paper.Group
	) {
		console.log(card);
		const rect = new paper.Path.Rectangle({
			point: [x, y],
			size: [size, size],
			strokeColor: card.details.action === 'damage' ? 'red' : 'green',
			fillColor: selectedCard === card ? '#e0e0ff' : 'white'
		});

		const text = new paper.PointText({
			point: [x + size / 2, y + size / 2],
			content: card.details.icon,
			justification: 'center',
			fillColor: 'black',
			fontSize: 20
		});

		if (group) {
			group.addChild(rect);
			group.addChild(text);
		}
	}

	function renderPathCard(x: number, y: number, size: number, card: Card, group?: paper.Group) {
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
		deck = createMixedDeck();
	}

	function startNewRound() {
		startNewRoundFromGameState();
		fillDeck();
		drawGrid();
	}

	function drawLocalCard() {
		const drawnCard = deck.shift();
		if (!drawnCard) return null;

		gameState.update((state) => ({
			...state,
			players: state.players.map((p, index) =>
				index === currentPlayer - 1 ? { ...p, hand: [...p.hand, drawnCard] } : p
			)
		}));
		return drawnCard;
	}

	function removeLocalCardFromHand(card: Card) {
		gameState.update((state) => ({
			...state,
			players: state.players.map((p, index) =>
				index === currentPlayer - 1 ? { ...p, hand: p.hand.filter((c) => c !== card) } : p
			)
		}));
	}

	function handleRoundEnd() {
		if (currentRound < ROUND_COUNT) {
			startNewRound();
		}
	}

	onMount(() => {
		paper.setup(canvas);
		paperInitialized = true;

		// Initialize game with 4 players (or any other number from 3-10)
		initializeGame(4);
		fillDeck();

		// Deal initial cards to all players using the store directly
		gameState.update((state) => {
			const updatedPlayers = state.players.map((player) => {
				const hand = [];
				for (let i = 0; i < STARTING_HAND_SIZE; i++) {
					const drawnCard = deck.shift();
					if (drawnCard) {
						hand.push(drawnCard);
					}
				}
				return { ...player, hand };
			});

			return {
				...state,
				players: updatedPlayers
			};
		});

		drawGrid();
	});

	function modifyTool(tool, player, bool) {
		console.log('modifyTool', { tool, player, bool });
		gameState.update((state) => ({
			...state,
			players: state.players.map((p, index) => (p.id === player.id ? { ...p, [tool]: bool } : p))
		}));
	}

	function selectPlayerTool(selectedTool, tool, player) {
		console.log({ tool, player });

		// if (selectedTool !== tool.tool) {
		// 	return;
		// }

		if (tool.action === 'damage' && player[tool.tool] === true) {
			console.log('damaging', player.name + 's', tool.tool);

			modifyTool(tool.tool, player, false);
			removeLocalCardFromHand(selectedCard);
			selectCard(null, currentPlayerDetails);
			nextTurn();
		} else if (tool.action === 'damage' && player[tool.tool] === false) {
			console.log(player.name + 's', tool.tool, 'is already damaged');
		}

		if (tool.action === 'repair' && tool.tool?.includes('_or_')) {
			const [tool1, tool2] = tool.tool.split('_or_');
			const isTool1Damaged = player[tool1] === false;
			const isTool2Damaged = player[tool2] === false;

			const selectedToolIsDamaged = player[selectedTool] === false;

			if (selectedToolIsDamaged) {
				console.log('repairing', player.name + 's', selectedTool);
				modifyTool(selectedTool, player, true);
				removeLocalCardFromHand(selectedCard);
				selectCard(null, currentPlayerDetails);
				nextTurn();
			} else {
				console.log(player.name + 's', tool1, 'and', tool2, 'are already working');
			}
		} else if (tool.action === 'repair' && player[tool.tool] === false) {
			console.log('repairing', player.name + 's', tool.tool);
			modifyTool(tool.tool, player, true);
			removeLocalCardFromHand(selectedCard);
			selectCard(null, currentPlayerDetails);
			nextTurn();
		} else if (tool.action === 'repair' && player[tool.tool] === true) {
			console.log(player.name + 's', tool.tool, 'is already working');
		}
	}

	console.log('gameState', players);
</script>

<canvas
	bind:this={canvas}
	style="width: 100%; max-width: 1200px; height: 1000px; background: #f0f0f0;"
></canvas>

<div class="game-info">
	<div class="round-info">
		<h2>Round {currentRound} of {ROUND_COUNT}</h2>
		{#if roundWinner}
			<div class="winner-announcement">
				{roundWinner === 'miners' ? 'Miners' : 'Saboteurs'} win this round!
			</div>
		{/if}
	</div>

	<div class="player-tools">
		{#each players as player, i}
			<div class="player {currentPlayer === i + 1 ? 'active' : ''}">
				<div class="player-info">
					<span class="player-name">{player.name}</span>
					<span class="player-role">{player.role}</span>
					<span class="player-score">Score: {player.score}</span>
				</div>
				<div class="tools">
					<button
						class="tool {player.pickaxe
							? 'working'
							: 'damaged'} {selectedCard?.details?.tool?.includes('pickaxe')
							? 'highlight'
							: 'disabled'}"
						on:click={() => selectPlayerTool('pickaxe', selectedCard?.details, player)}
						style:disabled={!selectedCard?.details?.tool?.includes('pickaxe')}
					>
						⛏️
					</button>
					<button
						class="tool {player.cart
							? 'working'
							: 'damaged'} {selectedCard?.details?.tool?.includes('cart')
							? 'highlight'
							: 'disabled'}"
						on:click={() => selectPlayerTool('cart', selectedCard?.details, player)}
						style:disabled={!selectedCard?.details?.tool?.includes('cart')}
					>
						🛒
					</button>
					<button
						class="tool {player.lamp
							? 'working'
							: 'damaged'} {selectedCard?.details?.tool?.includes('lamp')
							? 'highlight'
							: 'disabled'}"
						on:click={() => selectPlayerTool('lamp', selectedCard?.details, player)}
						style:disabled={!selectedCard?.details?.tool?.includes('lamp')}
					>
						🔦
					</button>
				</div>
			</div>
		{/each}
	</div>

	{#if roundWinner && currentRound < ROUND_COUNT}
		<button class="next-round-btn" on:click={handleRoundEnd}>Start Next Round</button>
	{/if}
</div>

<style>
	.game-info {
		position: fixed;
		right: 20px;
		top: 20px;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.round-info {
		background: rgba(255, 255, 255, 0.9);
		padding: 10px;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		text-align: center;
	}

	.round-info h2 {
		margin: 0;
		font-size: 1.2em;
		color: #2196f3;
	}

	.winner-announcement {
		margin-top: 8px;
		font-weight: bold;
		color: #4caf50;
	}

	.player-tools {
		background: rgba(255, 255, 255, 0.9);
		padding: 10px;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.player {
		margin-bottom: 10px;
		padding: 8px;
		border-radius: 4px;
		border: 1px solid #ddd;
	}

	.player.active {
		border-color: #00bcd4;
	}

	.player-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 5px;
		gap: 8px;
	}

	.player-name {
		font-weight: bold;
	}

	.player-role {
		font-size: 0.9em;
		padding: 2px 6px;
		border-radius: 4px;
		background: #f0f0f0;
		text-transform: capitalize;
	}

	.player-score {
		font-size: 0.9em;
		color: #2196f3;
		font-weight: bold;
	}

	.tools {
		display: flex;
		gap: 8px;
	}

	.tool {
		padding: 4px;
		border-radius: 4px;
		background: #f0f0f0;
		opacity: 0.5;
	}

	.tool.working {
		opacity: 1;
		/* background: #e5fae0; */
	}

	.tool.damaged {
		opacity: 1;
		background: #fae1e0;
	}

	.tool.highlight {
		opacity: 1;
		background: #e5fae0;
		cursor: pointer;
	}

	.next-round-btn {
		padding: 10px 20px;
		background: #2196f3;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: bold;
		transition: background-color 0.2s;
	}

	.next-round-btn:hover {
		background: #1976d2;
	}
</style>
