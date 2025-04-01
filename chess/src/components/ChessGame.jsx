import React from 'react';
import { useState, useEffect } from 'react';

const ChessGame = () => {
  // Board representation: null for empty, or {piece, color}
  const initialBoard = Array(8).fill().map(() => Array(8).fill(null));
  
  // Initialize the board with pieces
  const setupBoard = () => {
    const newBoard = JSON.parse(JSON.stringify(initialBoard));
    
    // Set up pawns
    for (let i = 0; i < 8; i++) {
      newBoard[1][i] = { piece: 'pawn', color: 'black' };
      newBoard[6][i] = { piece: 'pawn', color: 'white' };
    }
    
    // Set up rooks
    newBoard[0][0] = { piece: 'rook', color: 'black' };
    newBoard[0][7] = { piece: 'rook', color: 'black' };
    newBoard[7][0] = { piece: 'rook', color: 'white' };
    newBoard[7][7] = { piece: 'rook', color: 'white' };
    
    // Set up knights
    newBoard[0][1] = { piece: 'knight', color: 'black' };
    newBoard[0][6] = { piece: 'knight', color: 'black' };
    newBoard[7][1] = { piece: 'knight', color: 'white' };
    newBoard[7][6] = { piece: 'knight', color: 'white' };
    
    // Set up bishops
    newBoard[0][2] = { piece: 'bishop', color: 'black' };
    newBoard[0][5] = { piece: 'bishop', color: 'black' };
    newBoard[7][2] = { piece: 'bishop', color: 'white' };
    newBoard[7][5] = { piece: 'bishop', color: 'white' };
    
    // Set up queens
    newBoard[0][3] = { piece: 'queen', color: 'black' };
    newBoard[7][3] = { piece: 'queen', color: 'white' };
    
    // Set up kings
    newBoard[0][4] = { piece: 'king', color: 'black' };
    newBoard[7][4] = { piece: 'king', color: 'white' };
    
    return newBoard;
  };

  const [board, setBoard] = useState(setupBoard());
  const [selectedCell, setSelectedCell] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState('white');
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [gameStatus, setGameStatus] = useState('active'); // active, check, checkmate, stalemate
  const [moveHistory, setMoveHistory] = useState([]);
  const [castlingRights, setCastlingRights] = useState({
    whiteKingSide: true,
    whiteQueenSide: true,
    blackKingSide: true,
    blackQueenSide: true
  });
  const [enPassantTarget, setEnPassantTarget] = useState(null);
  const [lastMove, setLastMove] = useState(null);

  // Chess piece unicode symbols
  const pieceSymbols = {
    white: {
      king: '♔',
      queen: '♕',
      rook: '♖',
      bishop: '♗',
      knight: '♘',
      pawn: '♙'
    },
    black: {
      king: '♚',
      queen: '♛',
      rook: '♜',
      bishop: '♝',
      knight: '♞',
      pawn: '♟'
    }
  };

  // Calculate possible moves for a piece
  const calculatePossibleMoves = (row, col) => {
    const piece = board[row][col];
    if (!piece || piece.color !== currentPlayer) return [];
    
    let moves = [];
    
    switch (piece.piece) {
      case 'pawn':
        moves = getPawnMoves(row, col, piece.color);
        break;
      case 'rook':
        moves = getRookMoves(row, col, piece.color);
        break;
      case 'knight':
        moves = getKnightMoves(row, col, piece.color);
        break;
      case 'bishop':
        moves = getBishopMoves(row, col, piece.color);
        break;
      case 'queen':
        moves = [...getRookMoves(row, col, piece.color), ...getBishopMoves(row, col, piece.color)];
        break;
      case 'king':
        moves = getKingMoves(row, col, piece.color);
        break;
      default:
        break;
    }
    
    // Filter out moves that would leave the king in check
    return moves.filter(move => !wouldBeInCheck(row, col, move[0], move[1], piece.color));
  };

  // Check if the king would be in check after a move
  const wouldBeInCheck = (fromRow, fromCol, toRow, toCol, color) => {
    // Make a temporary move
    const tempBoard = JSON.parse(JSON.stringify(board));
    tempBoard[toRow][toCol] = tempBoard[fromRow][fromCol];
    tempBoard[fromRow][fromCol] = null;
    
    // Find king position
    let kingRow, kingCol;
    if (tempBoard[toRow][toCol]?.piece === 'king') {
      kingRow = toRow;
      kingCol = toCol;
    } else {
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (tempBoard[r][c]?.piece === 'king' && tempBoard[r][c]?.color === color) {
            kingRow = r;
            kingCol = c;
            break;
          }
        }
        if (kingRow !== undefined) break;
      }
    }
    
    // Check if any opponent piece can capture the king
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = tempBoard[r][c];
        if (piece && piece.color !== color) {
          const attackMoves = getRawMoves(r, c, piece.piece, piece.color, tempBoard);
          if (attackMoves.some(move => move[0] === kingRow && move[1] === kingCol)) {
            return true;
          }
        }
      }
    }
    
    return false;
  };

  // Get "raw" moves for a piece without considering check
  const getRawMoves = (row, col, pieceType, color, boardState = board) => {
    switch (pieceType) {
      case 'pawn':
        return getRawPawnMoves(row, col, color, boardState);
      case 'rook':
        return getRawRookMoves(row, col, color, boardState);
      case 'knight':
        return getRawKnightMoves(row, col, color, boardState);
      case 'bishop':
        return getRawBishopMoves(row, col, color, boardState);
      case 'queen':
        return [...getRawRookMoves(row, col, color, boardState), ...getRawBishopMoves(row, col, color, boardState)];
      case 'king':
        return getRawKingMoves(row, col, color, boardState);
      default:
        return [];
    }
  };

  // Pawn moves
  const getPawnMoves = (row, col, color) => {
    const moves = getRawPawnMoves(row, col, color);
    return moves;
  };
  
  const getRawPawnMoves = (row, col, color, boardState = board) => {
    const moves = [];
    const direction = color === 'white' ? -1 : 1;
    const startRow = color === 'white' ? 6 : 1;
    
    // Move forward one square
    if (row + direction >= 0 && row + direction < 8 && !boardState[row + direction][col]) {
      moves.push([row + direction, col]);
      
      // Move forward two squares from starting position
      if (row === startRow && !boardState[row + 2 * direction][col]) {
        moves.push([row + 2 * direction, col]);
      }
    }
    
    // Capture diagonally
    const captureCols = [col - 1, col + 1];
    for (const captureCol of captureCols) {
      if (captureCol >= 0 && captureCol < 8) {
        const captureRow = row + direction;
        if (captureRow >= 0 && captureRow < 8) {
          // Normal capture
          if (boardState[captureRow][captureCol] && boardState[captureRow][captureCol].color !== color) {
            moves.push([captureRow, captureCol]);
          }
          
          // En passant
          if (enPassantTarget && 
              captureRow === enPassantTarget[0] && 
              captureCol === enPassantTarget[1]) {
            moves.push([captureRow, captureCol]);
          }
        }
      }
    }
    
    return moves;
  };

  // Rook moves
  const getRookMoves = (row, col, color) => {
    return getRawRookMoves(row, col, color);
  };
  
  const getRawRookMoves = (row, col, color, boardState = board) => {
    const moves = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Up, Down, Left, Right
    
    for (const [dRow, dCol] of directions) {
      let currentRow = row + dRow;
      let currentCol = col + dCol;
      
      while (currentRow >= 0 && currentRow < 8 && currentCol >= 0 && currentCol < 8) {
        if (!boardState[currentRow][currentCol]) {
          moves.push([currentRow, currentCol]);
        } else {
          if (boardState[currentRow][currentCol].color !== color) {
            moves.push([currentRow, currentCol]);
          }
          break;
        }
        
        currentRow += dRow;
        currentCol += dCol;
      }
    }
    
    return moves;
  };

  // Knight moves
  const getKnightMoves = (row, col, color) => {
    return getRawKnightMoves(row, col, color);
  };
  
  const getRawKnightMoves = (row, col, color, boardState = board) => {
    const moves = [];
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    
    for (const [dRow, dCol] of knightMoves) {
      const newRow = row + dRow;
      const newCol = col + dCol;
      
      if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        if (!boardState[newRow][newCol] || boardState[newRow][newCol].color !== color) {
          moves.push([newRow, newCol]);
        }
      }
    }
    
    return moves;
  };

  // Bishop moves
  const getBishopMoves = (row, col, color) => {
    return getRawBishopMoves(row, col, color);
  };
  
  const getRawBishopMoves = (row, col, color, boardState = board) => {
    const moves = [];
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]; // Diagonals
    
    for (const [dRow, dCol] of directions) {
      let currentRow = row + dRow;
      let currentCol = col + dCol;
      
      while (currentRow >= 0 && currentRow < 8 && currentCol >= 0 && currentCol < 8) {
        if (!boardState[currentRow][currentCol]) {
          moves.push([currentRow, currentCol]);
        } else {
          if (boardState[currentRow][currentCol].color !== color) {
            moves.push([currentRow, currentCol]);
          }
          break;
        }
        
        currentRow += dRow;
        currentCol += dCol;
      }
    }
    
    return moves;
  };

  // King moves (including castling)
  const getKingMoves = (row, col, color) => {
    const moves = getRawKingMoves(row, col, color);
    
    // Castling
    if ((color === 'white' && row === 7 && col === 4) || 
        (color === 'black' && row === 0 && col === 4)) {
      
      // Ensure the king is not in check
      if (!isInCheck(color)) {
        // Kingside castling
        if ((color === 'white' && castlingRights.whiteKingSide) || 
            (color === 'black' && castlingRights.blackKingSide)) {
          if (!board[row][col+1] && !board[row][col+2] && 
              !wouldBeInCheck(row, col, row, col+1, color) && 
              !wouldBeInCheck(row, col, row, col+2, color)) {
            moves.push([row, col+2]);
          }
        }
        
        // Queenside castling
        if ((color === 'white' && castlingRights.whiteQueenSide) || 
            (color === 'black' && castlingRights.blackQueenSide)) {
          if (!board[row][col-1] && !board[row][col-2] && !board[row][col-3] && 
              !wouldBeInCheck(row, col, row, col-1, color) && 
              !wouldBeInCheck(row, col, row, col-2, color)) {
            moves.push([row, col-2]);
          }
        }
      }
    }
    
    return moves;
  };
  
  const getRawKingMoves = (row, col, color, boardState = board) => {
    const moves = [];
    const kingMoves = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];
    
    for (const [dRow, dCol] of kingMoves) {
      const newRow = row + dRow;
      const newCol = col + dCol;
      
      if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        if (!boardState[newRow][newCol] || boardState[newRow][newCol].color !== color) {
          moves.push([newRow, newCol]);
        }
      }
    }
    
    return moves;
  };

  // Check if a player is in check
  const isInCheck = (color) => {
    // Find king position
    let kingRow, kingCol;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c]?.piece === 'king' && board[r][c]?.color === color) {
          kingRow = r;
          kingCol = c;
          break;
        }
      }
      if (kingRow !== undefined) break;
    }
    
    // Check if any opponent piece can capture the king
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.color !== color) {
          const attackMoves = getRawMoves(r, c, piece.piece, piece.color);
          if (attackMoves.some(move => move[0] === kingRow && move[1] === kingCol)) {
            return true;
          }
        }
      }
    }
    
    return false;
  };

  // Check for checkmate or stalemate
  const checkGameState = () => {
    // Check if current player has any legal moves
    let hasLegalMoves = false;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.color === currentPlayer) {
          const moves = calculatePossibleMoves(r, c);
          if (moves.length > 0) {
            hasLegalMoves = true;
            break;
          }
        }
      }
      if (hasLegalMoves) break;
    }
    
    if (!hasLegalMoves) {
      if (isInCheck(currentPlayer)) {
        setGameStatus('checkmate');
      } else {
        setGameStatus('stalemate');
      }
    } else if (isInCheck(currentPlayer)) {
      setGameStatus('check');
    } else {
      setGameStatus('active');
    }
  };

  // Handle cell click
  const handleCellClick = (row, col) => {
    if (gameStatus === 'checkmate' || gameStatus === 'stalemate') return;
    
    if (selectedCell) {
      const [selectedRow, selectedCol] = selectedCell;
      const piece = board[selectedRow][selectedCol];
      
      // Check if clicked on a possible move
      if (possibleMoves.some(move => move[0] === row && move[1] === col)) {
        // Move the piece
        makeMove(selectedRow, selectedCol, row, col, piece);
      } else if (board[row][col]?.color === currentPlayer) {
        // Select a different piece of same color
        setSelectedCell([row, col]);
        setPossibleMoves(calculatePossibleMoves(row, col));
      } else {
        // Deselect the piece
        setSelectedCell(null);
        setPossibleMoves([]);
      }
    } else if (board[row][col]?.color === currentPlayer) {
      // Select a piece
      setSelectedCell([row, col]);
      setPossibleMoves(calculatePossibleMoves(row, col));
    }
  };

  // Make a move
  const makeMove = (fromRow, fromCol, toRow, toCol, piece) => {
    const newBoard = JSON.parse(JSON.stringify(board));
    const pieceToMove = newBoard[fromRow][fromCol];
    
    // Update castling rights
    const newCastlingRights = {...castlingRights};
    if (pieceToMove.piece === 'king') {
      if (pieceToMove.color === 'white') {
        newCastlingRights.whiteKingSide = false;
        newCastlingRights.whiteQueenSide = false;
      } else {
        newCastlingRights.blackKingSide = false;
        newCastlingRights.blackQueenSide = false;
      }
    } else if (pieceToMove.piece === 'rook') {
      if (pieceToMove.color === 'white') {
        if (fromRow === 7 && fromCol === 0) newCastlingRights.whiteQueenSide = false;
        if (fromRow === 7 && fromCol === 7) newCastlingRights.whiteKingSide = false;
      } else {
        if (fromRow === 0 && fromCol === 0) newCastlingRights.blackQueenSide = false;
        if (fromRow === 0 && fromCol === 7) newCastlingRights.blackKingSide = false;
      }
    }
    
    // Handle castling
    if (pieceToMove.piece === 'king' && Math.abs(toCol - fromCol) === 2) {
      const rookCol = toCol > fromCol ? 7 : 0;
      const newRookCol = toCol > fromCol ? toCol - 1 : toCol + 1;
      newBoard[fromRow][newRookCol] = newBoard[fromRow][rookCol];
      newBoard[fromRow][rookCol] = null;
    }
    
    // Handle en passant capture
    let capturedPiece = newBoard[toRow][toCol];
    let enPassantCapture = false;
    
    if (pieceToMove.piece === 'pawn' && 
        enPassantTarget && 
        toRow === enPassantTarget[0] && 
        toCol === enPassantTarget[1]) {
      const direction = pieceToMove.color === 'white' ? 1 : -1;
      capturedPiece = newBoard[toRow + direction][toCol];
      newBoard[toRow + direction][toCol] = null;
      enPassantCapture = true;
    }
    
    // Set new en passant target for two-square pawn moves
    let newEnPassantTarget = null;
    if (pieceToMove.piece === 'pawn' && Math.abs(fromRow - toRow) === 2) {
      const direction = pieceToMove.color === 'white' ? -1 : 1;
      newEnPassantTarget = [fromRow + direction, fromCol];
    }
    
    // Move the piece
    newBoard[toRow][toCol] = pieceToMove;
    newBoard[fromRow][fromCol] = null;
    
    // Handle pawn promotion
    if (pieceToMove.piece === 'pawn' && (toRow === 0 || toRow === 7)) {
      newBoard[toRow][toCol] = { piece: 'queen', color: pieceToMove.color };
    }
    
    // Save the move
    const move = {
      piece: pieceToMove.piece,
      color: pieceToMove.color,
      from: [fromRow, fromCol],
      to: [toRow, toCol],
      capture: capturedPiece !== null || enPassantCapture,
      promotion: pieceToMove.piece === 'pawn' && (toRow === 0 || toRow === 7),
      castling: pieceToMove.piece === 'king' && Math.abs(toCol - fromCol) === 2,
      enPassant: enPassantCapture
    };
    
    // Update state
    setBoard(newBoard);
    setSelectedCell(null);
    setPossibleMoves([]);
    setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
    setMoveHistory([...moveHistory, move]);
    setCastlingRights(newCastlingRights);
    setEnPassantTarget(newEnPassantTarget);
    setLastMove({ from: [fromRow, fromCol], to: [toRow, toCol] });
  };

  // Check game state after each move
  useEffect(() => {
    if (board && currentPlayer) {
      checkGameState();
    }
  }, [board, currentPlayer]);

  // Restart the game
  const restartGame = () => {
    setBoard(setupBoard());
    setSelectedCell(null);
    setCurrentPlayer('white');
    setPossibleMoves([]);
    setGameStatus('active');
    setMoveHistory([]);
    setCastlingRights({
      whiteKingSide: true,
      whiteQueenSide: true,
      blackKingSide: true,
      blackQueenSide: true
    });
    setEnPassantTarget(null);
    setLastMove(null);
  };

  // Get cell class for styling
  const getCellClass = (row, col) => {
    let classes = (row + col) % 2 === 0 ? 'bg-amber-100' : 'bg-amber-800';
    
    if (selectedCell && row === selectedCell[0] && col === selectedCell[1]) {
      classes += ' bg-blue-300';
    } else if (lastMove && 
              ((row === lastMove.from[0] && col === lastMove.from[1]) || 
               (row === lastMove.to[0] && col === lastMove.to[1]))) {
      classes += ' bg-yellow-200';
    }
    
    return `${classes} w-12 h-12 md:w-16 md:h-16 flex items-center justify-center relative`;
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chess Game</h1>
      
      <div className="mb-4 flex items-center space-x-4">
        <div className={`h-4 w-4 rounded-full ${currentPlayer === 'white' ? 'bg-white border border-black' : 'bg-black'}`}></div>
        <div className="font-semibold">{currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s Turn</div>
        {gameStatus !== 'active' && (
          <div className="ml-2 font-bold text-red-500">
            {gameStatus === 'check' ? 'Check!' : gameStatus === 'checkmate' ? 'Checkmate!' : 'Stalemate!'}
          </div>
        )}
      </div>
      
      <div className="border-4 border-gray-800 mb-4">
        {/* Board labels */}
        <div className="flex">
          <div className="w-6"></div>
          {Array(8).fill().map((_, i) => (
            <div key={`col-${i}`} className="w-12 h-6 md:w-16 flex items-center justify-center font-bold">
              {String.fromCharCode(97 + i)}
            </div>
          ))}
        </div>
        
        {/* Board */}
        <div className="flex">
          <div className="flex flex-col">
            {Array(8).fill().map((_, i) => (
              <div key={`row-${i}`} className="w-6 h-12 md:h-16 flex items-center justify-center font-bold">
                {8 - i}
              </div>
            ))}
          </div>
          
          <div>
            {board.map((row, rowIndex) => (
              <div key={`row-${rowIndex}`} className="flex">
                {row.map((cell, colIndex) => (
                  <div
                    key={`cell-${rowIndex}-${colIndex}`}
                    className={getCellClass(rowIndex, colIndex)}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {cell && (
                      <div className="text-3xl select-none">
                        {pieceSymbols[cell.color][cell.piece]}
                      </div>
                    )}
                    
                    {/* Possible move indicator */}
                    {possibleMoves.some(move => move[0] === rowIndex && move[1] === colIndex) && (
                      <div className={`absolute inset-0 flex items-center justify-center ${cell ? 'before:content-[""] before:absolute before:inset-0 before:border-2 before:border-green-500 before:rounded-full' : ''}`}>
                        {!cell && <div className="h-3 w-3 rounded-full bg-green-500"></div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <button 
          onClick={restartGame}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Restart Game
        </button>
      </div>
      
      {/* Game status */}
      {gameStatus === 'checkmate' && (
        <div className="mt-4 text-xl font-bold">
          {currentPlayer === 'white' ? 'Black' : 'White'} wins by checkmate!
        </div>
      )}
      
      {gameStatus === 'stalemate' && (
        <div className="mt-4 text-xl font-bold">
          Game ends in stalemate! It's a draw.
        </div>
      )}
    </div>
  );
};

export default ChessGame;