# FNAF-style Mini Game

A simple browser-based night survival game prototype in HTML/CSS/JavaScript.

## Run

1. Open `index.html` in a browser.
2. Click **Start Night**.
3. Toggle lights and door to survive until 6:00 AM.

## GitHub Pages

Project demo (live): https://ikd45421.github.io/fnaf-game

To deploy manually:

1. Create a GitHub repository named `fnaf-game`.
2. Push this code to the `main` branch.
3. In GitHub repo Settings > Pages, set source to `main` branch root.
4. Wait a minute and open the URL above.

## Tutorial

1. Start the game by clicking **Start Night**.
2. Keep an eye on the HUD:
	- `Time`: advances every game tick
	- `Power`: drains over time, faster with lights/doors used
	- `Status`: shows current game state (Idle, Night Active, or Game Over)
3. Use **Toggle Light** to reduce chance of intrusion but consume power.
4. Use **Toggle Door** to block the animatronic at the cost of extra power.
5. If the animatronic appears (red warning text), close the door quickly to avoid loss.
6. Survive until `6:00 AM` to win. If power reaches 0 or you get caught, it becomes Game Over.

### Strategy

 - Turn lights and doors on only when needed.
 - Keep power above 20% to stay safe.
 - Watch for intrusion warnings; unsafe door/open state increases risk.
- Use `Camera 1A` (left) and `Camera 1B` (right) to track animatronics.
- Cameras cost power while active; toggle off to conserve energy.
- When animatronics are viewed close in camera, they can retreat.

## Files

- `index.html`: Game UI and structure
- `styles.css`: Visual style
- `script.js`: Game logic

## Notes

- This is a minimal prototype. Extend with images/animations, audio, and difficulty.
