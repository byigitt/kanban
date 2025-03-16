import { useState } from 'react';
import { KanbanData } from '../types';
import { FiUpload, FiDownload } from 'react-icons/fi';

interface ImportExportProps {
  data: KanbanData;
  setData: React.Dispatch<React.SetStateAction<KanbanData | null>>;
  onClose: () => void;
}

const ImportExport = ({ data, setData, onClose }: ImportExportProps) => {
  const [importError, setImportError] = useState<string | null>(null);

  // Export data to JSON file
  const handleExport = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `kanban-export-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Import data from JSON file
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        
        // Validate imported data
        if (!importedData.boards || !Array.isArray(importedData.boards) || !importedData.activeBoard) {
          setImportError('Invalid data format. The file must contain valid Kanban board data.');
          return;
        }
        
        setData(importedData);
        onClose();
      } catch (error) {
        setImportError('Failed to parse the imported file. Please make sure it is a valid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold">Import/Export Data</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Export Data</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Export your Kanban board data to a JSON file that you can save as a backup or share with others.
            </p>
            <button
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={handleExport}
            >
              <FiDownload className="mr-2" />
              Export to JSON
            </button>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium mb-2">Import Data</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Import Kanban board data from a previously exported JSON file. This will replace your current data.
            </p>
            
            {importError && (
              <div className="mb-4 p-3 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-md">
                {importError}
              </div>
            )}
            
            <label className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer">
              <FiUpload className="mr-2" />
              Import from JSON
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
              />
            </label>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Warning: Importing data will replace your current boards and cards.
            </p>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportExport; 