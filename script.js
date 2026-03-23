const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');
const timeVal = document.getElementById('timeVal');
const powerVal = document.getElementById('powerVal');
const statusVal = document.getElementById('statusVal');
const imageList = document.getElementById('imageList');
const lightBtn = document.getElementById('lightBtn');
const doorLeftBtn = document.getElementById('doorLeftBtn');
const doorRightBtn = document.getElementById('doorRightBtn');
const cam1aBtn = document.getElementById('cam1aBtn');
const cam1bBtn = document.getElementById('cam1bBtn');
const startBtn = document.getElementById('startBtn');
const menu = document.getElementById('menu');
const gameContainer = document.getElementById('gameContainer');
const playBtn = document.getElementById('playBtn');
const startHourInput = document.getElementById('startHourInput');
const startAmPmInput = document.getElementById('startAmPmInput');
const startPowerInput = document.getElementById('startPowerInput');
const powerDecayInput = document.getElementById('powerDecayInput');

let gameInterval = null;

// Configurable options (easily changed)
const config = {
  startingHour: 12,
  startingMinute: 0,
  startingAmPm: 'AM',
  startingPower: 100,
  powerDecayPerMinute: 0.06,
  lightPowerCost: 0.12,
  doorPowerCost: 0.09,
  cameraPowerCost: 0.11,
  winHour: 6,
  imageFolder: 'images',
  imageTemplates: {
    office: 'office.png',
    camera1a: 'camera1a.png',
    camera1b: 'camera1b.png',
    doorLeft: 'door-left.png',
    doorRight: 'door-right.png'
  }
};

let nightActive = false;
let hour = config.startingHour;
let minute = config.startingMinute;
let amPm = config.startingAmPm;
let power = config.startingPower;
let lightOn = false;
let doorLeftClosed = false;
let doorRightClosed = false;
let gameOver = false;
let cameraView = null;
let cameraActive = false;

function applySettingsFromUI() {
	config.startingHour = Math.min(12, Math.max(1, Number(startHourInput.value) || 12));
	config.startingAmPm = startAmPmInput.value === 'PM' ? 'PM' : 'AM';
	config.startingPower = Math.min(100, Math.max(0, Number(startPowerInput.value) || 100));
	config.powerDecayPerMinute = Math.max(0, Number(powerDecayInput.value) || 0.06);

	hour = config.startingHour;
	minute = 0;
	amPm = config.startingAmPm;
	power = config.startingPower;
	lightOn = false;
	doorLeftClosed = false;
	doorRightClosed = false;
	gameOver = false;
	cameraView = null;
	cameraActive = false;
	nightActive = false;
	statusVal.textContent = 'Ready';
	updateHud();
	draw();
}

function showMenu() {
	menu.style.display = 'flex';
	gameContainer.style.display = 'none';
	startBtn.disabled = false;
	if (gameInterval) {
		clearInterval(gameInterval);
		gameInterval = null;
	}
	applySettingsFromUI();
}

function showGame() {
	menu.style.display = 'none';
	gameContainer.style.display = 'block';
}

function startNight() {
	if (nightActive || gameOver) return;

	applySettingsFromUI();
	showGame();

	nightActive = true;
	startBtn.disabled = true;
	statusVal.textContent = 'Night started';

	if (!gameInterval) {
		gameInterval = setInterval(gameLoop, 500);
	}
}

const animatronics = {
	left: { name: 'Bonnie', active: false, distance: 3 },
	right: { name: 'Chica', active: false, distance: 3 }
};

