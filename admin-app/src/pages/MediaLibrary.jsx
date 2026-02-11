import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import { Upload, Trash2, Search, Folder, Image as ImageIcon, Film, File, X, CheckSquare, Square } from 'lucide-react';

const MediaLibrary = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFolder, setSelectedFolder] = useState('all');
    const [uploading, setUploading] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const queryClient = useQueryClient();

    // Fetch media files
    const { data: mediaFiles = [], isLoading, isError, error } = useQuery({
        queryKey: ['media', selectedFolder],
        queryFn: async () => {
            let query = supabase.from('media').select('*').order('uploaded_at', { ascending: false });

            if (selectedFolder !== 'all') {
                query = query.eq('folder', selectedFolder);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        }
    });

    React.useEffect(() => {
        if (isError && error) {
            toast.error(`Failed to load media: ${error.message}`);
        }
    }, [isError, error]);

    // Get unique folders
    const folders = ['all', ...new Set(mediaFiles.map(m => m.folder).filter(Boolean))];

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('media').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['media']);
            toast.success('Media deleted successfully!');
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        }
    });

    // Bulk Delete Mutation
    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids) => {
            const { error } = await supabase.from('media').delete().in('id', ids);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['media']);
            toast.success(`${selectedIds.length} files deleted successfully!`);
            setSelectedIds([]);
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        }
    });

    // Upload handler
    const uploadFiles = async (files) => {
        if (files.length === 0) return;

        setUploading(true);
        // Default to current folder if specific one selected, else 'general'
        const folder = selectedFolder !== 'all' ? selectedFolder : (prompt('Enter folder name (optional):') || 'general');

        try {
            for (const file of files) {
                // Upload to Supabase Storage
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `${folder}/${fileName}`;

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('media')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('media')
                    .getPublicUrl(filePath);

                // Save to database
                const { error: dbError } = await supabase.from('media').insert([{
                    filename: file.name,
                    url: publicUrl,
                    type: file.type,
                    size_bytes: file.size,
                    folder: folder,
                    alt_text: file.name.replace(/\.[^/.]+$/, '')
                }]);

                if (dbError) throw dbError;
            }

            queryClient.invalidateQueries(['media']);
            toast.success(`${files.length} file(s) uploaded successfully!`);
        } catch (error) {
            toast.error(`Upload failed: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleUpload = (e) => {
        const files = Array.from(e.target.files);
        uploadFiles(files);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: uploadFiles,
        noClick: true, // we trigger click manually on the button
        noKeyboard: true
    });

    const toggleSelection = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = () => {
        if (window.confirm(`Are you sure you want to delete ${selectedIds.length} files?`)) {
            bulkDeleteMutation.mutate(selectedIds);
        }
    };

    const filteredMedia = mediaFiles.filter(media =>
        media.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        media.alt_text?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getFileIcon = (type) => {
        if (type?.startsWith('image/')) return <ImageIcon size={40} className="text-blue-500" />;
        if (type?.startsWith('video/')) return <Film size={40} className="text-purple-500" />;
        return <File size={40} className="text-gray-500" />;
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-64">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Media Library</h1>
                    <p className="text-gray-600 mt-1">Manage images, videos, and files</p>
                </div>
                <div className="flex gap-2">
                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="flex items-center gap-2 bg-red-100 text-red-600 px-6 py-3 rounded-xl hover:bg-red-200 transition-colors font-bold"
                        >
                            <Trash2 size={20} />
                            Delete ({selectedIds.length})
                        </button>
                    )}
                    <label className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors font-bold cursor-pointer shadow-lg hover:shadow-primary/30">
                        <Upload size={20} />
                        {uploading ? 'Uploading...' : 'Upload Files'}
                        <input
                            type="file"
                            multiple
                            onChange={handleUpload}
                            className="hidden"
                            disabled={uploading}
                        />
                    </label>
                </div>
            </div>

            {/* Drag & Drop Zone */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${isDragActive ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-gray-300 hover:border-primary/50'
                    }`}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2 text-gray-500">
                    <div className={`p-4 rounded-full ${isDragActive ? 'bg-primary/10 text-primary' : 'bg-gray-100'}`}>
                        <Upload size={32} />
                    </div>
                    <p className="text-lg font-bold text-gray-700">
                        {isDragActive ? 'Drop files here to upload' : 'Drag & drop files here, or click the upload button'}
                    </p>
                    <p className="text-sm">Supports images, videos, and documents</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search files..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                    <div className="relative">
                        <Folder className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <select
                            value={selectedFolder}
                            onChange={(e) => setSelectedFolder(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
                        >
                            {folders.map(folder => (
                                <option key={folder} value={folder}>
                                    {folder === 'all' ? 'All Folders' : folder}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Media Grid */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-gray-700">
                        {filteredMedia.length} Files
                    </h2>
                    {selectedIds.length > 0 && (
                        <button
                            onClick={() => setSelectedIds([])}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            Deselect All
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredMedia.map((media) => {
                        const isSelected = selectedIds.includes(media.id);
                        return (
                            <div
                                key={media.id}
                                className={`group relative border rounded-xl overflow-hidden hover:shadow-lg transition-all ${isSelected ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-gray-200'
                                    }`}
                                onClick={() => toggleSelection(media.id)}
                            >
                                {/* Selection Checkbox */}
                                <div className="absolute top-2 left-2 z-10">
                                    <div className={`p-1 rounded-md transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-white/80 text-gray-400 hover:text-gray-600'}`}>
                                        {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                                    </div>
                                </div>

                                {/* Preview */}
                                <div className="aspect-square bg-gray-50 flex items-center justify-center relative">
                                    {media.type?.startsWith('image/') ? (
                                        <img src={media.url} alt={media.alt_text} className="w-full h-full object-cover" />
                                    ) : (
                                        getFileIcon(media.type)
                                    )}
                                    {/* Overlay on hover */}
                                    <div className={`absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center ${isSelected ? 'opacity-100 bg-primary/10' : ''}`} />
                                </div>

                                {/* Info */}
                                <div className="p-3 bg-white">
                                    <p className="text-sm font-bold text-gray-900 truncate" title={media.filename}>
                                        {media.filename}
                                    </p>
                                    <div className="flex justify-between items-center mt-1">
                                        <p className="text-xs text-gray-500">
                                            {formatFileSize(media.size_bytes)}
                                        </p>
                                        {media.folder && (
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                                {media.folder}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="absolute bottom-16 right-2 flex gap-1 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigator.clipboard.writeText(media.url);
                                            toast.success('URL copied!');
                                        }}
                                        className="p-1.5 bg-white text-gray-600 rounded-lg shadow-sm hover:text-primary hover:bg-gray-50"
                                        title="Copy URL"
                                    >
                                        <File size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm('Delete this file?')) {
                                                deleteMutation.mutate(media.id);
                                            }
                                        }}
                                        className="p-1.5 bg-white text-gray-600 rounded-lg shadow-sm hover:text-red-600 hover:bg-gray-50"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredMedia.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <p className="text-lg font-medium">No media files found</p>
                        <p className="text-sm mt-1">Upload files to get started</p>
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-3xl font-black text-primary">{mediaFiles.length}</p>
                        <p className="text-sm text-gray-600 mt-1">Total Files</p>
                    </div>
                    <div>
                        <p className="text-3xl font-black text-primary">{folders.length - 1}</p>
                        <p className="text-sm text-gray-600 mt-1">Folders</p>
                    </div>
                    <div>
                        <p className="text-3xl font-black text-primary">
                            {formatFileSize(mediaFiles.reduce((sum, m) => sum + (m.size_bytes || 0), 0))}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Total Size</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MediaLibrary;
