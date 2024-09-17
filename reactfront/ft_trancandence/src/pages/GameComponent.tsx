import React, { useState } from 'react'
import { Stage, Layer, Star, Text, Rect, Circle, Line } from 'react-konva';
import { useEffect } from 'react';

const WIDTH :  number =  800;
const HEIGHT :  number =  500;
const BALL_HIEGHT : number = 8;
const RACETE_HEIGHT : number = 60;
const RACETE_WIDTH : number = 7;

const GameComponent = () => {


    const [leftrectY, setLeftRect] = useState<number>(window.innerHeight/2 - RACETE_HEIGHT/2)
    const [rightrectY, setRightRect] = useState<number>(window.innerHeight/2 - RACETE_HEIGHT/2)


    useEffect(() => {
        
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowUp') {
                setLeftRect(prevY => prevY - 10);
            }
            if (event.key === 'ArrowDown') {
                setLeftRect(prevY => prevY + 10);
            }
            if (event.key === 'w') {
                setRightRect(prevY => prevY - 10);
            }
            if (event.key === 's') {
                setRightRect(prevY => prevY + 10);
            } 
        }
        window.addEventListener('keydown', handleKeyDown);
    }  , []);


  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Rect
          x={(window.innerWidth / 2)- WIDTH / 2}
          y={(window.innerHeight / 2) - HEIGHT / 2}
          width={WIDTH}
          height={HEIGHT}
          fill="white"
          cornerRadius={10}
        />
        <Rect
          x={(window.innerWidth / 2) - WIDTH/2}
          y={leftrectY}
          width={RACETE_WIDTH}
          height={RACETE_HEIGHT}
          fill="gray"
          cornerRadius={50}
        />
        <Rect
          x={(window.innerWidth / 2) + WIDTH/2 - 7}
          y={rightrectY}
          width={RACETE_WIDTH}
          height={RACETE_HEIGHT}
          fill="gray"
          cornerRadius={50}
        />

        <Circle
            x={window.innerWidth/2}
            y={window.innerHeight/2}
            radius={BALL_HIEGHT}
            fill="gray"
        />
      </Layer>
    </Stage>
  )
}

export default GameComponent