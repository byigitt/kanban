import { useState } from 'react';
import { Label } from '../types';
import { FiFilter, FiX } from 'react-icons/fi';

interface LabelFilterProps {
  labels: Label[];
  selectedLabels: string[];
  setSelectedLabels: (labelIds: string[]) => void;
}

const LabelFilter = ({ labels, selectedLabels, setSelectedLabels }: LabelFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

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
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  // Toggle a label selection
  const toggleLabel = (labelId: string) => {
    setSelectedLabels(
      selectedLabels.includes(labelId)
        ? selectedLabels.filter(id => id !== labelId)
        : [...selectedLabels, labelId]
    );
  };

  // Clear all selected labels
  const clearFilters = () => {
    setSelectedLabels([]);
  };

  return (
    <div className="relative">
      <button
        className={`flex items-center px-3 py-2 rounded-md ${
          selectedLabels.length > 0 ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'
        } transition-colors`}
        onClick={() => setIsOpen(!isOpen)}
        title="Filter by labels"
      >
        <FiFilter className="mr-2" />
        <span>Filter</span>
        {selectedLabels.length > 0 && (
          <span className="ml-2 bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            {selectedLabels.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-gray-800 shadow-lg rounded-md z-10 overflow-hidden">
          <div className="p-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-gray-400">Filter by Labels</h3>
              {selectedLabels.length > 0 && (
                <button
                  className="text-xs text-blue-400 hover:text-blue-300"
                  onClick={clearFilters}
                >
                  Clear all
                </button>
              )}
            </div>

            {labels.length === 0 ? (
              <p className="text-gray-400 text-sm">No labels available.</p>
            ) : (
              <div className="space-y-2">
                {labels.map(label => (
                  <div
                    key={label.id}
                    className={`flex items-center p-2 rounded-md cursor-pointer ${
                      selectedLabels.includes(label.id) ? 'ring-2 ring-blue-500' : ''
                    }`}
                    style={{
                      backgroundColor: label.color,
                      color: getContrastColor(label.color)
                    }}
                    onClick={() => toggleLabel(label.id)}
                  >
                    <span className="flex-1">{label.name}</span>
                    {selectedLabels.includes(label.id) && <FiX />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LabelFilter; 