import React, {Component} from "react";
import { StyleSheet, Text, View, Pressable, SafeAreaView, Image, Dimensions, Platform } from "react-native";
import Constants from './Constants.js';
import { GameEngine } from "react-native-game-engine";
import Matter from "matter-js";
import Bat from './entities/Bat.js';
import Floor from "./entities/Floor.js";
import Physics, {resetPipes} from "./physics.js";
import Images from "./assets/Images.js";
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScrollingBackground from "react-native-scrolling-images";

// Much of the game logic was learnt and implimented via the aid of tutorials by Tamas Szikszai, available at links:
// https://www.youtube.com/watch?v=qBGnfULn8W4
// https://www.youtube.com/watch?v=XzLekeXt-Bg

// Aspects to the code were amended by me to fit the purposes of the application better, 
// as well as further additions to the code to implement new techniques and components not 
// covered by the tutorials for the purposes of the final project. Detials can be read in
// the project report regarding my extentions from the section titled 
// 'Extending the application to include techniques from the module'. 

export default class Game extends Component {
  //class states (much like useState, except use in function contructor format)
  state = {
    running: true,
    score: 0,
    highScore: 0
  }

  constructor(props) {
    super(props);
    // Reference to the game engine
    this.gameEngine = null;
    // The game entities (game objects)
    this.entities = this.setupWorld();
    // Retrieve high score data from AsyncStorage
    this.getHighScore();
  }

  setupWorld = () => {
    // Initialise the game engine
    let engine = Matter.Engine.create({enableSleeping: false});
    // Initialise the game world
    let world = engine.world;
    // Set initial gravity - idle state before first touch
    engine.gravity.y = 0.0;

    // Create the bat game object (the playable character)
    let bat = Matter.Bodies.rectangle(Constants.MAX_WIDTH / 3, Constants.MAX_HEIGHT / 2, Constants.BAT_WIDTH, Constants.BAT_HEIGHT);
    bat.restitution = 20;
    // Create the floor objects - second floor is to provide a smooth animation when the floor moves (so the first picture can reset whilst the second continues to move, and so on)
    let floor1 = Matter.Bodies.rectangle(Constants.MAX_WIDTH / 2, Constants.MAX_HEIGHT - 25, Constants.MAX_WIDTH + 4, 50, {isStatic: true});
    let floor2 = Matter.Bodies.rectangle(Constants.MAX_WIDTH + (Constants.MAX_WIDTH / 2), Constants.MAX_HEIGHT - 25, Constants.MAX_WIDTH + 4, 50, {isStatic: true});

    // Add the entities (matter bodies/game objects) to the world
    Matter.World.add(world, [bat, floor1, floor2]);

    // Collision detection in matter.js
    Matter.Events.on(engine, "collisionStart", (event) => {
      //dispatch -> send a message to an 'outside' function
      this.gameEngine.dispatch({type: "game-over"});
    });

    // Return a game engine object
    return {
      physics: {engine: engine, world: world},
      floor1: {body: floor1, renderer: Floor},
      floor2: {body: floor2, renderer: Floor},
      bat: {body: bat, pose: 1, renderer: Bat},
    }
  }

  // Handle collision event (set running state to 'game-over' to stop the game)
  onEvent = async (e) => {
    if(e.type === "game-over"){
      // Vibrate device for physical feedback of game ending
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
      // Stop the game from running
      this.setState({running: false});
    }

    else if (e.type === "add-score")
    {
      // Increment score
      this.setState({score: this.state.score + 1});

      // Store new highscore if it is beaten
      if(this.state.score > this.state.highScore)
      {
        try {
          //console.log("New High Score");
          // Update the highscore text
          this.setState({highScore: this.state.score });
          // Stringify score for storage
          let valueToStore = JSON.stringify(this.state.score);
          // Store new high-score
          await AsyncStorage.setItem('highScore', valueToStore);
        } catch(e) {
          console.log(e);
        }
      }
    }
  }

  // Retrieve the stored high score
  getHighScore = async () => {
    try {
      const value = await AsyncStorage.getItem('highScore');
      if(value != null)
      {
        // Set value to be an integer
        let valueAsInt = parseInt(value);
        // Set the highScore state
        this.setState({highScore: valueAsInt});
        //console.log(this.state.highScore);
      }
    } catch(e) {
      console.log(e);
    }
  }

  // Reset the game for a new playthrough
  reset = () => {
    resetPipes();
    this.gameEngine.swap(this.setupWorld());
    this.setState({running: true});
    this.setState({score: 0});
  }

  // Render what needs to be displayed to screen
  render(){
    return (
      <SafeAreaView style={styles.conatiner}>
        <ScrollingBackground style={styles.scrollingBackground} speed={30} direction={"left"} images={[Images.scrollingBG]} useNativeDriver={false}/>
        <Image source={Images.background2} style={styles.foregroundImage} resizeMode="stretch"/>
        <GameEngine
          // Reference to the game engine
          ref={(ref) => {this.gameEngine = ref;}}
          // Styling for the GameEngine component
          style={styles.gameContainer}
          // Include physics in the engine
          systems={[Physics]}
          // Check game state (running or game over)
          running={this.state.running}
          onEvent={this.onEvent}
          // Include the entities in the game engine
          entities={this.entities}
          >
        </GameEngine>
        <Text style={styles.score}>Score: {this.state.score}</Text> 
        {!this.state.running ? 
          <View style={styles.fullScreen}>
            <Text style={styles.gameOverText}>Game Over</Text>
            <Text style={styles.gameOverSubText}>Your score: {this.state.score}</Text>
            <Text style={styles.gameOverSubText}>HI SCORE: {this.state.highScore}</Text>
            <Pressable style={[{top: '25%'}, ( { pressed } ) => { return { opacity: pressed ? 0.5 : 1 }}]} 
                  onPress={this.reset}
            >
              <Image source={Images.restartButton} style={styles.restartButtonImage} resizeMode='stretch'/>
            </Pressable>
            <Pressable style={[{top: '15%'}, ( { pressed } ) => { return { opacity: pressed ? 0.5 : 1 }}]} 
                  onPress={() => this.props.navigation.navigate("Home")}
            >
              <Image source={Images.homeButton} style={styles.homeButtonImage} resizeMode='stretch'/>
            </Pressable>
          </View>
          
        : null}
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  conatiner: {
    flex: 1,
    flexDirection:'row',
    backgroundColor: '#fffffff',
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%"
  },

  scrollingBackground: {
    backgroundColor: "black"
  },

  foregroundImage: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: Constants.MAX_WIDTH,
    height: Constants.MAX_HEIGHT
  },

  gameContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },

  restartButtonImage: {
    width: 200,
    height: 200,
  },

  homeButtonImage: {
    width: 200,
    height: 200,
  },

  fullScreen: {
    flex: 1,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'black',
    alignItems: 'center',
    opacity: 0.85
  },

  gameOverText: {
    textAlign: 'center',
    fontFamily: 'joystix',
    color: '#FFA07A',
    fontSize: 50,
    margin: 10,
    top: '20%',
  },

  gameOverSubText: {
    textAlign: 'center',
    fontFamily: 'joystix',
    margin: 10,
    color: '#CD5C5C',
    fontSize: 25,
    top: '22.5%',
  },

  score: {
    position: 'absolute',
    top: (Platform.OS === 'android') ? '5%' : '10%',
    fontFamily: 'joystix',
    color: 'white',
    fontSize: 30,
    left: Dimensions.get("screen").width / 12,
    textShadowColor: '#444444',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 2
  }
});
