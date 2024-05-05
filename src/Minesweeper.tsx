import React, { useState, useEffect, useRef } from 'react';
import './Minesweeper.css'

// Constants
type Seed = [width: number, height: number, minesCount: 0]; //mineLocations: Set<number>];
const gridDataInit: any[] = [];
const INITIAL_STATE = {
    gameOver: false,
    gameState: "Please enter {width of grid, height, number of mines}, e.g. {3,3,1}:",
    gameWon: false,
    gridData: gridDataInit,
    height: 0,
    minesCount: 0,
//    mineLocations: new Set(),
    revealed: [],
    width: 0
};

interface GridSquareProps {
    contextMenu: any;
    /** The grid index of this square (ordinal) */
    key: any;
    index: any[];
    /** Boolean indicating whether this square is mined or not */
    isExplosive: boolean;
    isFlagged: any;
    /** The nearby mines count to display */
    nearbyMinesCount: number;
    neighbour: any;
    /** Boolean indicating whether this square has been uncovered */
    isUncovered: boolean;
    // value: any;
    /** Callback fired when this grid square is clicked */
    onClick: (index: any) => any;
}
// GridSquare Component
const GridSquare = (props: GridSquareProps) => {
    const {contextMenu, index, isExplosive, isFlagged, isUncovered, neighbour, onClick} = props;

    // console.log(props.isExplosive);
    
    const getClassName = (): string => {
        return "grid-square" +
            (isUncovered ? "" : " is-hidden") +
            (isExplosive ? " is-mine" : "") +
            (isFlagged ? " is-flag" : "");
    }

    const getValue = () => {
        if (!isUncovered) return isFlagged ? "🚩" : null;
        if (isExplosive) return "💣";
        if (neighbour === 0) return null;
        return neighbour;
    };

    return (
        <div
            onClick={() => {onClick(index)}}
            className={getClassName()}
            onContextMenu={contextMenu}
        >
            {getValue()}
        </div>
    );
}

