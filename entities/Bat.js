import React, {Component} from "react";
import { View, Image, Animated } from "react-native";
import Images from "../assets/Images";

// The entities (game objects) for the game were learnt about and implimented via the aid of tutorials by Tamas Szikszai, available at links:
// https://www.youtube.com/watch?v=qBGnfULn8W4
// https://www.youtube.com/watch?v=XzLekeXt-Bg

// My own amendments have been made to the code to include other art assets aquired from
// itch.io (resourced in the project report). 

export default class Bat extends Component {
    constructor(props){
        super(props);

        // Get the velocity of the y axis so that the bat's rigidbody can rotate depending on how fast it falls
        this.animatedValue = new Animated.Value(this.props.body.velocity.y);
    }

    render() {
        // Set properties of the bat (size and position)
        const width = this.props.body.bounds.max.x - this.props.body.bounds.min.x;
        const height = this.props.body.bounds.max.y - this.props.body.bounds.min.y;
        const x = this.props.body.position.x - width / 2;
        const y = this.props.body.position.y - height / 2;

        this.animatedValue.setValue(this.props.body.velocity.y);
        let rotation = this.animatedValue.interpolate({
            inputRange: [-10, 0, 10, 20],
            outputRange: ['-20deg', '0deg', '15deg', '45deg'],
            extrapolate: 'clamp'
        })

        let image = Images["bat" + this.props.pose];

        // Return the bat's properties
        return(
            <Animated.Image 
                style={{
                    position: 'absolute',
                    top: y,
                    left: x,
                    width: width,
                    height: height,
                    //backgroundColor: 'white' // Check hitbox size
                    transform: [{rotate: rotation}]
                }}
                resizeMode="stretch"
                source={image}
            />
        )
    }
}