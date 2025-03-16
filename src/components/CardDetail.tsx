import { useState } from 'react';
import { Card as CardType, Column, Board, KanbanData, Comment, Activity } from '../types';
import CardForm from './CardForm';
import { format, formatDistanceToNow } from 'date-fns';
import { FiX, FiClock, FiTrash2, FiEdit2 } from 'react-icons/fi';

interface CardDetailProps {
  card: CardType;
  column: Column;
  board: Board;
  setData: React.Dispatch<React.SetStateAction<KanbanData | null>>;
  kanbanData: KanbanData;
  onClose: () => void;
}

const CardDetail = ({ card, column, board, setData, kanbanData, onClose }: CardDetailProps) => {
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'activity'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState('');

  // Get label by ID
  const getLabel = (labelId: string) => {
    return kanbanData.labels?.find(label => label.id === labelId);
  };

  // Get user by ID
  const getUser = (userId: string) => {
    return kanbanData.users?.find(user => user.id === userId);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Update card
  const updateCard = (updatedCard: CardType) => {
    const updatedCards = column.cards.map(c => 
      c.id === card.id ? updatedCard : c
    );

    const updatedColumns = board.columns.map(col => 
      col.id === column.id ? { ...col, cards: updatedCards } : col
    );

    const updatedBoards = kanbanData.boards.map(b => 
      b.id === board.id ? { ...b, columns: updatedColumns } : b
    );

    setData({ ...kanbanData, boards: updatedBoards });
    setIsEditing(false);
  };

  // Delete card
  const deleteCard = () => {
    if (!window.confirm('Are you sure you want to delete this card?')) return;

    const updatedCards = column.cards.filter(c => c.id !== card.id);

    const updatedColumns = board.columns.map(col => 
      col.id === column.id ? { ...col, cards: updatedCards } : col
    );

    const updatedBoards = kanbanData.boards.map(b => 
      b.id === board.id ? { ...b, columns: updatedColumns } : b
    );

    setData({ ...kanbanData, boards: updatedBoards });
    onClose();
  };

  // Add comment
  const addComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      text: newComment,
      userId: 'system', // In a real app, this would be the current user's ID
      createdAt: new Date().toISOString()
    };

    const activity: Activity = {
      id: `activity-${Date.now()}`,
      type: 'comment',
      userId: 'system',
      timestamp: new Date().toISOString(),
      details: {}
    };

    const updatedCard = {
      ...card,
      comments: [...card.comments, comment],
      activity: [...card.activity, activity]
    };

    updateCard(updatedCard);
    setNewComment('');
    setActiveTab('comments');
  };

  if (isEditing) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold">Edit Card</h2>
            <button 
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsEditing(false)}
            >
              <FiX />
            </button>
          </div>
          <div className="p-4">
            <CardForm 
              onSubmit={updateCard} 
              onCancel={() => setIsEditing(false)}
              kanbanData={kanbanData}
              editCard={card}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">{card.title}</h2>
          <div className="flex items-center space-x-2">
            <button 
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500"
              onClick={() => setIsEditing(true)}
              title="Edit Card"
            >
              <FiEdit2 />
            </button>
            <button 
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
              onClick={deleteCard}
              title="Delete Card"
            >
              <FiTrash2 />
            </button>
            <button 
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={onClose}
            >
              <FiX />
            </button>
          </div>
        </div>
        
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'details' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'comments' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('comments')}
          >
            Comments ({card.comments.length})
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'activity' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            Activity
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'details' && (
            <div className="p-4">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</h3>
                <p className="whitespace-pre-wrap">{card.description || 'No description provided.'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Created</h3>
                  <p>{formatDate(card.createdAt)}</p>
                </div>
                
                {card.dueDate && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Due Date</h3>
                    <div className="flex items-center">
                      <FiClock className="mr-1" />
                      {formatDate(card.dueDate)}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Priority</h3>
                <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(card.priority)}`}>
                  {card.priority}
                </span>
              </div>
              
              {card.labels.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Labels</h3>
                  <div className="flex flex-wrap gap-2">
                    {card.labels.map(labelId => {
                      const label = getLabel(labelId);
                      return label ? (
                        <span
                          key={label.id}
                          className="px-3 py-1 rounded-full text-xs"
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
                </div>
              )}
              
              {card.assignees.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Assignees</h3>
                  <div className="flex flex-wrap gap-2">
                    {card.assignees.map(userId => {
                      const user = getUser(userId);
                      return user ? (
                        <div 
                          key={user.id} 
                          className="flex items-center px-3 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700"
                        >
                          <div className="w-4 h-4 rounded-full mr-1 overflow-hidden">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white">
                                {user.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          {user.name}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'comments' && (
            <div className="p-4">
              <form onSubmit={addComment} className="mb-4">
                <textarea
                  placeholder="Add a comment..."
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 min-h-[80px]"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    disabled={!newComment.trim()}
                  >
                    Add Comment
                  </button>
                </div>
              </form>
              
              {card.comments.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">No comments yet.</p>
              ) : (
                <div className="space-y-4">
                  {card.comments.map(comment => {
                    const user = getUser(comment.userId);
                    return (
                      <div key={comment.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <div className="flex items-center mb-2">
                          <div className="w-6 h-6 rounded-full mr-2 overflow-hidden">
                            {user?.avatar ? (
                              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xs">
                                {user?.name.charAt(0) || 'S'}
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-medium">{user?.name || 'System'}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        <p className="whitespace-pre-wrap">{comment.text}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'activity' && (
            <div className="p-4">
              {card.activity.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">No activity yet.</p>
              ) : (
                <div className="space-y-3">
                  {card.activity.map(activity => {
                    const user = getUser(activity.userId);
                    return (
                      <div key={activity.id} className="flex items-start">
                        <div className="w-6 h-6 rounded-full mr-2 overflow-hidden flex-shrink-0">
                          {user?.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xs">
                              {user?.name.charAt(0) || 'S'}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium">{user?.name || 'System'}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm">
                            {getActivityText(activity)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to get priority color
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'low':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'medium':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'high':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'urgent':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};

// Helper function to determine text color based on background color
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
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

// Helper function to get activity text
const getActivityText = (activity: Activity) => {
  switch (activity.type) {
    case 'create':
      return 'created this card';
    case 'move':
      return `moved this card from ${activity.details.from} to ${activity.details.to}`;
    case 'edit':
      if (activity.details.field) {
        return `updated ${activity.details.field} from "${activity.details.oldValue}" to "${activity.details.newValue}"`;
      }
      return 'updated this card';
    case 'comment':
      return 'commented on this card';
    case 'assign':
      return `assigned this card to ${activity.details.to}`;
    default:
      return 'performed an action on this card';
  }
};

export default CardDetail; 