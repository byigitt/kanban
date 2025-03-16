import { KanbanData } from "../types";

type ShortcutHandler = (
  e: KeyboardEvent,
  data: KanbanData,
  setData: React.Dispatch<React.SetStateAction<KanbanData | null>>
) => void;

interface ShortcutMap {
  [key: string]: ShortcutHandler;
}

// Define keyboard shortcuts
const shortcuts: ShortcutMap = {
  // Create a new card in the first column of the active board
  n: (e, data, setData) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();

      const activeBoard = data.boards.find(
        (board) => board.id === data.activeBoard
      );
      if (!activeBoard || activeBoard.columns.length === 0) return;

      // Trigger the "Add Card" button click in the first column
      const addCardButton = document.querySelector(
        `[data-column-id="${activeBoard.columns[0].id}"] [data-add-card]`
      );
      if (addCardButton instanceof HTMLElement) {
        addCardButton.click();
      }
    }
  },

  // Create a new column
  m: (e, data, setData) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();

      // Trigger the "Add Column" button click
      const addColumnButton = document.querySelector("[data-add-column]");
      if (addColumnButton instanceof HTMLElement) {
        addColumnButton.click();
      }
    }
  },

  // Create a new board
  b: (e, data, setData) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();

      // Trigger the board menu button click
      const boardMenuButton = document.querySelector("[data-board-menu]");
      if (boardMenuButton instanceof HTMLElement) {
        boardMenuButton.click();

        // Then trigger the "Create New Board" button
        setTimeout(() => {
          const createBoardButton = document.querySelector(
            "[data-create-board]"
          );
          if (createBoardButton instanceof HTMLElement) {
            createBoardButton.click();
          }
        }, 100);
      }
    }
  },

  // Toggle dark mode
  d: (e, data, setData) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();

      // Trigger the dark mode toggle button click
      const darkModeButton = document.querySelector("[data-dark-mode-toggle]");
      if (darkModeButton instanceof HTMLElement) {
        darkModeButton.click();
      }
    }
  },

  // Switch to the next board
  ArrowRight: (e, data, setData) => {
    if (e.altKey) {
      e.preventDefault();

      const currentIndex = data.boards.findIndex(
        (board) => board.id === data.activeBoard
      );
      if (currentIndex === -1 || data.boards.length <= 1) return;

      const nextIndex = (currentIndex + 1) % data.boards.length;
      setData({
        ...data,
        activeBoard: data.boards[nextIndex].id,
      });
    }
  },

  // Switch to the previous board
  ArrowLeft: (e, data, setData) => {
    if (e.altKey) {
      e.preventDefault();

      const currentIndex = data.boards.findIndex(
        (board) => board.id === data.activeBoard
      );
      if (currentIndex === -1 || data.boards.length <= 1) return;

      const prevIndex =
        (currentIndex - 1 + data.boards.length) % data.boards.length;
      setData({
        ...data,
        activeBoard: data.boards[prevIndex].id,
      });
    }
  },

  // Save current state (export to JSON)
  s: (e, data, setData) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();

      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
        dataStr
      )}`;

      const exportFileDefaultName = `kanban-export-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
    }
  },
};

// Initialize keyboard shortcuts
export const initKeyboardShortcuts = (
  data: KanbanData,
  setData: React.Dispatch<React.SetStateAction<KanbanData | null>>
) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    const handler = shortcuts[e.key];
    if (handler) {
      handler(e, data, setData);
    }
  };

  document.addEventListener("keydown", handleKeyDown);

  // Return cleanup function
  return () => {
    document.removeEventListener("keydown", handleKeyDown);
  };
};

// Help text for keyboard shortcuts
export const keyboardShortcutsHelp = [
  { key: "Ctrl/Cmd + N", description: "Create a new card in the first column" },
  { key: "Ctrl/Cmd + M", description: "Create a new column" },
  { key: "Ctrl/Cmd + B", description: "Create a new board" },
  { key: "Ctrl/Cmd + D", description: "Toggle dark mode" },
  { key: "Alt + ←", description: "Switch to previous board" },
  { key: "Alt + →", description: "Switch to next board" },
  { key: "Ctrl/Cmd + S", description: "Export board data to JSON file" },
];
