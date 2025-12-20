import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "../../components/ui/Button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface FolderType {
  _id: string;
  folder_name: string;
  file_count: number;
  total_size: number;
  updated_at: number;
}

export function Upload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const folders = useQuery(api.folders.list) || [];
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const createFile = useMutation(api.files.create);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError("");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError("");
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file to upload");
      return;
    }
    
    if (!selectedFolderId) {
      setError("Please select a folder for the file");
      return;
    }
    
    setIsUploading(true);
    setError("");
    
    try {
      const postUrl = await generateUploadUrl();
      const uploadResponse = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });
      
      if (!uploadResponse.ok) throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      
      const { storageId } = await uploadResponse.json();
      await createFile({
        storageId,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        folderId: selectedFolderId || undefined,
      });
      
      toast.success(`Successfully uploaded ${selectedFile.name}`);
      setSelectedFile(null);
      setSelectedFolderId("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      setError(err.message || "Failed to upload file");
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-dark-text tracking-tight">Upload Documents</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1 font-body">Add new files to your secure cloud storage.</p>
      </div>
      
      <div className="bg-white dark:bg-dark-card rounded-3xl border border-gray-200 dark:border-dark-border p-8 shadow-sm">
        <div className="space-y-8">
          {/* Custom Drop Zone */}
          <motion.div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            animate={{ 
              borderColor: isDragging ? "rgb(37, 99, 235)" : "rgb(229, 231, 235)",
              backgroundColor: isDragging ? "rgba(37, 99, 235, 0.05)" : "transparent"
            }}
            className="relative cursor-pointer group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            
            <div className={`
              border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
              ${selectedFile ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200 hover:border-blue-400'}
            `}>
              <div className="bg-blue-50 dark:bg-blue-900/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              
              <AnimatePresence mode="wait">
                {selectedFile ? (
                  <motion.div
                    key="selected"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <h3 className="text-lg font-display font-bold text-gray-900 dark:text-dark-text mb-1">{selectedFile.name}</h3>
                    <p className="text-sm text-blue-600 font-medium">{formatFileSize(selectedFile.size)}</p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="mt-4 text-xs font-semibold text-red-500 hover:text-red-600 uppercase tracking-wider"
                    >
                      Remove File
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <h3 className="text-lg font-display font-bold text-gray-900 dark:text-dark-text mb-1">Click or drag file to upload</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-body">Support for PDF, Images, and Documents up to 50MB</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-dark-text mb-2 ml-1">
                Destination Folder
              </label>
              <select
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none"
                disabled={isUploading}
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.25rem' }}
              >
                <option value="">Select a folder...</option>
                {folders.map((folder: FolderType) => (
                  <option key={folder._id} value={folder._id}>
                    {folder.folder_name} ({folder.file_count} files)
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl"
            >
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-red-800 dark:text-red-200">{error}</span>
            </motion.div>
          )}
          
          <Button 
            variant="primary" 
            onClick={handleUpload}
            disabled={isUploading || !selectedFile || !selectedFolderId}
            className="w-full h-14 rounded-xl text-lg font-bold shadow-xl shadow-blue-500/20 disabled:shadow-none transition-all active:scale-[0.98]"
          >
            {isUploading ? (
              <span className="flex items-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Uploading File...
              </span>
            ) : "Upload to Cloud"}
          </Button>
        </div>
      </div>
    </div>
  );
}
