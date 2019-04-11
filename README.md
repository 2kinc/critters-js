# Critters!
Its a canvas like thing, except made with html.

First, to get started, you import the script:

<code><script src="https://2kinc.me/critters/main.js"></script></code>

Then you make a world:

<code>var world = new World(width, height, x, y)</code>

Then you append the world!

<code>element.appendChild(world.el);</code>

To make a critter, you use <code>new World.Critter(x, y, width, height, deg, innerHTML, name)</code>.

And a rectangle: <code>new World.Rect(x, y, width, height, degrees, color, name)</code>.

Learn more [here](2kinc.me/critters)

Wanna join the coders? Make a pull request!
