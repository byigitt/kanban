# Kanban Board

A flexible Kanban board application built with React, TypeScript, and TailwindCSS.

## Features

- **Customizable Boards**: Create multiple boards for different projects
- **Flexible Columns**: Add, edit, and reorder columns to match your workflow
- **Drag-and-Drop**: Easily move cards between columns with smooth animations
- **Rich Card Details**: Add descriptions, due dates, labels, and priority levels
- **User Assignment**: Assign cards to team members with avatar display
- **Comments & Activity**: Track discussions and changes on each card
- **Dark Mode**: Toggle between light and dark themes
- **Keyboard Shortcuts**: Boost productivity with keyboard shortcuts
- **Data Persistence**: All data is saved to localStorage automatically
- **Import/Export**: Backup and share your boards with JSON export/import
- **Responsive Design**: Works on desktop and mobile devices

## Keyboard Shortcuts

- `Ctrl/Cmd + N`: Create a new card in the first column
- `Ctrl/Cmd + M`: Create a new column
- `Ctrl/Cmd + B`: Create a new board
- `Ctrl/Cmd + D`: Toggle dark mode
- `Alt + ←`: Switch to previous board
- `Alt + →`: Switch to next board
- `Ctrl/Cmd + S`: Export board data to JSON file

## Technologies Used

- React with TypeScript
- TailwindCSS for styling
- @hello-pangea/dnd for drag-and-drop functionality
- date-fns for date formatting
- react-icons for icons
- localStorage for data persistence

## Getting Started

1. Clone the repository
2. Install dependencies with `pnpm install`
3. Start the development server with `pnpm run dev`
4. Open your browser to the URL shown in the terminal

## Building for Production

Run `pnpm run build` to create a production build of the application.

## License

MIT