function draw() {
	// Fully clear canvas every frame so camera UI does not persist behind office view
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	if (cameraActive && cameraView) {
		ctx.fillStyle = '#101010';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = '#0f0';
		ctx.font = '28px monospace';
		ctx.fillText(`Camera ${cameraView}`, 300, 80);

		const camAnim = cameraView === '1A' ? animatronics.left : animatronics.right;
		ctx.fillStyle = camAnim.active ? '#ff5555' : '#77ff77';
		ctx.font = '24px monospace';
		ctx.fillText(`${camAnim.name} distance: ${camAnim.active ? camAnim.distance.toFixed(1) : 'clear'}`, 230, 220);
		const leftState = doorLeftClosed ? 'Closed' : 'Open';
		const rightState = doorRightClosed ? 'Closed' : 'Open';
		ctx.fillText(`Doors L:${leftState} R:${rightState} · Light: ${lightOn ? 'On' : 'Off'}`, 190, 260);
	} else {
		const rootState = (doorLeftClosed && doorRightClosed) ? '#111' : '#3a1100';
		const target = rootState;
		ctx.fillStyle = target;
		ctx.fillRect(200, 150, 400, 300);

		ctx.fillStyle = lightOn ? 'rgba(255,255,190,0.6)' : 'rgba(0,0,0,0.6)';
		ctx.fillRect(230, 180, 340, 240);

		if (animatronics.left.active && animatronics.left.distance <= 1.2) {
			ctx.fillStyle = '#ff0000';
			ctx.font = '30px monospace';
			ctx.fillText('Bonnie at left door!', 220, 330);
		}
		if (animatronics.right.active && animatronics.right.distance <= 1.2) {
			ctx.fillStyle = '#ff0000';
			ctx.font = '30px monospace';
			ctx.fillText('Chica at right door!', 220, 370);
		}
	}

	if (power <= 0) {
		power = 0;
		gameOver = true;
		statusVal.textContent = 'Out of Power';
	}

	Object.values(animatronics).forEach(a => {
		if (!a.active) {
			if (Math.random() < 0.005) {
				a.active = true;
				a.distance = 3;
			}
			return;
		}

		if (cameraActive && ((cameraView === '1A' && a === animatronics.left) || (cameraView === '1B' && a === animatronics.right))) {
			a.distance = Math.min(3, a.distance + 0.22);
			if (a.distance > 2.2 && Math.random() < 0.12) {
				a.active = false;
			}
		} else {
			a.distance = Math.max(0, a.distance - 0.08 - (lightOn ? 0.02 : 0));
		}

		if (a.distance <= 0.15) {
			const blocked = (a === animatronics.left && doorLeftClosed) || (a === animatronics.right && doorRightClosed);
			if (!blocked) {
				gameOver = true;
				statusVal.textContent = `Caught by ${a.name}`;
			} else {
				a.distance = 0.7; // blocked by closed door
			}
		}
	});
}

function updateHud() {
	timeVal.textContent = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${amPm}`;
	powerVal.textContent = `${Math.max(0, Math.floor(power))}%`;
	if (gameOver) {
		statusVal.textContent = 'Bricked';
	} else if (!nightActive) {
		statusVal.textContent = 'Idle';
	} else {
		statusVal.textContent = cameraActive ? `Cam ${cameraView}` : 'Night Active';
	}
}

function gameLoop() {
	if (!nightActive || gameOver) return;

	minute += 1;
	if (minute >= 60) {
		minute = 0;
		hour += 1;
	}
	if (hour > 12) {
		hour = 1;
	}
	if (hour === 12 && minute === 0) {
		amPm = amPm === 'AM' ? 'PM' : 'AM';
	}

	if (lightOn) power -= config.lightPowerCost;
	if (doorLeftClosed) power -= config.doorPowerCost;
	if (doorRightClosed) power -= config.doorPowerCost;
	if (cameraActive) power -= config.cameraPowerCost;
	power -= config.powerDecayPerMinute;

	if (power <= 0) {
		power = 0;
		gameOver = true;
		statusVal.textContent = 'Out of Power';
	}

	if (hour === 6 && amPm === 'AM') {
		gameOver = true;
		statusVal.textContent = 'Survived!';
	}

	draw();
	updateHud();
}

// Display image asset template list in the UI for easy reference.
if (imageList) {
	imageList.textContent = Object.values(config.imageTemplates)
		.map(file => `${config.imageFolder}/${file}`)
		.join(', ');
}

showMenu();

lightBtn.onclick = () => {
	if (!nightActive || gameOver) return;
	lightOn = !lightOn;
	lightBtn.textContent = lightOn ? 'Lights OFF' : 'Lights ON';
	draw();
};

doorLeftBtn.onclick = () => {
	if (!nightActive || gameOver) return;
	doorLeftClosed = !doorLeftClosed;
	doorLeftBtn.textContent = doorLeftClosed ? 'Open Left Door' : 'Close Left Door';
	draw();
};

doorRightBtn.onclick = () => {
	if (!nightActive || gameOver) return;
	doorRightClosed = !doorRightClosed;
	doorRightBtn.textContent = doorRightClosed ? 'Open Right Door' : 'Close Right Door';
	draw();
};

const setCamera = view => {
	if (!nightActive || gameOver) return;
	if (cameraView === view && cameraActive) {
		cameraActive = false;
		cameraView = null;
		cam1aBtn.textContent = 'Camera 1A';
		cam1bBtn.textContent = 'Camera 1B';
		return;
	}
	cameraActive = true;
	cameraView = view;
	cam1aBtn.textContent = view === '1A' ? 'Camera 1A (ON)' : 'Camera 1A';
	cam1bBtn.textContent = view === '1B' ? 'Camera 1B (ON)' : 'Camera 1B';
};

cam1aBtn.onclick = () => setCamera('1A');
cam1bBtn.onclick = () => setCamera('1B');

startBtn.onclick = () => {
	startNight();
};

playBtn.onclick = () => {
	startNight();
};
