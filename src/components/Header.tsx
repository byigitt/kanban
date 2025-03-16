import { useState } from 'react';
import { Board, KanbanData, Card, Column } from '../types';
import { FiPlus, FiMenu, FiMoon, FiSun, FiSettings, FiTag } from 'react-icons/fi';
import ImportExport from './ImportExport';
import LabelManager from './LabelManager';
import SearchBar from './SearchBar';
import { keyboardShortcutsHelp } from '../utils/keyboardShortcuts';

interface HeaderProps {
  boards: Board[];
  activeBoard: string;
  setData: React.Dispatch<React.SetStateAction<KanbanData | null>>;
  kanbanData: KanbanData;
}

const Header = ({ boards, activeBoard, setData, kanbanData }: HeaderProps) => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const [showBoardMenu, setShowBoardMenu] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [showNewBoardForm, setShowNewBoardForm] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showLabelManager, setShowLabelManager] = useState(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Switch to a different board
  const switchBoard = (boardId: string) => {
    const selectedBoard = boards.find(board => board.id === boardId);
    
    setData(prevData => {
      if (!prevData) return null;
      return { ...prevData, activeBoard: boardId };
    });
    
    // Update document title with the board name
    if (selectedBoard) {
      document.title = `${selectedBoard.title} | TaskFlow`;
    }
    
    setShowBoardMenu(false);
  };

  // Create a new board
  const createNewBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    const newBoardId = `board-${Date.now()}`;
    const newBoard: Board = {
      id: newBoardId,
      title: newBoardTitle,
      columns: [
        { id: `${newBoardId}-column-1`, title: 'To Do', cards: [] },
        { id: `${newBoardId}-column-2`, title: 'In Progress', cards: [] },
        { id: `${newBoardId}-column-3`, title: 'Done', cards: [] }
      ]
    };

    setData(prevData => {
      if (!prevData) return null;
      return {
        ...prevData,
        boards: [...prevData.boards, newBoard],
        activeBoard: newBoardId
      };
    });

    // Update document title with the new board name
    document.title = `${newBoardTitle} | TaskFlow`;

    setNewBoardTitle('');
    setShowNewBoardForm(false);
    setShowBoardMenu(false);
  };

  // Get the active board title
  const activeBoardTitle = boards.find(board => board.id === activeBoard)?.title || 'Kanban Board';

  // Handle selecting a search result
  const handleSearchResult = (card: Card, column: Column, board: Board) => {
    // Switch to the board if it's not the active one
    if (board.id !== activeBoard) {
      switchBoard(board.id);
    }

    // Open the card detail
    // We need to find the card in the current data structure
    // as it might have changed since the search was performed
    setTimeout(() => {
      const currentBoard = kanbanData.boards.find(b => b.id === board.id);
      if (!currentBoard) return;

      const currentColumn = currentBoard.columns.find(c => c.id === column.id);
      if (!currentColumn) return;

      const currentCard = currentColumn.cards.find(c => c.id === card.id);
      if (!currentCard) return;

      // Create a custom event to open the card
      const event = new CustomEvent('openCard', { 
        detail: { 
          cardId: card.id,
          columnId: column.id,
          boardId: board.id
        } 
      });
      window.dispatchEvent(event);
    }, 100);
  };

  return (
    <>
      <header className="bg-gray-800 text-white shadow-md py-3 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex items-center mr-4">
              <img src="/kanban-logo.svg" alt="TaskFlow Logo" className="w-8 h-8 mr-2" />
              <h1 className="text-xl font-bold">TaskFlow</h1>
            </div>
            
            <div className="relative">
              <button 
                className="flex items-center px-3 py-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
                onClick={() => setShowBoardMenu(!showBoardMenu)}
                data-board-menu
              >
                <span className="mr-2">{activeBoardTitle}</span>
                <FiMenu />
              </button>
              
              {showBoardMenu && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-gray-800 shadow-lg rounded-md z-10 overflow-hidden">
                  <div className="p-2">
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">All Boards ({boards.length})</h3>
                    <ul>
                      {boards.map(board => (
                        <li key={board.id}>
                          <button
                            className={`w-full text-left px-3 py-2 rounded-md ${board.id === activeBoard ? 'bg-blue-900 text-blue-300' : 'hover:bg-gray-700'}`}
                            onClick={() => switchBoard(board.id)}
                          >
                            {board.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                    
                    {showNewBoardForm ? (
                      <form onSubmit={createNewBoard} className="mt-2">
                        <input
                          type="text"
                          placeholder="Board Title"
                          className="w-full px-3 py-2 border rounded-md bg-gray-700 border-gray-600 text-white"
                          value={newBoardTitle}
                          onChange={e => setNewBoardTitle(e.target.value)}
                          autoFocus
                        />
                        <div className="flex justify-end mt-2">
                          <button
                            type="button"
                            className="px-3 py-1 text-sm mr-2 text-gray-300 hover:text-white"
                            onClick={() => setShowNewBoardForm(false)}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            Create
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        className="w-full flex items-center px-3 py-2 mt-2 text-blue-400 hover:bg-gray-700 rounded-md"
                        onClick={() => setShowNewBoardForm(true)}
                        data-create-board
                      >
                        <FiPlus className="mr-2" />
                        Create New Board
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <SearchBar 
              kanbanData={kanbanData}
              onSelectResult={handleSearchResult}
            />
            
            <button
              className="p-2 rounded-full hover:bg-gray-700"
              onClick={() => setShowShortcutsHelp(!showShortcutsHelp)}
              title="Keyboard Shortcuts"
            >
              <span className="text-sm font-mono">⌨</span>
            </button>
            
            <button
              className="p-2 rounded-full hover:bg-gray-700"
              onClick={() => setShowLabelManager(true)}
              title="Manage Labels"
            >
              <FiTag />
            </button>
            
            <button
              className="p-2 rounded-full hover:bg-gray-700"
              onClick={() => setShowImportExport(true)}
              title="Import/Export Data"
            >
              <FiSettings />
            </button>
            
            <button
              className="p-2 rounded-full hover:bg-gray-700"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              data-dark-mode-toggle
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <FiSun className="text-yellow-400" /> : <FiMoon />}
            </button>
          </div>
        </div>
      </header>
      
      {showImportExport && (
        <ImportExport 
          data={boards.length > 0 ? { boards, activeBoard } : { boards: [], activeBoard: '' }}
          setData={setData}
          onClose={() => setShowImportExport(false)}
        />
      )}
      
      {showShortcutsHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold">Keyboard Shortcuts</h2>
            </div>
            
            <div className="p-6">
              <ul className="space-y-3">
                {keyboardShortcutsHelp.map((shortcut, index) => (
                  <li key={index} className="flex justify-between">
                    <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{shortcut.key}</span>
                    <span className="text-gray-600 dark:text-gray-400">{shortcut.description}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                onClick={() => setShowShortcutsHelp(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showLabelManager && (
        <LabelManager 
          kanbanData={kanbanData}
          setData={setData}
          onClose={() => setShowLabelManager(false)}
        />
      )}
    </>
  );
};

export default Header; 