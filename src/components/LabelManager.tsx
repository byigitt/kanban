import { useState } from 'react';
import { KanbanData, Label } from '../types';
import { FiX } from 'react-icons/fi';

interface LabelManagerProps {
  kanbanData: KanbanData;
  setData: React.Dispatch<React.SetStateAction<KanbanData | null>>;
  onClose: () => void;
}

const LabelManager = ({ kanbanData, setData, onClose }: LabelManagerProps) => {
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#3b82f6'); // Default blue color
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);

  // Get all labels
  const labels = kanbanData.labels || [];

  // Add a new label
  const addLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;

    const newLabel: Label = {
      id: `label-${Date.now()}`,
      name: newLabelName.trim(),
      color: newLabelColor
    };

    setData(prevData => {
      if (!prevData) return null;
      return {
        ...prevData,
        labels: [...(prevData.labels || []), newLabel]
      };
    });

    setNewLabelName('');
    setNewLabelColor('#3b82f6');
  };

  // Update an existing label
  const updateLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLabelId || !newLabelName.trim()) return;

    setData(prevData => {
      if (!prevData) return null;
      return {
        ...prevData,
        labels: (prevData.labels || []).map(label => 
          label.id === editingLabelId 
            ? { ...label, name: newLabelName.trim(), color: newLabelColor }
            : label
        )
      };
    });

    setEditingLabelId(null);
    setNewLabelName('');
    setNewLabelColor('#3b82f6');
  };

  // Delete a label
  const deleteLabel = (labelId: string) => {
    setData(prevData => {
      if (!prevData) return null;
      return {
        ...prevData,
        labels: (prevData.labels || []).filter(label => label.id !== labelId)
      };
    });
  };

  // Start editing a label
  const startEditingLabel = (label: Label) => {
    setEditingLabelId(label.id);
    setNewLabelName(label.name);
    setNewLabelColor(label.color);
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Manage Labels</h2>
          <button 
            className="p-1 rounded-full hover:bg-gray-700 text-white"
            onClick={onClose}
          >
            <FiX />
          </button>
        </div>
        
        <div className="p-4">
          <form onSubmit={editingLabelId ? updateLabel : addLabel} className="mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Label Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md bg-gray-700 border-gray-600 text-white"
                value={newLabelName}
                onChange={e => setNewLabelName(e.target.value)}
                placeholder="Enter label name"
                autoFocus
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Label Color
              </label>
              <div className="flex items-center">
                <input
                  type="color"
                  className="h-10 w-10 border-0 p-0 mr-2"
                  value={newLabelColor}
                  onChange={e => setNewLabelColor(e.target.value)}
                />
                <div 
                  className="flex-1 px-3 py-2 rounded-md"
                  style={{ 
                    backgroundColor: newLabelColor,
                    color: getContrastColor(newLabelColor)
                  }}
                >
                  {newLabelName || 'Label Preview'}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              {editingLabelId && (
                <button
                  type="button"
                  className="px-3 py-1 text-sm mr-2 text-gray-300 hover:text-white"
                  onClick={() => {
                    setEditingLabelId(null);
                    setNewLabelName('');
                    setNewLabelColor('#3b82f6');
                  }}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={!newLabelName.trim()}
              >
                {editingLabelId ? 'Update Label' : 'Add Label'}
              </button>
            </div>
          </form>
          
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Existing Labels</h3>
            {labels.length === 0 ? (
              <p className="text-gray-400">No labels created yet.</p>
            ) : (
              <ul className="space-y-2">
                {labels.map(label => (
                  <li 
                    key={label.id} 
                    className="flex items-center justify-between p-2 rounded-md"
                    style={{ 
                      backgroundColor: label.color,
                      color: getContrastColor(label.color)
                    }}
                  >
                    <span>{label.name}</span>
                    <div className="flex items-center">
                      <button
                        className="p-1 rounded-full hover:bg-black/10 mr-1"
                        onClick={() => startEditingLabel(label)}
                        title="Edit Label"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                        </svg>
                      </button>
                      <button
                        className="p-1 rounded-full hover:bg-black/10"
                        onClick={() => deleteLabel(label.id)}
                        title="Delete Label"
                      >
                        <FiX />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabelManager; 