import { useState, useRef, useEffect } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Board as BoardType, KanbanData, Column as ColumnType, Card as CardType } from '../types';
import Column from './Column';
import LabelFilter from './LabelFilter';
import { FiPlus, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface BoardProps {
  board: BoardType;
  setData: React.Dispatch<React.SetStateAction<KanbanData | null>>;
  kanbanData: KanbanData;
}

const Board = ({ board, setData, kanbanData }: BoardProps) => {
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [showNewColumnForm, setShowNewColumnForm] = useState(false);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Check scroll position to show/hide fade indicators
  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftFade(scrollLeft > 0);
    setShowRightFade(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer
  };

  // Add scroll event listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScroll);
      // Initial check
      checkScroll();
      
      // Check on resize
      window.addEventListener('resize', checkScroll);
      
      return () => {
        scrollContainer.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  // Scroll left/right
  const scrollBoard = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const scrollAmount = 300; // pixels to scroll
    const currentScroll = scrollContainerRef.current.scrollLeft;
    const newScroll = direction === 'left' 
      ? currentScroll - scrollAmount 
      : currentScroll + scrollAmount;
    
    scrollContainerRef.current.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    });
  };

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
    
    // Scroll to the right to show the new column
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          left: scrollContainerRef.current.scrollWidth,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  // Filter cards based on selected labels
  const filterCards = (cards: CardType[]): CardType[] => {
    if (selectedLabelIds.length === 0) return cards;
    
    return cards.filter(card => 
      selectedLabelIds.some(labelId => card.labels.includes(labelId))
    );
  };

  return (
    <main className="container mx-auto px-4 py-6">
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

      <div className="relative">
        {/* Scroll fade indicators */}
        <div className={`scroll-fade-indicator scroll-fade-left ${showLeftFade ? '' : 'scroll-fade-hidden'}`}></div>
        <div className={`scroll-fade-indicator scroll-fade-right ${showRightFade ? '' : 'scroll-fade-hidden'}`}></div>
        
        {/* Scroll buttons */}
        <button 
          className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-gray-700 hover:bg-gray-600 text-white rounded-full p-2 shadow-lg ${showLeftFade ? 'opacity-100' : 'opacity-0'} transition-opacity`}
          onClick={() => scrollBoard('left')}
          disabled={!showLeftFade}
          aria-label="Scroll left"
        >
          <FiChevronLeft />
        </button>
        
        <button 
          className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-gray-700 hover:bg-gray-600 text-white rounded-full p-2 shadow-lg ${showRightFade ? 'opacity-100' : 'opacity-0'} transition-opacity`}
          onClick={() => scrollBoard('right')}
          disabled={!showRightFade}
          aria-label="Scroll right"
        >
          <FiChevronRight />
        </button>

        <Droppable droppableId="board-columns" direction="horizontal" type="column">
          {(provided) => (
            <div 
              className="board-scroll-container hide-scrollbar overflow-x-auto min-h-[calc(100vh-200px)] pb-4"
              ref={(el) => {
                // Combine refs
                provided.innerRef(el);
                if (scrollContainerRef) {
                  scrollContainerRef.current = el;
                }
              }}
              {...provided.droppableProps}
            >
              <div className="flex space-x-4 pb-2">
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
            </div>
          )}
        </Droppable>
      </div>
    </main>
  );
};

export default Board; 