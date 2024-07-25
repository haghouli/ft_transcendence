let currentPlayer = 'X';
let board = ['', '', '', '', '', '', '', '', ''];
let gameActive = false;


const boardCells = document.querySelectorAll('.cell');
const turnDisplay = document.getElementById('turn');

function reset() {
    currentPlayer = 'X';
    board = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    turnDisplay.textContent = `Turn: ${currentPlayer}`;
    boardCells.forEach(cell => cell.textContent = '');
}

function placeMarker2(cellIndex) {
    if (gameActive && board[cellIndex] === '') {
      board[cellIndex] = currentPlayer;
      boardCells[cellIndex].textContent = currentPlayer;
      boardCells[cellIndex].style.color = 'red'
      if (checkWin()) {
          turnDisplay.textContent = `${currentPlayer} wins!`;
          socket.send(JSON.stringify({
              'message': `${currentPlayer} wins!`,
              'action': 'game_over',
          }));
        return;
      }
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      turnDisplay.textContent = `Turn: ${currentPlayer}`;
    }
  }

function placeMarker(cellIndex) {
  if (gameActive && board[cellIndex] === '') {
    board[cellIndex] = currentPlayer;
    boardCells[cellIndex].textContent = currentPlayer;
    if (checkWin()) {
        turnDisplay.textContent = `${currentPlayer} wins!`;
        socket.send(JSON.stringify({
            'message': `${currentPlayer} wins!`,
            'action': 'game_over',
        }));
      return;
    }
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    turnDisplay.textContent = `Turn: ${currentPlayer}`;
    socket.send(JSON.stringify({
            'message': 'nothing',
            'action': 'make_move',
            'index' : cellIndex,
        })
    );
    gameActive = false;
  }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

const socket = new WebSocket(`ws://127.0.0.1:8000/ws/game/?id=${getRandomInt(1000)}`)

socket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    const message = data.message
    const action = data.action
    if(action == 'match_found') {
        alert(message)
        gameActive = true
    } else if(action == 'make_move') {
        const index = data['index']
        gameActive = true
        placeMarker2(index)
    }
    else if(action == 'game_over') {
        gameActive = false;
        alert('game over');
        reset()
    }
}

socket.onclose= () => { 
    console.log('The socket disconnected');
    gameActive = false;
}

const winningConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

function checkWin() {
  for (let condition of winningConditions) {
    let [a, b, c] = condition;
    if (board[a] !== '' && board[a] === board[b] && board[a] === board[c]) {
      return true;
    }
  }
  return false;
}