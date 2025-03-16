import { useState } from 'react';
import { Label, Priority, FilterOptions } from '../types';
import { FiFilter, FiX, FiCalendar, FiFlag } from 'react-icons/fi';

interface FilterPanelProps {
  labels: Label[];
  filterOptions: FilterOptions;
  setFilterOptions: (options: FilterOptions) => void;
}

const FilterPanel = ({ 
  labels, 
  filterOptions, 
  setFilterOptions 
}: FilterPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'labels' | 'priority' | 'dueDate'>('labels');
  
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
    const newLabelIds = filterOptions.labelIds.includes(labelId)
      ? filterOptions.labelIds.filter(id => id !== labelId)
      : [...filterOptions.labelIds, labelId];
    
    setFilterOptions({
      ...filterOptions,
      labelIds: newLabelIds
    });
  };

  // Set priority filter
  const setPriorityFilter = (priority: Priority | null) => {
    setFilterOptions({
      ...filterOptions,
      priority
    });
  };

  // Set due date filter
  const setDueDateFilter = (dueDateFilter: 'overdue' | 'today' | 'thisWeek' | 'future' | null) => {
    setFilterOptions({
      ...filterOptions,
      dueDateFilter
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterOptions({
      labelIds: [],
      priority: null,
      dueDateFilter: null
    });
  };

  // Count active filters
  const activeFilterCount = 
    (filterOptions.labelIds.length > 0 ? 1 : 0) + 
    (filterOptions.priority ? 1 : 0) + 
    (filterOptions.dueDateFilter ? 1 : 0);

  return (
    <div className="relative">
      <button
        className={`flex items-center px-3 py-2 rounded-md ${
          activeFilterCount > 0 ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'
        } transition-colors`}
        onClick={() => setIsOpen(!isOpen)}
        title="Filter cards"
      >
        <FiFilter className="mr-2" />
        <span>Filter</span>
        {activeFilterCount > 0 && (
          <span className="ml-2 bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            {activeFilterCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-72 bg-gray-800 shadow-lg rounded-md z-10 overflow-hidden">
          <div className="border-b border-gray-700">
            <div className="flex">
              <button
                className={`flex-1 py-2 px-3 text-sm font-medium ${
                  activeTab === 'labels' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('labels')}
              >
                Labels
                {filterOptions.labelIds.length > 0 && (
                  <span className="ml-1 text-xs bg-blue-500 text-white rounded-full px-1.5 py-0.5">
                    {filterOptions.labelIds.length}
                  </span>
                )}
              </button>
              <button
                className={`flex-1 py-2 px-3 text-sm font-medium ${
                  activeTab === 'priority' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('priority')}
              >
                Priority
                {filterOptions.priority && (
                  <span className="ml-1 text-xs bg-blue-500 text-white rounded-full px-1.5 py-0.5">
                    1
                  </span>
                )}
              </button>
              <button
                className={`flex-1 py-2 px-3 text-sm font-medium ${
                  activeTab === 'dueDate' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('dueDate')}
              >
                Due Date
                {filterOptions.dueDateFilter && (
                  <span className="ml-1 text-xs bg-blue-500 text-white rounded-full px-1.5 py-0.5">
                    1
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="p-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-gray-400">
                {activeTab === 'labels' && 'Filter by Labels'}
                {activeTab === 'priority' && 'Filter by Priority'}
                {activeTab === 'dueDate' && 'Filter by Due Date'}
              </h3>
              {activeFilterCount > 0 && (
                <button
                  className="text-xs text-blue-400 hover:text-blue-300"
                  onClick={clearFilters}
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Labels Tab */}
            {activeTab === 'labels' && (
              <div className="space-y-2">
                {labels.length === 0 ? (
                  <p className="text-gray-400 text-sm">No labels available.</p>
                ) : (
                  labels.map(label => (
                    <div
                      key={label.id}
                      className={`flex items-center p-2 rounded-md cursor-pointer ${
                        filterOptions.labelIds.includes(label.id) ? 'ring-2 ring-blue-500' : ''
                      }`}
                      style={{
                        backgroundColor: label.color,
                        color: getContrastColor(label.color)
                      }}
                      onClick={() => toggleLabel(label.id)}
                    >
                      <span className="flex-1">{label.name}</span>
                      {filterOptions.labelIds.includes(label.id) && <FiX />}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Priority Tab */}
            {activeTab === 'priority' && (
              <div className="space-y-2">
                {(['low', 'medium', 'high', 'urgent'] as Priority[]).map(priority => (
                  <div
                    key={priority}
                    className={`flex items-center p-2 rounded-md cursor-pointer bg-gray-700 hover:bg-gray-600 ${
                      filterOptions.priority === priority ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setPriorityFilter(filterOptions.priority === priority ? null : priority)}
                  >
                    <FiFlag className={`mr-2 ${
                      priority === 'low' ? 'text-green-400' :
                      priority === 'medium' ? 'text-yellow-400' :
                      priority === 'high' ? 'text-orange-400' :
                      'text-red-400'
                    }`} />
                    <span className="flex-1 capitalize">{priority}</span>
                    {filterOptions.priority === priority && <FiX />}
                  </div>
                ))}
              </div>
            )}

            {/* Due Date Tab */}
            {activeTab === 'dueDate' && (
              <div className="space-y-2">
                {[
                  { id: 'overdue', label: 'Overdue' },
                  { id: 'today', label: 'Due Today' },
                  { id: 'thisWeek', label: 'Due This Week' },
                  { id: 'future', label: 'Future' }
                ].map(option => (
                  <div
                    key={option.id}
                    className={`flex items-center p-2 rounded-md cursor-pointer bg-gray-700 hover:bg-gray-600 ${
                      filterOptions.dueDateFilter === option.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setDueDateFilter(
                      filterOptions.dueDateFilter === option.id 
                        ? null 
                        : option.id as 'overdue' | 'today' | 'thisWeek' | 'future'
                    )}
                  >
                    <FiCalendar className="mr-2 text-blue-400" />
                    <span className="flex-1">{option.label}</span>
                    {filterOptions.dueDateFilter === option.id && <FiX />}
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

export default FilterPanel; 