import React, { useState, useEffect } from 'react';
import './Game.css'

// Constants
const gridDataInit: any[] = [];
const INITIAL_STATE = {
    gameOver: false,
    gameState: "Loading . . .",
    gameWon: false,
    gridData: gridDataInit,
    height: 0,
    mineCount: 0,
    mineLocations: new Set(),
    revealed: [],
    width: 0
};

interface GridSquareProps {
    onClick: (index: any) => any;
    index: number;
    value: any;
    cMenu: any;
}
// GridSquare Class
const GridSquare = (props: GridSquareProps) => {
    const {onClick, index, value, cMenu} = props;
    
    const getClassName = (): string => {
        return "grid-square" +
            (value.isRevealed ? "" : " is-hidden") +
            (value.isMine ? " is-mine" : "") +
            (value.isFlagged ? " is-flag" : "");
    }
    const getValue = () => {
        if (!value.isRevealed) {
            return props.value.isFlagged ? "🚩" : null;
        }
        if (value.isMine) {
            return "💣";
        }
        if (value.neighbour === 0) {
            return null;
        }
        return value.neighbour;
    };

    return (
        <div
            onClick={() => {
                onClick(index);
            }}
            className={getClassName()}
            onContextMenu={cMenu}
        >
            {getValue()}
        </div>
    );
}

