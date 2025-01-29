import React, {Component} from "react";
import { View, Image } from "react-native";
import Images from "../assets/Images";

// The entities (game objects) for the game were learnt about and implimented via the aid of tutorials by Tamas Szikszai, available at links:
// https://www.youtube.com/watch?v=qBGnfULn8W4
// https://www.youtube.com/watch?v=XzLekeXt-Bg

// My own amendments have been made to the code to include other art assets aquired from
// itch.io (resourced in the project report). 

export default class Floor extends Component {
    render() {
        // Set properties of the bat (size and position)
        const width = this.props.body.bounds.max.x - this.props.body.bounds.min.x;
        const height = this.props.body.bounds.max.y - this.props.body.bounds.min.y;
        const x = this.props.body.position.x - width / 2;
        const y = this.props.body.position.y - height / 2;

        const imageIterations = Math.ceil(width / height);

        // Return the bat's properties
        return(
            <View 
                style={{
                    position: 'absolute',
                    top: y,
                    left: x,
                    width: width,
                    height: height,
                    //backgroundColor: 'white', // Check hitbox size
                    overflow: 'hidden',
                    flexDirection: 'row'
                }}>

                {Array.apply(null, Array(imageIterations)).map((e, i) => {
                    return <Image style={{width: width, height: height}} key={i} resizeMode="stretch" source={Images.floor}/>
                })}
            </View>
        )
    }
}