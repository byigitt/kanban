import { useState, useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Card as CardType, Column, Board, KanbanData, Priority } from '../types';
import CardDetail from './CardDetail';
import { format } from 'date-fns';
import { FiClock } from 'react-icons/fi';

interface CardProps {
  card: CardType;
  index: number;
  column: Column;
  board: Board;
  setData: React.Dispatch<React.SetStateAction<KanbanData | null>>;
  kanbanData: KanbanData;
}

const Card = ({ card, index, column, board, setData, kanbanData }: CardProps) => {
  const [showDetail, setShowDetail] = useState(false);

  // Listen for openCard event
  useEffect(() => {
    const handleOpenCard = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { cardId, columnId, boardId } = customEvent.detail;
      
      if (cardId === card.id && columnId === column.id && boardId === board.id) {
        setShowDetail(true);
      }
    };
    
    window.addEventListener('openCard', handleOpenCard);
    
    return () => {
      window.removeEventListener('openCard', handleOpenCard);
    };
  }, [card.id, column.id, board.id]);

  // Get priority color
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'low':
        return 'bg-green-900 text-green-200';
      case 'medium':
        return 'bg-blue-900 text-blue-200';
      case 'high':
        return 'bg-orange-900 text-orange-200';
      case 'urgent':
        return 'bg-red-900 text-red-200';
      default:
        return 'bg-gray-700 text-gray-200';
    }
  };

  // Get label by ID
  const getLabel = (labelId: string) => {
    return kanbanData.labels?.find(label => label.id === labelId);
  };

  // Get user by ID
  const getUser = (userId: string) => {
    return kanbanData.users?.find(user => user.id === userId);
  };

  // Get contrast color for text based on background color
  const getContrastColor = (hexColor: string) => {
    // Remove # if present
    const color = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;
    
    // Convert to RGB
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black for bright colors, white for dark colors
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  return (
    <>
      <Draggable draggableId={card.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`bg-white dark:bg-gray-800 p-3 rounded-md shadow-md mb-2 cursor-pointer hover:shadow-lg transition-shadow ${
              snapshot.isDragging ? 'opacity-75' : ''
            }`}
            onClick={() => setShowDetail(true)}
          >
            {card.labels.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {card.labels.map(labelId => {
                  const label = getLabel(labelId);
                  return label ? (
                    <span
                      key={label.id}
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{ 
                        backgroundColor: label.color,
                        color: getContrastColor(label.color)
                      }}
                    >
                      {label.name}
                    </span>
                  ) : null;
                })}
              </div>
            )}
            
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">{card.title}</h3>
            
            {card.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">{card.description}</p>
            )}
            
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                {card.priority && (
                  <span className={`px-2 py-0.5 rounded-full mr-2 ${getPriorityColor(card.priority)}`}>
                    {card.priority}
                  </span>
                )}
                
                {card.dueDate && (
                  <span className="flex items-center">
                    <FiClock className="mr-1" />
                    {format(new Date(card.dueDate), 'MMM d')}
                  </span>
                )}
              </div>
              
              {card.assignees.length > 0 && (
                <div className="flex -space-x-1">
                  {card.assignees.slice(0, 3).map(userId => {
                    const user = getUser(userId);
                    return user ? (
                      <div key={user.id} className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden bg-gray-200">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xs">
                            {user.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    ) : null;
                  })}
                  {card.assignees.length > 3 && (
                    <div className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 flex items-center justify-center text-xs">
                      +{card.assignees.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Draggable>
      
      {showDetail && (
        <CardDetail
          card={card}
          column={column}
          board={board}
          setData={setData}
          kanbanData={kanbanData}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
};

export default Card; 