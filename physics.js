import Matter from "matter-js";
import Constants from "./Constants";
import Pipes from "./entities/Pipes";

// The physics engine was learnt and implimented via the aid of tutorials by Tamas Szikszai, available at links:
// https://www.youtube.com/watch?v=qBGnfULn8W4
// https://www.youtube.com/watch?v=XzLekeXt-Bg

// Frame counter
let frame = 0;
// Bat pose 
let pose = 1;
// How many pipe are in the game world
let pipes = 0;

export const resetPipes = () => {
    pipes = 0;
}

// Define top and bottom 'pipe lengths' at random (where the gap between pipes will be)
export const randomGapPos = (min, max) => {
    // Get random number within a range (min -> max)
    return Math.floor(Math.random() * (max - min + 1) + min);
}
  
// Define pipes (generate pipe objects to fly between)
export const generatePipes = () => {
    let topPipeHeight = randomGapPos(100, (Constants.MAX_HEIGHT / 2) - 100);
    let bottomPipeHeight = Constants.MAX_HEIGHT - topPipeHeight - Constants.GAP_SIZE;

    let sizes = [topPipeHeight, bottomPipeHeight];

    if(Math.random() < 0.5){
        sizes = sizes.reverse();
    }

    return sizes;
}

// Add pipe at a specified location
export const addPipesAtLocation = (x, world, entities) => {
    let [pipe1Height, pipe2Height] = generatePipes();

    // Obstacle at the top
    let pipe1 = Matter.Bodies.rectangle(x, pipe1Height / 2, Constants.PIPE_WIDTH, pipe1Height, {isStatic: true});
    // Obstacle at the bottom
    let pipe2 = Matter.Bodies.rectangle(x, Constants.MAX_HEIGHT - 50 - (pipe2Height / 2), Constants.PIPE_WIDTH, pipe2Height, {isStatic: true});

    Matter.World.add(world, [pipe1, pipe2]);

    entities["pipe" +  (pipes + 1)] = {
        body: pipe1, renderer: Pipes, scored: false
    }

    entities["pipe" +  (pipes + 2)] = {
        body: pipe2, renderer: Pipes, scored: false
    }

    pipes += 2;
}

const Physics = (entities, { touches, time, dispatch }) => {
    // Get the physics engine
    let engine = entities.physics.engine;
    // Get the game world object
    let world = entities.physics.world;
    // Get the bat entitiy
    let bat = entities.bat.body;
    // Touch handler so that only one touch can occur at a time (prevent multiple finger tap) - resets every loop (one touch per frame)
    let canTouch = false;

    // Filter touches to only perform an event if the type is 'press' - Gesture Handeling
    touches.filter(t => t.type === "press").forEach(t => {
        // Gesture handler
        if(!canTouch){
            // Set the world gravity to make the bat drop after the first touch
            if(world.gravity.y === 0.0){
                world.gravity.y = 1.2;

                // Add pipe into the world
                addPipesAtLocation((Constants.MAX_WIDTH * 2) - (Constants.PIPE_WIDTH / 2), world, entities);
                addPipesAtLocation((Constants.MAX_WIDTH * 3) - (Constants.PIPE_WIDTH / 2), world, entities);
            }
            canTouch = true;
            // Apply an upward velocity for the bat to 'flap' upward (addForce was problematic since it continuously adds force leading to inconsistent jumps)
            Matter.Body.setVelocity(bat, {x: bat.velocity.x, y: -8});
        }  
    });

    // Update the game engine every frame
    Matter.Engine.update(engine, time.delta);

    // Move the pipes and replace if off-screen
    Object.keys(entities).forEach(key => {
        if(key.indexOf("pipe") === 0 && entities.hasOwnProperty(key)){ // Make sure entity exists
            Matter.Body.translate(entities[key].body, {x: -2, y:0});

            // Look for second pipe
            if(parseInt(key.replace("pipe", "")) % 2 === 0){
                // Scoring system
                if(entities[key].body.position.x <= bat.position.x && !entities[key].scored){
                    entities[key].scored = true;
                    dispatch({type: "add-score"});
                }

                // Check if pipe is off-screen
                if(entities[key].body.position.x <= -1 * (Constants.PIPE_WIDTH / 2)){
                    let pipeIndex = parseInt(key.replace("pipe", ""));
                    // Delete old pipes
                    delete(entities["pipe" + (pipeIndex - 1)]);
                    delete(entities["pipe" + pipeIndex]);

                    // Add a new pipe
                    addPipesAtLocation((Constants.MAX_WIDTH * 2) - (Constants.PIPE_WIDTH / 2), world, entities);
                }
            }
            
        }
        // Find the entity with key floor
        else if (key.indexOf("floor") === 0){
            // Check where the floor position is, and if half-way out of bounds, reset it
            if(entities[key].body.position.x <= -1 * Constants.MAX_WIDTH / 2){
                Matter.Body.setPosition(entities[key].body, { x: Constants.MAX_WIDTH + (Constants.MAX_WIDTH / 2), y: entities[key].body.position.y})
            }
            else{
                Matter.Body.translate(entities[key].body, {x: -2, y:0});
            }
        }
    })

    // Increase frame counter each time Physics is called (once per frame)
    frame += 1;
    // For every 5 frames, change the 'pose' of the bat (sprite animation)
    if(frame % 5 === 0){
        // Change pose per 5 frames to animate bat
        pose = pose + 1;
        // Check if final pose is reached, then set back to 1
        if (pose > 3){
            pose = 1;
        }

        // Set the pose property of the bat (which image to display)
        entities.bat.pose = pose;
    }

    // Return the entities updated to act under physics
    return entities;
}

export default Physics;