// Grid Component
const Grid = (props: {
    state: any,
    onStateChange: any
}) => {
    const state = props.state;
    // console.log('props', props);

    const createEmptyArray = (height, width) => {
        let data: any[] = [];
        for (let i = 0; i < height; i++) {
            data.push([]);
            for (let j = 0; j < width; j++) {
                data[i][j] = {
                    x: i,
                    y: j,
                    isExplosive: false,
                    neighbour: 0,
                    isUncovered: false,
                    isEmpty: false,
                    isFlagged: false,
                };
            }
        }
        return data;
    }

    const traverseGrid = (x, y, data: any) => {     // returns neighbouring squares
        const el: any[] = [];

        // up
        if (x > 0) {
            el.push(data[x - 1][y]);
        }

        // down
        if (x < state.height - 1) {
            el.push(data[x + 1][y]);
        }

        // left
        if (y > 0) {
            el.push(data[x][y - 1]);
        }

        // right
        if (y < state.width - 1) {
            el.push(data[x][y + 1]);
        }

        // top left
        if (x > 0 && y > 0) {
            el.push(data[x - 1][y - 1]);
        }

        // top right
        if (x > 0 && y < state.width - 1) {
            el.push(data[x - 1][y + 1]);
        }

        // bottom left
        if (x < state.height - 1 && y > 0) {
            el.push(data[x + 1][y - 1]);
        }

        // bottom right
        if (x < state.height - 1 && y < state.width - 1) {
            el.push(data[x + 1][y + 1]);
        }

        return el;
    };

    const getRandomNumber = (dimension) => Math.floor((Math.random() * 1000) + 1) % dimension;

    const plantMines = (data, height, width, minesCount) => {
        let randomX, randomY, minesPlanted = 0;
        while (minesPlanted < minesCount) {
            randomX = getRandomNumber(width);
            randomY = getRandomNumber(height);
            if (!(data[randomX][randomY].isExplosive)) {
                data[randomX][randomY].isExplosive = true;
                minesPlanted++;
            }
        }
        return (data);
    };

    const nearbyMinesCount = (index: any[]): Number => {
        let i = index[0];
        let j = index[1];
        return (props.state.gridData && props.state.gridData.length > 0) 
            ? props.state.gridData[i][j].neighbour : 0;
    };

    const determineNearbyMines = (gridWithMinesPlanted, height, width) => {
        let gridcopy = gridWithMinesPlanted;
        for(let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                if (gridWithMinesPlanted[i][j].isExplosive !== true) {
                    let mine = 0;
                    const area = traverseGrid(
                        gridWithMinesPlanted[i][j].x, 
                        gridWithMinesPlanted[i][j].y, gridWithMinesPlanted
                    );
                    area.map((value: any) => {
                        if(value.isExplosive) mine++;
                    });
                    if(mine === 0) gridcopy[i][j].isEmpty = true;
                    gridcopy[i][j].neighbour = mine;
                }
            }
        }
        return (gridcopy);
    };
    
    const getMines = (data) => {
        let mines: any[] = [];
        data.map(datarow => {
            datarow.map((dataitem: any) => {
                if(dataitem.isExplosive) mines.push(dataitem);
            });
        });
        return mines;
    };

    const getFlags = (data) => {
        let flags: any[] = [];
        data.map(datarow => {
            datarow.map((dataitem) => {
                if (dataitem.isFlagged) flags.push(dataitem);
            });
        });
        return flags;
    };

    const determineHiddenSquares = (data) => {
        let hiddenSquares: any[] = [];
        data.map(datarow => {
            datarow.map((dataitem) => {
                if (!dataitem.isUncovered)  hiddenSquares.push(dataitem);
            });
        });
        return hiddenSquares;
    };

    const revealGrid = () => {
        let updatedData = state.gridData;
        updatedData.map((datarow) => {
            datarow.map((dataitem) => dataitem.isUncovered = true);
        });
        props.onStateChange({
            gridData: updatedData
        });
    };

    const revealEmpty = (x, y, data) => {
        traverseGrid(x, y, data).map(value => {
            if (!value.isFlagged && !value.isUncovered && (value.isEmpty || !value.isExplosive)) {
                data[value.x][value.y].isUncovered = true;
                if (value.isEmpty) revealEmpty(value.x, value.y, data);
            }
        });
        return data;
    };

    const _initGridData = (height, width, minesCount): any[] => {
        let emptyGrid = createEmptyArray(height, width);
        let gridWithMinesPlanted = plantMines(emptyGrid, height, width, minesCount);
        return determineNearbyMines(gridWithMinesPlanted, height, width);
    }; 

    const _startGame = () => {
        let gridDataGenerated = _initGridData(props.state.height, props.state.width, props.state.minesCount);
        props.onStateChange({
                gridData: gridDataGenerated,
                gameState: "Game in progress",
                minesCount: state.minesCount
        });
    }
    
    useEffect(() => {
        if(state.gameState=='start') _startGame();
    },[state]);
    
    const _handleGridSquareClick = (index) => {
        let x = index[0];
        let y = index[1];
        if (state.gameOver || state.gameWon || state.gridData[x][y].isUncovered || state.gridData[x][y].isFlagged) return null; // state.revealed.includes(index)
        if (state.gridData[x][y].isExplosive) { // state.mineLocations.has(index))
            props.onStateChange({
                gameState: "Game over",
                gameOver: true
            });
            revealGrid();
            alert("Game over");
        }
        let updatedData = state.gridData;
        updatedData[x][y].isFlagged = false;
        updatedData[x][y].isUncovered = true;
        // else { revealSquare(index);
        if (updatedData[x][y].isEmpty) updatedData = revealEmpty(x, y, updatedData);
        if (determineHiddenSquares(updatedData).length === state.minesCount) {
            props.onStateChange({ 
                minesCount: 0,
                gameState: "You win",
                gameWon: true
            });
            revealGrid();
        }
        props.onStateChange({
            gridData: updatedData,
            minesCount: state.minesCount - getFlags(updatedData).length
        });
    };

    const _handleContextMenu = (e, index) => {
        e.preventDefault();
        let x = index[0];
        let y = index[1];
        let updatedData = state.gridData;
        let mines = state.minesCount;
        if (updatedData[x][y].isUncovered) return;
        if (updatedData[x][y].isFlagged) {
            updatedData[x][y].isFlagged = false;
            mines++;
        } else {
            updatedData[x][y].isFlagged = true;
            mines--;
        }
        if (mines === 0 || isNaN(mines)) {
            const mineArray = getMines(updatedData);
            const FlagArray = getFlags(updatedData);
            if (JSON.stringify(mineArray) === JSON.stringify(FlagArray)) {
                props.onStateChange({
                    minesCount: 0,
                    gameState: "You win",
                    gameWon: true
                });
                revealGrid();
            }
        } ;
        props.onStateChange({
            minesCount: mines,
            gridData: updatedData
        });
    };

    const generateKey = (index: any[]) => 
        index[0] * props.state.width + index[1];

    const isFlagged = (index: any[]) => 
        props.state && props.state.gridData && props.state.gridData.length > 0 ? props.state.gridData[index[0]][index[1]].isFlagged : false;

    const isNeighbour = (index: any[]) => 
        props.state && props.state.gridData && props.state.gridData.length > 0 ? props.state.gridData[index[0]][index[1]].isFlagged : false;

    const isUncovered = (index: any[]) => 
        props.state && props.state.gridData && props.state.gridData.length > 0 
        && props.state.gridData[index[0]][index[1]].isRevealed ? props.state.gridData[index[0]][index[1]].isRevealed.includes(index) : false;

    const isExplosive = (index: any[]) => 
        props.state && props.state.gridData && props.state.gridData.length > 0 
        && props.state.gridData[index[0]][index[1]].mineLocations ? props.state.gridData[index[0]][index[1]].mineLocations.has(index) : false;

    return (
        <div id="minefield" className="minefield" style={{ gridTemplateColumns: `repeat(${props.state.width}, 1fr)` }}>
            {Array.from({ length: props.state.width}, (_, w_index) => 
                Array.from({ length: props.state.height }, (_, h_index) => {     
                    return (
                        <GridSquare
                            onClick={() => _handleGridSquareClick([w_index, h_index])}
                            index={[w_index, h_index]}
                            isFlagged={isFlagged([w_index, h_index])}
                            key={generateKey([w_index, h_index])}
                            contextMenu={(e) => _handleContextMenu(e, [w_index, h_index])}
                            isExplosive={isExplosive([w_index, h_index])}
                            nearbyMinesCount={nearbyMinesCount([w_index, h_index])}
                            neighbour={isNeighbour([w_index, h_index])}
                            isUncovered={isUncovered([w_index, h_index])}
                        /> 
                    )
                })
            )}
        </div>
    );
}

