import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";

interface FolderType {
  _id: string;
  folder_name: string;
  file_count: number;
  total_size: number;
  updated_at: number;
}

export function Folder() {
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [error, setError] = useState("");
  
  // Fetch folders from Convex
  const folders = useQuery(api.folders.list) || [];
  
  // Mutation for creating a folder
  const createFolder = useMutation(api.folders.create);
  
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setError("Folder name is required");
      return;
    }
    
    try {
      await createFolder({ folder_name: newFolderName.trim() });
      setNewFolderName("");
      setError("");
      setIsCreateFolderOpen(false);
    } catch (err: any) {
      setError(err.message || "Failed to create folder");
    }
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text">Folder Management</h2>
        <Button 
          variant="primary" 
          onClick={() => setIsCreateFolderOpen(true)}
        >
          Create Folder
        </Button>
      </div>
      
      {/* Folder List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {folders.length > 0 ? (
          folders.map((folder: FolderType) => (
            <div 
              key={folder._id} 
              className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center mb-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-dark-text truncate">{folder.folder_name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(folder.updated_at)}</p>
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{folder.file_count} files</span>
                <span>{Math.round(folder.total_size / 1024)} KB</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-1">No folders yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first folder to organize your documents</p>
            <Button 
              variant="primary" 
              onClick={() => setIsCreateFolderOpen(true)}
            >
              Create Folder
            </Button>
          </div>
        )}
      </div>
      
      {/* Create Folder Modal */}
      <Modal 
        isOpen={isCreateFolderOpen} 
        onClose={() => {
          setIsCreateFolderOpen(false);
          setNewFolderName("");
          setError("");
        }} 
        title="Create New Folder"
      >
        <div className="space-y-4">
          <Input
            label="Folder Name"
            value={newFolderName}
            onChange={(e) => {
              setNewFolderName(e.target.value);
              if (error) setError("");
            }}
            error={error}
            placeholder="Enter folder name"
            autoFocus
          />
          
          <div className="flex justify-end gap-2 pt-2">
            <Button 
              variant="secondary" 
              onClick={() => {
                setIsCreateFolderOpen(false);
                setNewFolderName("");
                setError("");
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleCreateFolder}
            >
              Create Folder
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}