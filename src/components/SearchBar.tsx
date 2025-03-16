import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { KanbanData, Card, Column, Board } from '../types';

interface SearchBarProps {
  kanbanData: KanbanData;
  onSelectResult: (card: Card, column: Column, board: Board) => void;
}

interface SearchResult {
  card: Card;
  column: Column;
  board: Board;
  matchType: 'title' | 'description' | 'comment';
  matchText: string;
}

const SearchBar = ({ kanbanData, onSelectResult }: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Search for cards matching the search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const results: SearchResult[] = [];

    // Search across all boards
    kanbanData.boards.forEach(board => {
      board.columns.forEach(column => {
        column.cards.forEach(card => {
          // Search in title
          if (card.title.toLowerCase().includes(term)) {
            results.push({
              card,
              column,
              board,
              matchType: 'title',
              matchText: card.title
            });
          }
          // Search in description
          else if (card.description && card.description.toLowerCase().includes(term)) {
            const matchIndex = card.description.toLowerCase().indexOf(term);
            const startIndex = Math.max(0, matchIndex - 20);
            const endIndex = Math.min(card.description.length, matchIndex + term.length + 20);
            const matchText = '...' + card.description.substring(startIndex, endIndex) + '...';
            
            results.push({
              card,
              column,
              board,
              matchType: 'description',
              matchText
            });
          }
          // Search in comments
          else {
            const matchingComment = card.comments.find(comment => 
              comment.text.toLowerCase().includes(term)
            );
            
            if (matchingComment) {
              const matchIndex = matchingComment.text.toLowerCase().indexOf(term);
              const startIndex = Math.max(0, matchIndex - 20);
              const endIndex = Math.min(matchingComment.text.length, matchIndex + term.length + 20);
              const matchText = '...' + matchingComment.text.substring(startIndex, endIndex) + '...';
              
              results.push({
                card,
                column,
                board,
                matchType: 'comment',
                matchText
              });
            }
          }
        });
      });
    });

    setSearchResults(results);
  }, [searchTerm, kanbanData]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedResultIndex(prev => 
        prev < searchResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedResultIndex(prev => prev > 0 ? prev - 1 : 0);
    } else if (e.key === 'Enter' && selectedResultIndex >= 0) {
      e.preventDefault();
      const result = searchResults[selectedResultIndex];
      handleSelectResult(result);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsSearching(false);
      setSearchTerm('');
    }
  };

  // Scroll selected result into view
  useEffect(() => {
    if (selectedResultIndex >= 0 && resultsContainerRef.current) {
      const selectedElement = resultsContainerRef.current.children[selectedResultIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedResultIndex]);

  // Handle selecting a search result
  const handleSelectResult = (result: SearchResult) => {
    onSelectResult(result.card, result.column, result.board);
    setIsSearching(false);
    setSearchTerm('');
  };

  // Focus search input when opening search
  useEffect(() => {
    if (isSearching && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearching]);

  // Highlight matching text
  const highlightMatch = (text: string, term: string) => {
    if (!term.trim()) return text;
    
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, i) => 
          regex.test(part) ? <mark key={i} className="bg-yellow-500 text-black px-0.5 rounded">{part}</mark> : part
        )}
      </>
    );
  };

  return (
    <div className="relative">
      <button
        className="flex items-center px-3 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white transition-colors"
        onClick={() => setIsSearching(true)}
        title="Search cards"
      >
        <FiSearch className="mr-2" />
        <span>Search</span>
      </button>

      {isSearching && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex items-center">
              <FiSearch className="text-gray-400 mr-2" />
              <input
                ref={searchInputRef}
                type="text"
                className="flex-1 bg-transparent border-none outline-none text-white"
                placeholder="Search for cards by title, description, or comments..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <button
                className="p-1 rounded-full hover:bg-gray-700 text-white"
                onClick={() => {
                  setIsSearching(false);
                  setSearchTerm('');
                }}
              >
                <FiX />
              </button>
            </div>

            <div 
              ref={resultsContainerRef}
              className="max-h-[60vh] overflow-y-auto"
            >
              {searchResults.length === 0 ? (
                searchTerm ? (
                  <div className="p-4 text-center text-gray-400">
                    No results found for "{searchTerm}"
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-400">
                    Type to search for cards
                  </div>
                )
              ) : (
                <div className="divide-y divide-gray-700">
                  {searchResults.map((result, index) => (
                    <div
                      key={`${result.card.id}-${result.matchType}`}
                      className={`p-4 hover:bg-gray-700 cursor-pointer ${
                        index === selectedResultIndex ? 'bg-gray-700' : ''
                      }`}
                      onClick={() => handleSelectResult(result)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium text-white">
                          {highlightMatch(result.card.title, searchTerm)}
                        </h3>
                        <span className="text-xs text-gray-400">
                          {result.board.title} &gt; {result.column.title}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mb-1">
                        {result.matchType === 'title' ? (
                          <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full mr-2">
                            Title
                          </span>
                        ) : result.matchType === 'description' ? (
                          <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full mr-2">
                            Description
                          </span>
                        ) : (
                          <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full mr-2">
                            Comment
                          </span>
                        )}
                        {highlightMatch(result.matchText, searchTerm)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar; 