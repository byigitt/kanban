import { useState } from 'react';
import { Card, KanbanData, Priority } from '../types';
import { format } from 'date-fns';

interface CardFormProps {
  onSubmit: (card: Card) => void;
  onCancel: () => void;
  kanbanData: KanbanData;
  editCard?: Card;
}

const CardForm = ({ onSubmit, onCancel, kanbanData, editCard }: CardFormProps) => {
  const [title, setTitle] = useState(editCard?.title || '');
  const [description, setDescription] = useState(editCard?.description || '');
  const [dueDate, setDueDate] = useState(editCard?.dueDate ? format(new Date(editCard.dueDate), 'yyyy-MM-dd') : '');
  const [priority, setPriority] = useState<Priority>(editCard?.priority || 'medium');
  const [selectedLabels, setSelectedLabels] = useState<string[]>(editCard?.labels || []);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(editCard?.assignees || []);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newCard: Card = {
      id: editCard?.id || `card-${Date.now()}`,
      title,
      description,
      createdAt: editCard?.createdAt || new Date().toISOString(),
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      priority,
      assignees: selectedAssignees,
      labels: selectedLabels,
      comments: editCard?.comments || [],
      activity: editCard?.activity || [
        {
          id: `activity-${Date.now()}`,
          type: editCard ? 'edit' : 'create',
          userId: 'system', // In a real app, this would be the current user's ID
          timestamp: new Date().toISOString(),
          details: {}
        }
      ]
    };

    onSubmit(newCard);
  };

  const toggleLabel = (labelId: string) => {
    setSelectedLabels(prev => 
      prev.includes(labelId) 
        ? prev.filter(id => id !== labelId) 
        : [...prev, labelId]
    );
  };

  const toggleAssignee = (userId: string) => {
    setSelectedAssignees(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  return (
    <div className="bg-white dark:bg-gray-700 p-3 rounded-md shadow-md mb-2">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="text"
            placeholder="Card Title"
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
          />
        </div>
        
        <div className="mb-3">
          <textarea
            placeholder="Description"
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 min-h-[80px]"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
        
        <button
          type="button"
          className="text-sm text-blue-500 mb-3"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
        </button>
        
        {showAdvanced && (
          <div className="space-y-3 mb-3">
            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            {kanbanData.labels && kanbanData.labels.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Labels</label>
                <div className="flex flex-wrap gap-2">
                  {kanbanData.labels.map(label => (
                    <button
                      key={label.id}
                      type="button"
                      className={`px-3 py-1 rounded-full text-xs ${
                        selectedLabels.includes(label.id) ? 'ring-2 ring-blue-500' : ''
                      }`}
                      style={{ 
                        backgroundColor: label.color,
                        color: getContrastColor(label.color)
                      }}
                      onClick={() => toggleLabel(label.id)}
                    >
                      {label.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {kanbanData.users && kanbanData.users.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-1">Assignees</label>
                <div className="flex flex-wrap gap-2">
                  {kanbanData.users.map(user => (
                    <button
                      key={user.id}
                      type="button"
                      className={`flex items-center px-3 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-600 ${
                        selectedAssignees.includes(user.id) ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => toggleAssignee(user.id)}
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
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="button"
            className="px-3 py-1 text-sm mr-2"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
            disabled={!title.trim()}
          >
            {editCard ? 'Save Changes' : 'Add Card'}
          </button>
        </div>
      </form>
    </div>
  );
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

export default CardForm; 