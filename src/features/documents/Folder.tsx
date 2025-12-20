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
  const [isEditFolderOpen, setIsEditFolderOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<FolderType | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [editFolderName, setEditFolderName] = useState("");
  const [error, setError] = useState("");
  
  // Fetch folders from Convex
  const folders = useQuery(api.folders.list) || [];
  
  // Mutations
  const createFolder = useMutation(api.folders.create);
  const updateFolder = useMutation(api.folders.update);
  const deleteFolder = useMutation(api.folders.deleteFolder);
  
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
  
  const handleEditClick = (folder: FolderType) => {
    setSelectedFolder(folder);
    setEditFolderName(folder.folder_name);
    setIsEditFolderOpen(true);
  };
  
  const handleUpdateFolder = async () => {
    if (!selectedFolder || !editFolderName.trim()) {
      setError("Folder name is required");
      return;
    }
    
    try {
      await updateFolder({ 
        id: selectedFolder._id, 
        folder_name: editFolderName.trim() 
      });
      setEditFolderName("");
      setError("");
      setIsEditFolderOpen(false);
      setSelectedFolder(null);
    } catch (err: any) {
      setError(err.message || "Failed to update folder");
    }
  };
  
  const handleDeleteClick = (folder: FolderType) => {
    setSelectedFolder(folder);
    setIsDeleteConfirmOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (selectedFolder) {
      try {
        await deleteFolder({ id: selectedFolder._id });
        setIsDeleteConfirmOpen(false);
        setSelectedFolder(null);
      } catch (err: any) {
        setError(err.message || "Failed to delete folder");
        // Show error for a few seconds
        setTimeout(() => setError(""), 5000);
      }
    }
  };
  
  const handleCancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setSelectedFolder(null);
  };
  
  const handleCancelEdit = () => {
    setIsEditFolderOpen(false);
    setSelectedFolder(null);
    setEditFolderName("");
    setError("");
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };
  
    return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-dark-text">Folders</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-sans">Organize your files into virtual directories</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setIsCreateFolderOpen(true)}
          className="rounded-xl px-5 font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create Folder
        </Button>
      </div>
      
      {/* Folder List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {folders.length > 0 ? (
          folders.map((folder: FolderType) => (
            <div 
              key={folder._id} 
              className="group bg-white dark:bg-dark-card/40 rounded-2xl border border-gray-200 dark:border-dark-border p-5 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-start justify-between mb-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl mr-3 group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleEditClick(folder)}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                    aria-label="Edit folder"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(folder)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                    aria-label="Delete folder"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="space-y-1 mb-5">
                <h3 className="font-display font-bold text-gray-900 dark:text-dark-text truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{folder.folder_name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-sans flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  Last updated {formatDate(folder.updated_at)}
                </p>
              </div>
              
              <div className="flex items-center justify-between text-xs font-medium bg-gray-50 dark:bg-dark-bg/50 p-3 rounded-xl border border-gray-100 dark:border-dark-border/50">
                <div className="flex flex-col">
                  <span className="text-gray-400 dark:text-gray-500 uppercase tracking-tighter text-[10px]">Files</span>
                  <span className="text-gray-900 dark:text-dark-text">{folder.file_count}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-gray-400 dark:text-gray-500 uppercase tracking-tighter text-[10px]">Total Size</span>
                  <span className="text-gray-900 dark:text-dark-text">{Math.round(folder.total_size / 1024)} KB</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white dark:bg-dark-card rounded-3xl border-2 border-dashed border-gray-200 dark:border-dark-border p-12 text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-gray-50 dark:bg-dark-bg rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-display font-bold text-gray-900 dark:text-dark-text mb-2">No folders yet</h3>
            <p className="text-gray-500 dark:text-gray-400 font-sans mb-8">Create your first folder to organize your business documents</p>
            <Button 
              variant="primary" 
              onClick={() => setIsCreateFolderOpen(true)}
              className="rounded-xl px-8 font-bold shadow-lg shadow-blue-500/20"
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
      
      {/* Edit Folder Modal */}
      <Modal 
        isOpen={isEditFolderOpen} 
        onClose={handleCancelEdit} 
        title="Edit Folder"
      >
        <div className="space-y-4">
          <Input
            label="Folder Name"
            value={editFolderName}
            onChange={(e) => {
              setEditFolderName(e.target.value);
              if (error) setError("");
            }}
            error={error}
            placeholder="Enter folder name"
            autoFocus
          />
          
          <div className="flex justify-end gap-2 pt-2">
            <Button 
              variant="secondary" 
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleUpdateFolder}
            >
              Update Folder
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteConfirmOpen} 
        onClose={handleCancelDelete} 
        title="Delete Folder"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete the folder <strong>{selectedFolder?.folder_name}</strong>? This action cannot be undone.</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Note: You can only delete empty folders. Please move or delete all files first.</p>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button 
              variant="secondary" 
              onClick={handleCancelDelete}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}