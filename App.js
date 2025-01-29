import { StyleSheet, Text, Image, Pressable } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Game from './Game';
import { SafeAreaView } from 'react-native-safe-area-context';
import Images from './assets/Images';
import Constants from './Constants';
import { useFonts } from 'expo-font';

const Stack = createStackNavigator();

// Returns the Game component for the game screen
function GameScreen({navigation}) {
  return (
    // Pass the navigation object as a prop so that one can return to the homescreen with a button click
    <Game navigation={navigation}/>
  )
}

// Returns the home screen
function HomeScreen({navigation}) {
  return (
      <SafeAreaView style={styles.homeScreen}>
        <Image source={Images.background1} style={styles.backgroundImage} resizeMode="stretch"/>
        <Image source={Images.background2} style={styles.backgroundImage} resizeMode="stretch"/>
        <Text style={styles.homeText}>Flappy Bat</Text>
        <Pressable style={( { pressed } ) => { return { opacity: pressed ? 0.5 : 1 }}} 
                  onPress={ () => navigation.navigate("Game") }
        >
          <Image source={Images.playButton} style={styles.buttonImage} resizeMode='stretch'/>
        </Pressable>
        <Pressable style={( { pressed } ) => { return { opacity: pressed ? 0.5 : 1 }}} 
                  onPress={ () => navigation.navigate("HowToPlay") }
        >
          <Image source={Images.htpButton} style={styles.buttonImage} resizeMode='stretch'/>
        </Pressable>
        <Text style={styles.homeSubText}>Original art assets created by: PoorGameDev/Demonstick Games and MegaCrash. Available on itch.io</Text>
        <Image source={Images.floor} style={styles.floorImage} resizeMode="stretch"/>
      </SafeAreaView>
  )
}

// Returns the how to play screen (game rules and controls)
function HowToPlayScreen({navigation}) {
  return (
      <SafeAreaView style={styles.htpScreen}>
        <Image source={Images.background1} style={styles.backgroundImage} resizeMode="stretch"/>
        <Image source={Images.background2} style={styles.backgroundImage} resizeMode="stretch"/>
        <Text style={styles.htpTitle}>Game Rules:</Text>
        <Text style={styles.htpSubText}>Your goal is to keep the bat from falling to the ground or crashing into pillars. Flap between the pillars to keep going!</Text>
        <Text style={styles.htpSubText}>You score a point for every set of pillars you pass.</Text>
        <Text style={styles.htpTitle}>Game Controls:</Text>
        <Text style={styles.htpSubText}>Tap the screen to flap up!</Text>
        <Pressable style={( { pressed } ) => { return { opacity: pressed ? 0.5 : 1 }}} 
                onPress={ () => navigation.goBack() }
        >
          <Image source={Images.backButton} style={styles.buttonImage} resizeMode='stretch'/>
        </Pressable>
      </SafeAreaView>
  )
}

export default function App() {
  const [loaded] = useFonts({
    joystix: require('./assets/fonts/joystix.otf')
  })

  if(!loaded){
    return null;
  }

  return (
    <NavigationContainer>
        <Stack.Navigator>
            <Stack.Screen options={{ headerShown: false}} name="Home" component={HomeScreen} />
            <Stack.Screen options={{ headerShown: false}} name="Game" component={GameScreen} />
            <Stack.Screen options={{ headerShown: false}} name="HowToPlay" component={HowToPlayScreen} />
        </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  backgroundImage: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: Constants.MAX_WIDTH,
    height: Constants.MAX_HEIGHT
  },

  homeText: {
    textAlign: 'center',
    fontFamily: 'joystix',
    marginBottom: 20,
    fontSize: 50,
    color: '#FFA07A'
  },

  homeSubText: {
    textAlign: 'center',
    fontFamily: 'joystix',
    fontSize: 8,
    color: '#FFA07A',
    marginHorizontal: 10
  },

  htpTitle: {
    textAlign: 'center',
    fontFamily: 'joystix',
    margin: 20,
    fontSize: 30,
    color: '#FFA07A'
  },

  htpSubText: {
    textAlign: 'center',
    fontFamily: 'joystix',
    fontSize: 15,
    color: '#FFA07A'
  },

  floorImage: {
    position: 'absolute',
    bottom: 0,
    width: Constants.MAX_WIDTH,
    height: 50
  },

  buttonImage: {
    width: 200,
    height: 200
  },

  homeScreen: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },

  htpScreen: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
});