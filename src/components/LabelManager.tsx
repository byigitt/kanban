import { useState, useMemo } from 'react';
import { KanbanData, Label } from '../types';
import { FiX, FiArrowUp, FiArrowDown, FiCheck, FiList, FiTag, FiTrash2, FiEdit2 } from 'react-icons/fi';

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
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionColor, setBulkActionColor] = useState('#3b82f6');
  const [showBulkColorPresets, setShowBulkColorPresets] = useState(false);

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

  // Toggle label selection for bulk actions
  const toggleLabelSelection = (labelId: string) => {
    setSelectedLabelIds(prev => 
      prev.includes(labelId) 
        ? prev.filter(id => id !== labelId) 
        : [...prev, labelId]
    );
  };

  // Select all labels
  const selectAllLabels = () => {
    const allLabelIds = (kanbanData.labels || []).map(label => label.id);
    setSelectedLabelIds(allLabelIds);
  };

  // Deselect all labels
  const deselectAllLabels = () => {
    setSelectedLabelIds([]);
  };

  // Bulk delete selected labels
  const bulkDeleteLabels = () => {
    if (selectedLabelIds.length === 0) return;
    
    // Filter out the selected labels
    const updatedLabels = (kanbanData.labels || []).filter(
      label => !selectedLabelIds.includes(label.id)
    );
    
    // Update all cards to remove the deleted labels
    const updatedBoards = kanbanData.boards.map(board => {
      const updatedColumns = board.columns.map(column => {
        const updatedCards = column.cards.map(card => {
          return {
            ...card,
            labels: card.labels.filter(labelId => !selectedLabelIds.includes(labelId))
          };
        });
        return { ...column, cards: updatedCards };
      });
      return { ...board, columns: updatedColumns };
    });
    
    // Update the data
    setData(prevData => {
      if (!prevData) return null;
      return {
        ...prevData,
        labels: updatedLabels,
        boards: updatedBoards
      };
    });
    
    // Clear selection
    setSelectedLabelIds([]);
    setShowBulkActions(false);
  };

  // Bulk update color for selected labels
  const bulkUpdateColor = () => {
    if (selectedLabelIds.length === 0) return;
    
    // Update the color of selected labels
    const updatedLabels = (kanbanData.labels || []).map(label => 
      selectedLabelIds.includes(label.id)
        ? { ...label, color: bulkActionColor }
        : label
    );
    
    // Update the data
    setData(prevData => {
      if (!prevData) return null;
      return {
        ...prevData,
        labels: updatedLabels
      };
    });
    
    // Hide color presets
    setShowBulkColorPresets(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Manage Labels</h2>
          <button 
            className="p-1 rounded-full hover:bg-gray-800"
            onClick={onClose}
          >
            <FiX className="text-gray-400 hover:text-white" />
          </button>
        </div>
        
        <div className="p-4">
          {/* Label sorting controls */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <label className="text-sm text-gray-400 mr-2">Sort by:</label>
              <select 
                className="bg-gray-800 text-white border border-gray-700 rounded-md px-2 py-1 text-sm"
                value={sortOption}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
              >
                <option value="name">Name</option>
                <option value="color">Color</option>
                <option value="usage">Usage</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
              <button 
                className="ml-2 p-1 rounded-md hover:bg-gray-800"
                onClick={toggleSortDirection}
                title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
              >
                {sortDirection === 'asc' ? (
                  <FiArrowUp className="text-gray-400" />
                ) : (
                  <FiArrowDown className="text-gray-400" />
                )}
              </button>
            </div>
            
            {/* Bulk actions toggle */}
            <button
              className={`flex items-center px-3 py-1 rounded-md text-sm ${
                showBulkActions ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setShowBulkActions(!showBulkActions)}
            >
              <FiList className="mr-1" />
              Bulk Actions
            </button>
          </div>
          
          {/* Bulk actions panel */}
          {showBulkActions && (
            <div className="mb-4 p-3 bg-gray-800 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <div className="flex space-x-2">
                  <button
                    className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-md"
                    onClick={selectAllLabels}
                  >
                    Select All
                  </button>
                  <button
                    className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-md"
                    onClick={deselectAllLabels}
                    disabled={selectedLabelIds.length === 0}
                  >
                    Deselect All
                  </button>
                </div>
                <div className="text-sm text-gray-400">
                  {selectedLabelIds.length} selected
                </div>
              </div>
              
              {selectedLabelIds.length > 0 && (
                <div className="flex space-x-2 mt-3">
                  {/* Bulk color change */}
                  <div className="relative">
                    <button
                      className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-md flex items-center"
                      onClick={() => setShowBulkColorPresets(!showBulkColorPresets)}
                    >
                      <div 
                        className="w-3 h-3 rounded-sm mr-1"
                        style={{ backgroundColor: bulkActionColor }}
                      ></div>
                      Change Color
                    </button>
                    
                    {showBulkColorPresets && (
                      <div className="absolute top-full left-0 mt-1 p-2 bg-gray-800 rounded-md shadow-lg z-10 w-48">
                        <div className="grid grid-cols-6 gap-1 mb-2">
                          {colorPresets.map(color => (
                            <button
                              key={color}
                              className={`w-6 h-6 rounded-md ${
                                bulkActionColor === color ? 'ring-2 ring-white' : ''
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() => setBulkActionColor(color)}
                            ></button>
                          ))}
                        </div>
                        <div className="flex justify-end">
                          <button
                            className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-md"
                            onClick={bulkUpdateColor}
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Bulk delete */}
                  <button
                    className="px-2 py-1 text-xs bg-red-600 hover:bg-red-500 text-white rounded-md flex items-center"
                    onClick={bulkDeleteLabels}
                  >
                    <FiTrash2 className="mr-1" />
                    Delete Selected
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Labels list */}
          <div className="mb-4 max-h-60 overflow-y-auto">
            {labels.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No labels created yet.</p>
            ) : (
              <div className="space-y-2">
                {labels.map(label => (
                  <div 
                    key={label.id}
                    className={`flex items-center p-2 rounded-md ${
                      editingLabelId === label.id ? 'bg-gray-800' : ''
                    }`}
                  >
                    {showBulkActions && (
                      <div className="mr-2">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded-sm"
                          checked={selectedLabelIds.includes(label.id)}
                          onChange={() => toggleLabelSelection(label.id)}
                        />
                      </div>
                    )}
                    
                    {editingLabelId === label.id ? (
                      <form onSubmit={updateLabel} className="flex-1 flex items-center">
                        <div 
                          className="w-6 h-6 rounded-md mr-2 cursor-pointer"
                          style={{ backgroundColor: newLabelColor }}
                          onClick={() => setShowColorPresets(!showColorPresets)}
                        ></div>
                        <input
                          type="text"
                          className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                          value={newLabelName}
                          onChange={(e) => setNewLabelName(e.target.value)}
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="ml-2 p-1 rounded-md hover:bg-gray-700"
                          title="Save"
                        >
                          <FiCheck className="text-green-500" />
                        </button>
                        <button
                          type="button"
                          className="ml-1 p-1 rounded-md hover:bg-gray-700"
                          onClick={() => setEditingLabelId(null)}
                          title="Cancel"
                        >
                          <FiX className="text-gray-400" />
                        </button>
                      </form>
                    ) : (
                      <>
                        <div 
                          className="flex-1 flex items-center p-1 rounded-md"
                          style={{ 
                            backgroundColor: label.color,
                            color: getContrastColor(label.color)
                          }}
                        >
                          <FiTag className="mr-1" />
                          <span>{label.name}</span>
                          <span className="ml-2 text-xs opacity-80">
                            ({labelUsage[label.id] || 0} cards)
                          </span>
                        </div>
                        <div className="flex ml-2">
                          <button
                            className="p-1 rounded-md hover:bg-gray-800"
                            onClick={() => startEditingLabel(label)}
                            title="Edit"
                          >
                            <FiEdit2 className="text-gray-400 hover:text-white" />
                          </button>
                          <button
                            className="p-1 rounded-md hover:bg-gray-800"
                            onClick={() => deleteLabel(label.id)}
                            title="Delete"
                          >
                            <FiTrash2 className="text-gray-400 hover:text-red-500" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Color presets for editing */}
          {showColorPresets && editingLabelId && (
            <div className="mb-4 p-2 bg-gray-800 rounded-md">
              <div className="grid grid-cols-6 gap-2">
                {colorPresets.map(color => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-md ${
                      newLabelColor === color ? 'ring-2 ring-white' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewLabelColor(color)}
                  ></button>
                ))}
              </div>
            </div>
          )}

          {/* Add new label form */}
          <form onSubmit={addLabel} className="mt-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Add New Label</h3>
            <div className="flex items-center">
              <div 
                className="w-8 h-8 rounded-md mr-2 cursor-pointer"
                style={{ backgroundColor: newLabelColor }}
                onClick={() => setShowColorPresets(!showColorPresets)}
              ></div>
              <input
                type="text"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                placeholder="Enter label name"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
              />
              <button
                type="submit"
                className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!newLabelName.trim()}
              >
                Add
              </button>
            </div>
          </form>

          {/* Color presets for new label */}
          {showColorPresets && !editingLabelId && (
            <div className="mt-2 p-2 bg-gray-800 rounded-md">
              <div className="grid grid-cols-6 gap-2">
                {colorPresets.map(color => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-md ${
                      newLabelColor === color ? 'ring-2 ring-white' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewLabelColor(color)}
                  ></button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabelManager; 