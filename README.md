HTML JavaScript Gaming

A 2D JavaScript game engine playground containing:

Playable arcade-style games

Learning demos and experiments

Game development tools

Engine documentation

This repository serves as both a learning environment and a small reusable HTML5 game engine framework.

Quick Start
1. Clone the repository
git clone https://github.com/ToolboxAid/HTML-JavaScript-Gaming.git
cd HTML-JavaScript-Gaming
2. Open the launcher

Open:

index.html

This page provides a central launcher for:

Games

Learning Labs

Tools

Documentation

Repository Structure
HTML-JavaScript-Gaming
│
├── engine/                # Shared game engine code
│
├── games/                 # Playable games
│   ├── Asteroids
│   ├── Frogger
│   ├── Pong Game
│   ├── Snake
│   ├── Space Invaders
│   ├── Tic-Tac-Toe
│   └── Connect 4
│
├── demos/                 # Engine and gameplay experiments
│
├── samples/               # Learning examples
│   ├── Sample Game Engine
│   ├── Sample Keyboard
│   ├── Sample Mouse
│   ├── Sample GameControllers
│   ├── Sample Particle
│   ├── Sample Audio
│   ├── Sample Synthisizer
│   └── Sample midi Player
│
├── tools/
│   └── SpriteEditor
│
├── docs/
│   ├── getting-started.md
│   ├── game-engine-architecture.md
│   └── sprite-system.md
│
└── index.html             # Demo / project launcher
Playable Games

These projects are intended to be complete playable examples.

Asteroids

Frogger

Pong

Snake

Space Invaders

Tic-Tac-Toe

Connect 4

They demonstrate:

game loops

entity systems

collision detection

scoring systems

UI state handling

Learning Labs / Tech Demos

These projects are focused experiments used to explore specific engine features.

Examples include:

tile maps

fullscreen rendering

motion systems

canvas drawing

simulation experiments

These demos are useful for learning how individual engine components work.

Samples

Samples are minimal focused examples showing how to use engine features:

keyboard input

mouse input

game controllers

audio playback

MIDI playback

synthesizers

particle effects

These are helpful when building new games or experimenting with mechanics.

Tools
SpriteEditor

A lightweight pixel sprite editor used to create and modify sprites for games.

Features include:

pixel editing

sprite grid editing

color palette support

exportable sprite data

Engine Concepts

The engine focuses on simple, readable architecture.

Core ideas include:

Game Loop

Scene / State systems

Entity objects

Physics helpers

Input abstraction

Canvas rendering

The goal is to keep the engine small, understandable, and hackable.

Documentation

Detailed documentation is available in:

docs/

Or view them on GitHub:

https://github.com/ToolboxAid/HTML-JavaScript-Gaming/blob/main/docs/getting-started.md

https://github.com/ToolboxAid/HTML-JavaScript-Gaming/blob/main/docs/game-engine-architecture.md

https://github.com/ToolboxAid/HTML-JavaScript-Gaming/blob/main/docs/sprite-system.md

Running Locally (Recommended)

For best results, run the project with a local web server.

Example using Python:

python -m http.server

Then open:

http://localhost:8000

Some browsers restrict features when opening files directly with file:///.

Purpose of This Repository

This project is designed to be:

a learning environment for JavaScript game development

a collection of playable mini-games

a testbed for game engine experiments

a toolkit for experimenting with HTML5 Canvas

Future Improvements

Possible improvements include:

improved engine modularization

more reusable game components

better sprite and animation tools

additional demo games

automatic demo discovery in the launcher

License

MIT License