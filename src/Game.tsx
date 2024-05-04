import React, { useState } from 'react';
import './Game.css'

const INITIAL_STATE = {
  width: 0,
  height: 0,
  mineLocations: new Set(),
  revealed: [],
  gameState: null,
  gameOver: false,
  gameWon: false,
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
    let className =
        "gridsquare" +
        (value.isRevealed ? "" : " is-hidden") +
        (value.isMine ? " is-mine" : "") +
        (value.isFlagged ? " is-flag" : "");

    return (
        <div
            onClick={() => {
                onClick(index);
            }}
            className={className}
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

    const initGridData = (height, width, mines) => {
        let data = createEmptyArray(height, width);
        data = plantMines(data, height, width, mines);
        data = getNeighbours(data, height, width);
        return data;
    };

    const [gridData, setGridData] = useState(initGridData(height, width, mines));
    const [gameStatus, setGameStatus] = useState("Game in progress");
    const [mineCount, setMineCount] = useState(mines);
    
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
        let updatedData = gridData;
        updatedData.map((datarow) => {
            datarow.map((dataitem) => {
                dataitem.isRevealed = true;
            });
        });
        setGridData(updatedData);
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
        if (gridData[x][y].isRevealed || gridData[x][y].isFlagged) return null;
        if (gridData[x][y].isMine) {
            setGameStatus("Game over.");
            revealGrid();
            alert("Game over");
        }

        let updatedData = gridData;
        updatedData[x][y].isFlagged = false;
        updatedData[x][y].isRevealed = true;

        if (updatedData[x][y].isEmpty) {
            updatedData = revealEmpty(x, y, updatedData);
        }
        if (getHidden(updatedData).length === props.mines) {
            setMineCount(0);
            setGameStatus("You win..");
            revealGrid();
            alert("You Win");
        }
        setGridData(updatedData);
        setMineCount(props.mines - getFlags(updatedData).length);

        console.log(gridData[x][y]);
  };

  const _handleContextMenu = (e, x, y) => {
      e.preventDefault();
      let updatedData = gridData;
      let mines = mineCount;
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
                setMineCount(0);
                setGameStatus("You win..");
                revealGrid();
                alert("You Win");
            }
      } ;
        setMineCount(mines);
        setGridData(updatedData);
    }

    const renderGrid = (data) => {
        return data.map((datarow) => {
            return datarow.map((dataitem) => {
                return (
                    <div  key={dataitem.x * datarow.length + dataitem.y}>
                        <GridSquare
                            onClick={() => _handleGridSquareClick(dataitem.x, dataitem.y)}
                            index={parseInt("0")}
                            value={dataitem}
                            cMenu={(e) => _handleContextMenu(e, dataitem.x, dataitem.y)}
                        />
                        {(datarow[datarow.length - 1] === dataitem) ? <div className="clear" /> : ""}
                    </div>);
            });
        });
    };

    return (
        <div className="game-area">
            <div className="game-info">
                <h1 className="info">{gameStatus}</h1>
                <span className="info">Mines remaining: {mineCount}</span>
            </div>
            <div className="minefield">
            {
                renderGrid(gridData)
            }
            </div>
        </div>
    );
}

// Game Class
function Game(props) {  
    const { height, width, mines } = { height: 3, width: 3, mines: 5 }; //props;

    return (
        <div className="game">
            <Grid height={height} width={width} mines={mines} />
        </div>
    );
}

export default Game