var orangePiecesSpan = document.getElementById("orange-pieces");
var bluePiecesSpan = document.getElementById("blue-pieces");
var turnText = document.getElementById("turn");

const names = ["LRG", "MED", "SML"];

var board = {
    blueButtons: [],
    orangeButtons: [],
    squares: [],
    squareStack: [],
    selectedPiece: undefined,
    turn: undefined
}

const winner = (color) => {
    turnText.innerText = `${capitalize(color)} Wins!`;
    disableOnWin(color);
}

const checkWinner = () => {
    for (let i = 0; i < 3; i++)
    {
        let hColor = board.squares[i * 3].color;
        let vColor = board.squares[i].color;
        for (let j = 1; j < 3; j++)
        {
            if (board.squares[i * 3 + j].color != hColor) hColor = 'fail';
            if (board.squares[j * 3 + i].color != vColor) vColor = 'fail';
        }
        if (hColor !== 'fail' && hColor !== 'none')
        {
            winner(hColor);
            return true;
        }
        if (vColor !== 'fail' && vColor !== 'none')
        {
            winner(vColor);
            return true;
        }
    }
    if (board.squares[4].color !== 'none' && (board.squares[0].color === board.squares[4].color && board.squares[0].color === board.squares[8].color || board.squares[2].color === board.squares[4].color && board.squares[2].color === board.squares[6].color))
    {
        winner(board.squares[4].color);
        return true;
    }
    return false;
}

const disableOnWin = (color) => {
    disableAll(board.orangeButtons);
    disableAll(board.blueButtons);
    for (let i = 0; i < 9; i++) {
        const square = board.squares[i];
        square.button.classList.remove('possible');
        square.button.classList.remove('usable');
        if (square.color == color)
        {
            square.button.classList.add('win');
        }
    }
}

const updateUsableSquares = (color, size) => {
    for (let i = 0; i < 9; i++) {
        const square = board.squares[i];
        // smaller sizes are larger pieces
        if (typeof board.selectedPiece === 'undefined')
        {
            square.button.classList.remove('possible');
            if (square.color === 'none' || square.color !== board.turn)
            {
                square.button.classList.remove('usable');
            }
            else
            {
                square.button.classList.add('usable');
            }
        }
        else if (square.color === 'none' || size < square.size)
        {
            square.button.classList.add('usable');
            square.button.classList.add('possible');
        }
        else
        {
            square.button.classList.remove('usable');
            square.button.classList.remove('possible');
        }
    }
}

const onClickPieceRow = (button, color, size) => {
    if (color !== board.turn || board.selectedPiece) return;

    board.selectedPiece = {button: button, size: size};
    button.classList.add('selected');
    updateUsableSquares(color, size);
}

const onClickBoard = (x, y) => {
    const index = y * 3 + x;
    if (typeof board.selectedPiece === 'undefined')
    {
        if (board.squares[index].button.classList.contains('usable'))
        {
            const button = board.squares[index].button;
            const size = board.squares[index].size;
            const color = board.turn;
            board.selectedPiece = {button: button, size: size, index: index};
            button.classList.add('selected');
            updateUsableSquares(color, size);
        }
            return;
    }

    console.log(`${x}, ${y}`);
    const square = board.squares[index].button;

    if (!square.classList.contains('possible')) return;

    const size = board.selectedPiece.size;
    const text = names[size];
    const color = board.turn;
    const button = board.selectedPiece.button;
    const sqrStack = board.squareStack;

    square.classList.remove('orange');
    square.classList.remove('blue');
    square.classList.add(color);
    square.innerText = text;
    board.squares[index].size = size;
    board.squares[index].color = color;

    sqrStack[index].push({color: color, size: size});

    if (square.classList.contains('empty')) square.classList.remove('empty');

    if (orangePiecesSpan.contains(button) || bluePiecesSpan.contains(button))
    {
        button.classList.add('spent');
    }
    else
    {
        const selInd = board.selectedPiece.index;
        sqrStack[selInd].pop();
        const top = sqrStack[selInd].at(-1);

        button.classList.remove('orange');
        button.classList.remove('blue');
        button.classList.remove('selected');

        if (typeof top === 'undefined')
        {
            button.classList.add('empty');
            button.innerText = '';
            board.squares[selInd].color = 'none';
            board.squares[selInd].size = 4;
        }
        else
        {
            const topC = top.color;
            const topS = top.size;

            button.classList.add(topC);
            button.innerText = names[topS];
            board.squares[selInd].color = topC;
            board.squares[selInd].size = topS;
        }

    }

    if (checkWinner()) return;

    disableAll(board.turn === 'orange' ? board.orangeButtons : board.blueButtons);
    board.turn = board.turn === 'orange' ? 'blue' : 'orange';
    enableAll(board.turn === 'orange' ? board.orangeButtons : board.blueButtons);

    board.selectedPiece = undefined;
    updateUsableSquares();
}

const createButtons = (color, parent) => {
    let buttons = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 2; j++) {
            let button = document.createElement("button");
            parent.appendChild(button);
            button.classList = `${color} piece`;
            button.innerText = names[i];
            const size = i;
            button.onclick = () => onClickPieceRow(button, color, size);
            buttons = [...buttons, button];
        }
    }

    return buttons;
}

const createSquares = () => {
    let buttons = [];
    for (let i = 0; i < 3; i++) {
        const rowSpan = document.getElementById(`row-${i+1}`);
        for (let j = 0; j < 3; j++) {
            let button = document.createElement("button");
            rowSpan.appendChild(button);
            button.classList = 'empty piece';
            button.onclick = () => onClickBoard(j, i);
            buttons = [...buttons, {button: button, color: 'none', size: 4}];
        }
    }

    return buttons;
}

const createSquareStack = () => {
    let stack = [];
    for (let i = 0; i < 9; i++) {
        stack = [...stack, []];
    }
    return stack;
}

const capitalize = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

const disableAll = (buttons) => {
    buttons.map((button, _) => {
        button.classList.remove('usable');
    });
}

const enableAll = (buttons) => {
    buttons.map((button, _) => {
        button.classList.add('usable');
    });
}

const setupBoard = () => {
    board.squares = createSquares();
    board.squareStack = createSquareStack();
    board.turn = Math.random() >= 0.5 ? 'orange' : 'blue';

    turnText.innerText = `Current Turn: ${capitalize(board.turn)}`;

    board.orangeButtons = createButtons('orange', orangePiecesSpan);
    board.blueButtons = createButtons('blue', bluePiecesSpan);

    if (board.turn == 'orange') enableAll(board.orangeButtons);
    else enableAll(board.blueButtons);
}

setupBoard();