// GameSeedInput Component
interface GameSeedProps {
    state: any, 
    defaultValue: string,
    onStateChange: any
}
const GameSeedInput = (props: GameSeedProps) => {
    const [val, setVal] = useState(props.defaultValue);

    const isNumeric = (str) => {
        if (typeof str != "string") return false
        return !isNaN(parseFloat(str)) 
    };
    
    const processSeed = (seed: string): Seed|null => {
        let splitSeed = seed.split(",");
        if(splitSeed.length < 3) return null;
        for(let s in splitSeed) {
            if(!isNumeric(splitSeed[s])) return null;
        }
        const [width, height, ...mineIndices] = splitSeed;
        return [
            Number(width),
            Number(height),
            Number(mineIndices) // new Set<number>(mineIndices.map(Number)),
        ] as Seed;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setVal(e.target.value);

    const handleSeedButtonClick = () => {
        let processed: Seed|null = processSeed(val);
        if(processed !== null) props.onStateChange({
            gameState: 'start',
            height: processed[0],
            width: processed[1],
            minesCount: processed[2]
        });
    };

    return (
      <div id="game-seed-input">
        <input
          id="game-seed-input-input"
          type="text"
          onChange={handleInputChange}
          placeholder={"Game Seed"}
          defaultValue={props.defaultValue}
          
        />
        <button
          id="game-seed-input-button"
          onClick={handleSeedButtonClick}
        >
          Play
        </button>
      </div>
    );
};

const GameOver = ({
    restartGame,
    wonOrLost,
}: {
    restartGame: () => void;
    wonOrLost: "won" | "lost";
}) => {
    return (
        <div onClick={() => restartGame()} id="minesweeper-game-over">
            You {wonOrLost === "lost" ? "Lost" : "Won"} - Click to restart
        </div>
    );
};

// Minesweeper Component
function Minesweeper(props) {  
    const [state, setState] = React.useState(INITIAL_STATE);

    const onStateChange = (newState: any) => {
        setState(prevState => (
            {...prevState, ...newState}
        ));
    }

    const restartGame = () => {
        setState(INITIAL_STATE);
    };

    // console.log(state);

    return (
        <div id="minesweeper-main">
            <h1 id="minesweeper-title">Minesweeper</h1>
            <p className="info">{state.gameState}</p>
            <GameSeedInput 
                state={state} 
                defaultValue={"3,3,1"}
                onStateChange={onStateChange}
            />
            <div className="game-area">
                {
                    state.height && (
                    <div className="game-info">
                        <p className="info"><span className="heading">Grid:</span> {state.height} x {state.width}</p>
                        <p className="info"><span className="heading">Mines remaining:</span> {state.minesCount}</p>
                    </div>
                    ) || (<p className="info">^ Please start the game</p>)
                }
            </div>
            {/* {JSON.stringify(state)} */}
            <Grid 
                state={state}
                onStateChange={onStateChange}
            />
            {/* Render GameOver component if game is over */}
            {(state.gameOver || state.gameWon) && (
              <GameOver
                restartGame={restartGame}
                wonOrLost={state.gameWon ? "won" : "lost"}
              />
            )}
        </div>
    );
}

export default Minesweeper