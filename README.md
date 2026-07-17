# Monster Blaster

A local Phaser browser game: clear ten escalating combat rooms, survive milestone Onslaughts, build an auto-firing Blaster, defeat the three-phase Mega Boss, then survive scaling endless rooms.

## Run locally

```powershell
npm install
npm run dev
```

Open the local URL Vite reports. Use WASD or arrow keys to move, aim with the mouse, and press Shift to dash.

## Developer tuning

During a run, select **PAUSE** to stop the game and reveal the tuning bank to the left of the play area. It exposes player, Blaster, encounter, boss, and every monster's base health, speed, and damage values. Changes apply to new shots, enemies, and encounters as the run resumes; use **SAVE VALUES** to preserve the sweet spot in browser storage. **RESET DEFAULTS** restores the shipped values.
