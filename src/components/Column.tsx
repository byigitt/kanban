import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Column as ColumnType, Board, KanbanData, Card as CardType } from '../types';
import Card from './Card';
import CardForm from './CardForm';
import { FiPlus, FiMoreVertical } from 'react-icons/fi';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';

interface ColumnProps {
  column: ColumnType;
  board: Board;
  setData: React.Dispatch<React.SetStateAction<KanbanData | null>>;
  kanbanData: KanbanData;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
}

const Column = ({ column, board, setData, kanbanData, dragHandleProps }: ColumnProps) => {
  const [showCardForm, setShowCardForm] = useState(false);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [columnTitle, setColumnTitle] = useState(column.title);

  // Add a new card to the column
  const addCard = (card: CardType) => {
    const updatedColumn = {
      ...column,
      cards: [...column.cards, card]
    };

    const updatedColumns = board.columns.map(col => 
      col.id === column.id ? updatedColumn : col
    );

    const updatedBoard = {
      ...board,
      columns: updatedColumns
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

    setShowCardForm(false);
  };

  // Delete the column
  const deleteColumn = () => {
    const updatedColumns = board.columns.filter(col => col.id !== column.id);
    
    const updatedBoard = {
      ...board,
      columns: updatedColumns
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
  };

  // Update column title
  const updateColumnTitle = () => {
    if (!columnTitle.trim() || columnTitle === column.title) {
      setColumnTitle(column.title);
      setEditingTitle(false);
      return;
    }

    const updatedColumn = {
      ...column,
      title: columnTitle
    };

    const updatedColumns = board.columns.map(col => 
      col.id === column.id ? updatedColumn : col
    );

    const updatedBoard = {
      ...board,
      columns: updatedColumns
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

    setEditingTitle(false);
  };

  return (
    <div className="bg-gray-800 rounded-md shadow-md flex flex-col h-full" data-column-id={column.id}>
      <div className="p-3 flex items-center justify-between border-b border-gray-700" {...dragHandleProps}>
        {editingTitle ? (
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              updateColumnTitle();
            }}
            className="flex-1"
          >
            <input
              type="text"
              className="w-full px-2 py-1 border rounded-md bg-gray-700 border-gray-600 text-white"
              value={columnTitle}
              onChange={e => setColumnTitle(e.target.value)}
              onBlur={updateColumnTitle}
              autoFocus
            />
          </form>
        ) : (
          <h3 
            className="font-medium text-white cursor-pointer"
            onClick={() => setEditingTitle(true)}
          >
            {column.title} <span className="text-gray-400 text-sm">({column.cards.length})</span>
          </h3>
        )}
        
        <div className="relative">
          <button
            className="p-1 rounded-full hover:bg-gray-700 text-white"
            onClick={() => setShowColumnMenu(!showColumnMenu)}
          >
            <FiMoreVertical />
          </button>
          
          {showColumnMenu && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-gray-800 shadow-lg rounded-md z-10 overflow-hidden">
              <button
                className="w-full text-left px-4 py-2 text-white hover:bg-gray-700"
                onClick={() => {
                  setEditingTitle(true);
                  setShowColumnMenu(false);
                }}
              >
                Edit Title
              </button>
              <button
                className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700"
                onClick={() => {
                  deleteColumn();
                  setShowColumnMenu(false);
                }}
              >
                Delete Column
              </button>
            </div>
          )}
        </div>
      </div>
      
      <Droppable droppableId={column.id} type="card">
        {(provided, snapshot) => (
          <div 
            className={`flex-1 p-2 overflow-y-auto ${snapshot.isDraggingOver ? 'bg-blue-900/20' : ''}`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {column.cards.map((card, index) => (
              <Card 
                key={card.id} 
                card={card} 
                index={index} 
                column={column}
                board={board}
                setData={setData}
                kanbanData={kanbanData}
              />
            ))}
            {provided.placeholder}
            
            {showCardForm ? (
              <CardForm 
                onSubmit={addCard} 
                onCancel={() => setShowCardForm(false)}
                kanbanData={kanbanData}
              />
            ) : (
              <button
                className="w-full mt-2 p-2 flex items-center justify-center text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md shadow-sm transition-colors"
                onClick={() => setShowCardForm(true)}
                data-add-card
              >
                <FiPlus className="mr-2" />
                Add Card
              </button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Column; 