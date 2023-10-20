# JavaScript Game Template

## A simple framework for making a javascript game

### game.js

Sets up the fundamentals required for a browser game, screen size, context, key inputs, simple game state and creates a new Cart(). Tracks the mouse position and where the last click occured, after each game loop processed click is reset, to be checked within each single loop or discarded.

### cart.js

Acts as the main game; handles the game loop, the game has two key states: intro and started. The cart should declare the sound, levels, hero and other entity managers and have them tick (using delta to track time since last tick).
