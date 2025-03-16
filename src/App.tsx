import { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import Header from './components/Header';
import Board from './components/Board';
import { KanbanData } from './types';
import { initKeyboardShortcuts } from './utils/keyboardShortcuts';

function App() {
  const [data, setData] = useState<KanbanData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load data from localStorage
    const savedData = localStorage.getItem('kanbanData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setData(parsedData);
      
      // Set document title with active board name
      const activeBoard = parsedData.boards.find((board: { id: string; title: string }) => board.id === parsedData.activeBoard);
      if (activeBoard) {
        document.title = `${activeBoard.title} | TaskFlow`;
      }
    } else {
      // Initialize with default data
      const defaultData: KanbanData = {
        boards: [
          {
            id: 'board-1',
            title: 'Main Board',
            columns: [
              {
                id: 'column-1',
                title: 'To Do',
                cards: []
              },
              {
                id: 'column-2',
                title: 'In Progress',
                cards: []
              },
              {
                id: 'column-3',
                title: 'Done',
                cards: []
              }
            ]
          }
        ],
        activeBoard: 'board-1',
        labels: [],
        filters: {}
      };
      setData(defaultData);
      document.title = 'Main Board | TaskFlow';
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Save data to localStorage whenever it changes
    if (data) {
      localStorage.setItem('kanbanData', JSON.stringify(data));
    }
  }, [data]);

  // Initialize keyboard shortcuts
  useEffect(() => {
    if (data) {
      const cleanup = initKeyboardShortcuts(data, setData);
      return cleanup;
    }
  }, [data]);

  const handleDragEnd = (result: DropResult) => {
    if (!data) return;
    
    const { destination, source, type } = result;
    
    // If there's no destination or the item was dropped back to its original position
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    // Handle column reordering
    if (type === 'column') {
      const activeBoard = data.boards.find(board => board.id === data.activeBoard);
      if (!activeBoard) return;

      const newColumns = Array.from(activeBoard.columns);
      const [movedColumn] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, movedColumn);

      const updatedBoards = data.boards.map(board => {
        if (board.id === data.activeBoard) {
          return { ...board, columns: newColumns };
        }
        return board;
      });

      setData({ ...data, boards: updatedBoards });
      return;
    }

    // Handle card movement
    const activeBoard = data.boards.find(board => board.id === data.activeBoard);
    if (!activeBoard) return;

    const sourceColumn = activeBoard.columns.find(column => column.id === source.droppableId);
    const destColumn = activeBoard.columns.find(column => column.id === destination.droppableId);

    if (!sourceColumn || !destColumn) return;

    // If moving within the same column
    if (source.droppableId === destination.droppableId) {
      const newCards = Array.from(sourceColumn.cards);
      const [movedCard] = newCards.splice(source.index, 1);
      newCards.splice(destination.index, 0, movedCard);

      const updatedColumns = activeBoard.columns.map(column => {
        if (column.id === source.droppableId) {
          return { ...column, cards: newCards };
        }
        return column;
      });

      const updatedBoards = data.boards.map(board => {
        if (board.id === data.activeBoard) {
          return { ...board, columns: updatedColumns };
        }
        return board;
      });

      setData({ ...data, boards: updatedBoards });
    } else {
      // Moving from one column to another
      const sourceCards = Array.from(sourceColumn.cards);
      const [movedCard] = sourceCards.splice(source.index, 1);
      
      const destCards = Array.from(destColumn.cards);
      destCards.splice(destination.index, 0, movedCard);

      // Add a move activity to the card
      const updatedCard = {
        ...movedCard,
        activity: [
          ...movedCard.activity,
          {
            id: `activity-${Date.now()}`,
            type: 'move' as const,
            userId: 'system',
            timestamp: new Date().toISOString(),
            details: {
              from: sourceColumn.title,
              to: destColumn.title
            }
          }
        ]
      };

      const updatedColumns = activeBoard.columns.map(column => {
        if (column.id === source.droppableId) {
          return { ...column, cards: sourceCards };
        }
        if (column.id === destination.droppableId) {
          return { ...column, cards: [...destCards.slice(0, destination.index), updatedCard, ...destCards.slice(destination.index + 1)] };
        }
        return column;
      });

      const updatedBoards = data.boards.map(board => {
        if (board.id === data.activeBoard) {
          return { ...board, columns: updatedColumns };
        }
        return board;
      });

      setData({ ...data, boards: updatedBoards });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!data) {
    return <div className="flex items-center justify-center h-screen">Error loading data</div>;
  }

  const activeBoard = data.boards.find(board => board.id === data.activeBoard);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header 
        boards={data.boards} 
        activeBoard={data.activeBoard} 
        setData={setData}
        kanbanData={data}
      />
      <DragDropContext onDragEnd={handleDragEnd}>
        {activeBoard && (
          <Board 
            board={activeBoard} 
            setData={setData} 
            kanbanData={data}
          />
        )}
      </DragDropContext>
    </div>
  );
}

export default App;