// Grid Class
interface GridProps {
  height: number;
  width: number;
  mines: any;
}
const Grid = (props: GridProps) => {
    const {height, width, mines} = props;

    const createEmptyArray = (height, width) => {
        let data: any[] = [];
        for (let i = 0; i < height; i++) {
            data.push([]);
            for (let j = 0; j < width; j++) {
                data[i][j] = {
                    x: i,
                    y: j,
                    isMine: false,
                    neighbour: 0,
                    isRevealed: false,
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
        if (x < props.height - 1) {
            el.push(data[x + 1][y]);
        }

        // left
        if (y > 0) {
            el.push(data[x][y - 1]);
        }

        // right
        if (y < props.width - 1) {
            el.push(data[x][y + 1]);
        }

        // top left
        if (x > 0 && y > 0) {
            el.push(data[x - 1][y - 1]);
        }

        // top right
        if (x > 0 && y < props.width - 1) {
            el.push(data[x - 1][y + 1]);
        }

        // bottom left
        if (x < props.height - 1 && y > 0) {
            el.push(data[x + 1][y - 1]);
        }

        // bottom right
        if (x < props.height - 1 && y < props.width - 1) {
            el.push(data[x + 1][y + 1]);
        }

        return el;
    };

    const getRandomNumber = (dimension) => {
        return Math.floor((Math.random() * 1000) + 1) % dimension;
    };

    const plantMines = (data, height, width, mines) => {
        let randomx, randomy, minesPlanted = 0;

        while (minesPlanted < mines) {
            randomx = getRandomNumber(width);
            randomy = getRandomNumber(height);
            if (!(data[randomx][randomy].isMine)) {
                data[randomx][randomy].isMine = true;
                minesPlanted++;
            }
        }
        return (data);
    };

    const getNeighbours = (data, height, width) => {
        let updatedData = data, index = 0;

        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                if (data[i][j].isMine !== true) {
                    let mine = 0;
                    const area = traverseGrid(data[i][j].x, data[i][j].y, data);
                    area.map((value: any) => {
                        if (value.isMine) {
                            mine++;
                        }
                    });
                    if (mine === 0) {
                        updatedData[i][j].isEmpty = true;
                    }
                    updatedData[i][j].neighbour = mine;
                }
            }
        }
        return (updatedData);
    };

    const initGridData = (height, width, mines): any[] => {
        let data = createEmptyArray(height, width);
        data = plantMines(data, height, width, mines);
        data = getNeighbours(data, height, width);
        return data;
    }; 

    const [state, setState] = React.useState(INITIAL_STATE);
    useEffect(() => {
        setState(prevState => ({
            ...prevState, 
                gridData: initGridData(height, width, mines),
                gameState: "Game in progress",
                mineCount: mines
        }));
    }, []);
    
    const getMines = (data) => {
        let mineArray: any[] = [];

        data.map(datarow => {
            datarow.map((dataitem: any) => {
                if (dataitem.isMine) {
                    mineArray.push(dataitem);
                }
            });
        });
        return mineArray;
    };

    const getFlags = (data) => {
        let mineArray: any[] = [];

        data.map(datarow => {
            datarow.map((dataitem) => {
                if (dataitem.isFlagged) {
                    mineArray.push(dataitem);
                }
            });
        });

        return mineArray;
    };

    const getHidden = (data) => {
        let mineArray: any[] = [];

        data.map(datarow => {
            datarow.map((dataitem) => {
                if (!dataitem.isRevealed) {
                    mineArray.push(dataitem);
                }
            });
        });

        return mineArray;
    };

    const revealGrid = () => {
        let updatedData = state.gridData;
        updatedData.map((datarow) => {
            datarow.map((dataitem) => {
                dataitem.isRevealed = true;
            });
        });
        setState(prevState => ({
            ...prevState, 
            gridData: updatedData
        }));
    };

    const revealEmpty = (x, y, data) => {
        let area = traverseGrid(x, y, data);
        area.map(value => {
            if (!value.isFlagged && !value.isRevealed && (value.isEmpty || !value.isMine)) {
                data[value.x][value.y].isRevealed = true;
                if (value.isEmpty) {
                    revealEmpty(value.x, value.y, data);
                }
            }
        });
        return data;
  };
  
  const _handleGridSquareClick = (x, y) => {
        if (state.gridData[x][y].isRevealed || state.gridData[x][y].isFlagged) return null;
        if (state.gridData[x][y].isMine) {
            setState(prevState => ({
                ...prevState, 
                gameState: "Game over."
            }));
            revealGrid();
            alert("Game over");
        }
        let updatedData = state.gridData;
        updatedData[x][y].isFlagged = false;
        updatedData[x][y].isRevealed = true;
        if (updatedData[x][y].isEmpty) {
            updatedData = revealEmpty(x, y, updatedData);
        }
        if (getHidden(updatedData).length === props.mines) {
            setState(prevState => ({
                ...prevState, 
                mineCount: 0
            }));
            setState(prevState => ({
                ...prevState, 
                gameState: "You win.."
            }));
            revealGrid();
            alert("You Win");
        }
        setState(prevState => ({
            ...prevState, 
            gridData: updatedData
        }));
        setState(prevState => ({
            ...prevState, 
            mineCount: props.mines - getFlags(updatedData).length
        }));
  };

  const _handleContextMenu = (e, x, y) => {
      e.preventDefault();
      let updatedData = state.gridData;
      let mines = state.mineCount;
      if (updatedData[x][y].isRevealed) return;
      if (updatedData[x][y].isFlagged) {
            updatedData[x][y].isFlagged = false;
            mines++;
      } else {
            updatedData[x][y].isFlagged = true;
            mines--;
      }
      if (mines === 0) {
            const mineArray = getMines(updatedData);
            const FlagArray = getFlags(updatedData);
            if (JSON.stringify(mineArray) === JSON.stringify(FlagArray)) {
                setState(prevState => ({
                    ...prevState, 
                    mineCount: 0
                }));
                setState(prevState => ({
                    ...prevState, 
                    gameState: "You win.."
                }));
                revealGrid();
                alert("You Win");
            }
      } ;
        setState(prevState => ({
            ...prevState, 
            mineCount: mines
        }));
        setState(prevState => ({
            ...prevState, 
            gridData: updatedData
        }));
    };

    return (
        <div className="game-area">
            <div className="game-info">
                <h1 className="info">{state.gameState}</h1>
                <span className="info">Mines remaining: {state.mineCount}</span>
            </div>
            <div className="minefield">
                {
                    state.gridData.map((datarow) => {
                        return datarow.map((dataitem) => {
                            return (
                                <div key={dataitem.x * datarow.length + dataitem.y}>
                                    <GridSquare
                                        onClick={() => _handleGridSquareClick(dataitem.x, dataitem.y)}
                                        index={parseInt("0")}
                                        value={dataitem}
                                        cMenu={(e) => _handleContextMenu(e, dataitem.x, dataitem.y)}
                                    />
                                    {(datarow[datarow.length - 1] === dataitem) ? <div className="clear" /> : ""}
                                </div>);
                        });
                    })
                }
            </div>
        </div>
    );
}

// Game Class
function Game(props) {  
    const { height, width, mines } = { height: 3, width: 3, mines: 1 }; //props;

    return (
        <div className="game">
            <Grid height={height} width={width} mines={mines} />
        </div>
    );
}

export default Game