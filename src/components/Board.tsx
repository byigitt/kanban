import { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Board as BoardType, KanbanData, Column as ColumnType, Card as CardType } from '../types';
import Column from './Column';
import LabelFilter from './LabelFilter';
import { FiPlus } from 'react-icons/fi';

interface BoardProps {
  board: BoardType;
  setData: React.Dispatch<React.SetStateAction<KanbanData | null>>;
  kanbanData: KanbanData;
}

const Board = ({ board, setData, kanbanData }: BoardProps) => {
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [showNewColumnForm, setShowNewColumnForm] = useState(false);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);

  // Add a new column to the board
  const addColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;

    const newColumn: ColumnType = {
      id: `column-${Date.now()}`,
      title: newColumnTitle,
      cards: []
    };

    const updatedBoard = {
      ...board,
      columns: [...board.columns, newColumn]
    };

    setData(prevData => {
      if (!prevData) return null;
      return {
        ...prevData,
        boards: prevData.boards.map(b => 
          b.id === board.id ? updatedBoard : b
        )
      };
    });

    setNewColumnTitle('');
    setShowNewColumnForm(false);
  };

  // Filter cards based on selected labels
  const filterCards = (cards: CardType[]): CardType[] => {
    if (selectedLabelIds.length === 0) return cards;
    
    return cards.filter(card => 
      selectedLabelIds.some(labelId => card.labels.includes(labelId))
    );
  };

  return (
    <main className="container mx-auto px-4 py-6 overflow-x-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">{board.title}</h2>
        <div className="flex items-center space-x-2">
          <LabelFilter 
            labels={kanbanData.labels || []} 
            selectedLabels={selectedLabelIds}
            setSelectedLabels={setSelectedLabelIds}
          />
        </div>
      </div>

      <Droppable droppableId="board-columns" direction="horizontal" type="column">
        {(provided) => (
          <div 
            className="flex space-x-4 min-h-[calc(100vh-200px)] pb-4"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {board.columns.map((column, index) => (
              <Draggable key={column.id} draggableId={column.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="flex-shrink-0 w-80"
                  >
                    <Column 
                      column={{
                        ...column,
                        cards: filterCards(column.cards)
                      }}
                      originalColumn={column}
                      board={board} 
                      setData={setData} 
                      kanbanData={kanbanData}
                      dragHandleProps={provided.dragHandleProps}
                      isFiltering={selectedLabelIds.length > 0}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            <div className="flex-shrink-0 w-80">
              {showNewColumnForm ? (
                <div className="bg-gray-800 rounded-md shadow-md p-3">
                  <form onSubmit={addColumn}>
                    <input
                      type="text"
                      placeholder="Column Title"
                      className="w-full px-3 py-2 border rounded-md bg-gray-700 border-gray-600 text-white"
                      value={newColumnTitle}
                      onChange={e => setNewColumnTitle(e.target.value)}
                      autoFocus
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        type="button"
                        className="px-3 py-1 text-sm mr-2 text-gray-300 hover:text-white"
                        onClick={() => setShowNewColumnForm(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Add Column
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <button
                  className="w-full h-12 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
                  onClick={() => setShowNewColumnForm(true)}
                  data-add-column
                >
                  <FiPlus className="mr-2" />
                  Add Column
                </button>
              )}
            </div>
          </div>
        )}
      </Droppable>
    </main>
  );
};

export default Board; 