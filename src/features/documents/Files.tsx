import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { motion } from "framer-motion";

interface FileType {
  _id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  updated_at: number;
  folder_id?: string;
}

export function Files() {
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileType | null>(null);
  
  const files = useQuery(api.files.list, { folderId: undefined }) || [];
  const deleteFile = useMutation(api.files.deleteFile);
  
  const handleViewFile = (file: FileType) => {
    setSelectedFile(file);
    setIsViewModalOpen(true);
  };
  
  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedFile(null);
  };
  
  const handleDeleteClick = (e: React.MouseEvent, file: FileType) => {
    e.stopPropagation();
    setFileToDelete(file);
    setIsDeleteConfirmOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (fileToDelete) {
      try {
        await deleteFile({ id: fileToDelete._id });
        setIsDeleteConfirmOpen(false);
        setFileToDelete(null);
      } catch (error) {
        console.error("Failed to delete file:", error);
      }
    }
  };
  
  const handleCancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setFileToDelete(null);
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };
  
  const isImageFile = (fileType: string) => {
    return fileType.startsWith('image/');
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-display font-semibold text-gray-900 dark:text-dark-text tracking-tight">All Files</h2>
      
      {files.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {files.map((file: FileType) => (
            <motion.div 
              key={file._id}
              whileHover={{ y: -4 }}
              onClick={() => handleViewFile(file)}
              className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border p-5 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-none transition-all duration-300 group cursor-pointer relative"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl transition-colors duration-300 ${isImageFile(file.file_type) ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                  {isImageFile(file.file_type) ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                </div>
                <button 
                  onClick={(e) => handleDeleteClick(e, file)}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
                <div className="min-w-0">
                  <h3 className="font-display font-semibold text-gray-900 dark:text-dark-text text-lg truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {file.file_name}
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-body">
                    Uploaded {formatDate(file.updated_at)}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-dark-border/50">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
                    {file.file_type.split('/')[1]?.toUpperCase() || 'FILE'}
                  </span>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {formatFileSize(file.file_size)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-dashed border-gray-300 dark:border-dark-border p-12 text-center">
            <div className="bg-gray-50 dark:bg-gray-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1.01.707.293l5.414 5.414a1 1.01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-display font-bold text-gray-900 dark:text-dark-text mb-2">No files yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-0 max-w-xs mx-auto">Upload documents to manage them efficiently in one place.</p>
          </div>
        )}
        
        {/* File View Modal */}
        <Modal 
          isOpen={isViewModalOpen} 
          onClose={handleCloseViewModal} 
          title={selectedFile?.file_name || "File Preview"}
        >
          {selectedFile && (
            <div className="space-y-4">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <span className="mr-4">Type: {selectedFile.file_type}</span>
                <span>Size: {formatFileSize(selectedFile.file_size)}</span>
              </div>
              
              <div className="border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center min-h-[300px]">
                {isImageFile(selectedFile.file_type) ? (
                  <img 
                    src={selectedFile.file_url} 
                    alt={selectedFile.file_name}
                    className="max-h-[70vh] max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center p-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1.01.707.293l5.414 5.414a1 1.01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">Preview not available for this file type</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">This file is not an image and cannot be previewed</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  variant="secondary" 
                  onClick={handleCloseViewModal}
                >
                  Close
                </Button>
                <a 
                  href={selectedFile.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-primary text-white hover:bg-primary-hover focus:ring-emerald-500"
                >
                  Download
                </a>
              </div>
            </div>
          )}
        </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteConfirmOpen} 
        onClose={handleCancelDelete} 
        title="Delete File"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete the file <strong>{fileToDelete?.file_name}</strong>? This action cannot be undone.</p>
          
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