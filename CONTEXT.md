# Monster Blaster

Monster Blaster is a browser-based top-down twin-stick shooter about surviving an escalating combat run.

## Language

**Run**:
A single attempt to progress through the game's combat challenges, ending when the player is defeated.
_Avoid_: Session, playthrough

**Baseline difficulty**:
The default combat challenge of a Run, determined by its room progression and enemy tuning.
_Avoid_: Difficulty mode, settings

**Hard mode**:
An optional, brutal, swarm-focused Run configuration selected before a Run. It preserves player capabilities and Blaster modifier values while increasing Combat pressure throughout the Run, including the Mega Boss and Endless phase.
_Avoid_: Baseline difficulty

**Combat pressure**:
The challenge created by the quantity, mixture, pacing, and behavior of monsters in a combat room. Ordinary waves use fully random mixtures of all archetypes unlocked for their room, without per-wave caps.
_Avoid_: Damage spike, stat inflation

**Combat tempo**:
The speed and variation of monster movement and enemy projectiles during a combat room. Normal enemy projectiles begin 15% faster than the prior baseline and accelerate further with room progression; Ranged attackers use up to an 8-degree aim offset. Monster movement rises 5% per room from room 3, capped at 40% by room 10.
_Avoid_: Randomness, chaos

**Movement behavior**:
The recognizable movement pattern that makes a Monster archetype feel responsive and distinct in combat.
_Avoid_: Random motion, animation

**Onslaught wave**:
A spectacle-scale bonus monster wave that announces itself briefly, then deploys its full army around the arena edge after the first standard wave is cleared in a milestone combat room.
_Avoid_: Horde, army wave

**Twin-stick shooter**:
A game in which movement and aiming are controlled independently.
_Avoid_: Top-down shooter

**Combat room**:
A self-contained encounter containing defined monster waves in the fixed open arena and cleared by defeating its assigned monsters.
_Avoid_: Level, wave

**Upgrade choice**:
A selection from the full list of Blaster modifiers between combat rooms that improves the player's capabilities for the current Run. Two choices are granted after each cleared combat room.
_Avoid_: Loot, power-up

**Defeat**:
The event where the player's health reaches zero and the current Run ends.
_Avoid_: Death, game over

**Run summary**:
The Defeat screen record of the selected Run configuration, room reached, Mega Boss status, elapsed time, and selected Blaster modifiers.
_Avoid_: Scoreboard, results

**Hit protection**:
The brief player invulnerability granted immediately after taking damage outside a Dash.
_Avoid_: Invincibility frames, damage immunity

**Recovery**:
The full restoration of the player's health after a combat room is cleared.
_Avoid_: Healing, regeneration

**Mega Boss**:
The unique milestone enemy encountered after the tenth combat room of a Run, with three escalating health-threshold phases using projectile bursts, radial rings, summoned Chasers, and distinct movement behavior: a broad center circle in phase 1, telegraphed cross-arena movement in phase 2, and constant high-speed circles with mid-loop reversals in phase 3.
_Avoid_: Final boss, end boss

**Endless phase**:
The escalating combat rooms that begin when the Mega Boss is defeated and continue until Defeat; monster counts, health, and damage rise each room.
_Avoid_: Postgame, victory lap

**Blaster**:
The player's mouse-aimed weapon that fires continuously while a Run is active.
_Avoid_: Gun, shooter

**Blaster modifier**:
A Run-only upgrade that changes one or more Blaster combat statistics and can be selected repeatedly without a cap.
_Avoid_: Weapon, item

**Damage modifier**:
A Blaster modifier that raises projectile damage.

**Fire-rate modifier**:
A Blaster modifier that reduces time between shots.

**Projectile-count modifier**:
A Blaster modifier that adds simultaneous projectiles to each shot.

**Projectile-speed modifier**:
A Blaster modifier that increases projectile travel speed.

**Pierce modifier**:
A Blaster modifier that allows a projectile to damage additional monsters.

**Dash**:
A short player movement burst with a cooldown and brief invulnerability.
_Avoid_: Dodge, roll

**Monster archetype**:
A reusable category of monster defined by its distinct combat behavior.
_Avoid_: Enemy type, mob

**Orbiter**:
A monster archetype that first appears in room 5 and creates moving area denial by firing a rotating 10-projectile ring every two seconds with no charge.

**Ambusher**:
A monster archetype that first appears in room 6, flanks the player, signals a 0.5-second tell, then makes a fast straight pounce.

**Summoner**:
A monster archetype that first appears in room 8 and creates three Minis every three seconds.

**Chaser**:
A monster archetype that briefly circles the player before committing to a direct charge to deal contact damage.

**Ranged attacker**:
A monster archetype that strafes to maintain distance, pauses briefly to aim, then attacks the player from range.

**Tank**:
A monster archetype with high health that winds up before making a powerful straight rush, pressuring the player through durability.

**Splitter**:
A monster archetype that makes fully frantic rapid zig-zag dashes without a directional tell or recovery and divides into smaller monsters when defeated.

**Mini**:
A small monster created when a Splitter is defeated that quickly pursues the player with slight weaving.
_Avoid_: Split, fragment
