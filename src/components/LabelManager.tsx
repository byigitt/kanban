import { useState, useMemo } from 'react';
import { KanbanData, Label } from '../types';
import { FiX, FiArrowUp, FiArrowDown, FiCheck } from 'react-icons/fi';

interface LabelManagerProps {
  kanbanData: KanbanData;
  setData: React.Dispatch<React.SetStateAction<KanbanData | null>>;
  onClose: () => void;
}

type SortOption = 'name' | 'color' | 'usage' | 'newest' | 'oldest';
type SortDirection = 'asc' | 'desc';

const LabelManager = ({ kanbanData, setData, onClose }: LabelManagerProps) => {
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#3b82f6'); // Default blue color
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showColorPresets, setShowColorPresets] = useState(false);

  // Color presets
  const colorPresets = [
    '#ef4444', // red
    '#f97316', // orange
    '#f59e0b', // amber
    '#eab308', // yellow
    '#84cc16', // lime
    '#22c55e', // green
    '#10b981', // emerald
    '#14b8a6', // teal
    '#06b6d4', // cyan
    '#0ea5e9', // sky
    '#3b82f6', // blue
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#a855f7', // purple
    '#d946ef', // fuchsia
    '#ec4899', // pink
    '#f43f5e', // rose
    '#64748b', // slate
  ];

  // Calculate label usage
  const labelUsage = useMemo(() => {
    const usage: Record<string, number> = {};
    
    // Initialize all labels with 0 usage
    (kanbanData.labels || []).forEach(label => {
      usage[label.id] = 0;
    });
    
    // Count usage across all boards
    kanbanData.boards.forEach(board => {
      board.columns.forEach(column => {
        column.cards.forEach(card => {
          card.labels.forEach(labelId => {
            if (usage[labelId] !== undefined) {
              usage[labelId]++;
            }
          });
        });
      });
    });
    
    return usage;
  }, [kanbanData]);

  // Get all labels
  const labels = useMemo(() => {
    const allLabels = [...(kanbanData.labels || [])];
    
    // Sort labels based on selected option
    return allLabels.sort((a, b) => {
      let comparison = 0;
      
      switch (sortOption) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'color':
          comparison = a.color.localeCompare(b.color);
          break;
        case 'usage':
          comparison = (labelUsage[a.id] || 0) - (labelUsage[b.id] || 0);
          break;
        case 'newest':
          // Assuming newer labels have higher IDs (if IDs are timestamp-based)
          comparison = b.id.localeCompare(a.id);
          break;
        case 'oldest':
          // Assuming older labels have lower IDs (if IDs are timestamp-based)
          comparison = a.id.localeCompare(b.id);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [kanbanData.labels, sortOption, sortDirection, labelUsage]);

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
    setShowColorPresets(false);
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
    setShowColorPresets(false);
  };

  // Delete a label
  const deleteLabel = (labelId: string) => {
    // Check if the label is in use
    const isInUse = labelUsage[labelId] > 0;
    
    if (isInUse) {
      const confirmDelete = window.confirm(
        `This label is used in ${labelUsage[labelId]} card(s). Are you sure you want to delete it?`
      );
      if (!confirmDelete) return;
    }

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

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Set sort option
  const handleSortChange = (option: SortOption) => {
    if (sortOption === option) {
      toggleSortDirection();
    } else {
      setSortOption(option);
      setSortDirection('asc');
    }
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
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Manage Labels</h2>
          <button 
            className="p-1 rounded-full hover:bg-gray-700 text-white"
            onClick={onClose}
          >
            <FiX />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
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
              
              <button
                type="button"
                className="text-sm text-blue-400 hover:text-blue-300 mt-2"
                onClick={() => setShowColorPresets(!showColorPresets)}
              >
                {showColorPresets ? 'Hide color presets' : 'Show color presets'}
              </button>
              
              {showColorPresets && (
                <div className="grid grid-cols-6 gap-2 mt-2">
                  {colorPresets.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full ${newLabelColor === color ? 'ring-2 ring-white' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewLabelColor(color)}
                      title={color}
                    >
                      {newLabelColor === color && (
                        <FiCheck 
                          className="w-full h-full" 
                          style={{ color: getContrastColor(color) }} 
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
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
                    setShowColorPresets(false);
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
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-white">Existing Labels</h3>
              <div className="flex items-center">
                <span className="text-sm text-gray-400 mr-2">Sort by:</span>
                <select
                  className="bg-gray-700 border-gray-600 text-white text-sm rounded-md"
                  value={sortOption}
                  onChange={e => handleSortChange(e.target.value as SortOption)}
                >
                  <option value="name">Name</option>
                  <option value="color">Color</option>
                  <option value="usage">Usage</option>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
                <button
                  className="ml-1 p-1 rounded-full hover:bg-gray-700 text-white"
                  onClick={toggleSortDirection}
                  title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {sortDirection === 'asc' ? <FiArrowUp /> : <FiArrowDown />}
                </button>
              </div>
            </div>
            
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
                    <div className="flex flex-col">
                      <span>{label.name}</span>
                      <span className="text-xs opacity-80">
                        Used in {labelUsage[label.id] || 0} card{labelUsage[label.id] !== 1 ? 's' : ''}
                      </span>
                    </div>
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