import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Search, Image as ImageIcon, Film, Check, Loader2 } from 'lucide-react';

const MediaPicker = ({ isOpen, onClose, onSelect, type = 'all' }) => {
 const [searchTerm, setSearchTerm] = useState('');
 const [activeTab, setActiveTab] = useState('gallery');
 const [uploading, setUploading] = useState(false);
 const queryClient = useQueryClient();

 const { data: mediaFiles = [], isLoading } = useQuery({
 queryKey: ['media'],
 queryFn: async () => {
 const { data, error } = await supabase
 .from('media')
 .select('*')
 .order('uploaded_at', { ascending: false });
 if (error) throw error;
 return data;
 },
 enabled: isOpen && activeTab === 'gallery'
 });

 const uploadFiles = async (files) => {
 if (files.length === 0) return;
 setUploading(true);
 try {
 for (const file of files) {
 const fileExt = file.name.split('.').pop();
 const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
 const folder = 'uploads';
 const filePath = `${folder}/${fileName}`;

 const { error: uploadError } = await supabase.storage
 .from('media')
 .upload(filePath, file);

 if (uploadError) throw uploadError;

 const { data: { publicUrl } } = supabase.storage
 .from('media')
 .getPublicUrl(filePath);

 const { error: dbError } = await supabase.from('media').insert([{
 filename: file.filename || file.name,
 url: publicUrl,
 type: file.type,
 size_bytes: file.size,
 folder: folder,
 alt_text: file.name.replace(/\.[^/.]+$/, '')
 }]);

 if (dbError) throw dbError;

 // Automatically select the uploaded file and close
 onSelect(publicUrl);
 toast.success('File uploaded and selected!');
 onClose();
 }
 queryClient.invalidateQueries(['media']);
 } catch (error) {
 toast.error(`Upload failed: ${error.message}`);
 } finally {
 setUploading(false);
 }
 };

 const { getRootProps, getInputProps, isDragActive } = useDropzone({
 onDrop: uploadFiles,
 multiple: false,
 accept: type === 'image' ? { 'image/*': [] } : type === 'video' ? { 'video/*': [] } : { 'image/*': [], 'video/*': [] }
 });

 const filteredMedia = mediaFiles.filter(media => {
 const matchesSearch = media.filename.toLowerCase().includes(searchTerm.toLowerCase());
 const matchesType = type === 'all' ||
 (type === 'image' && media.type?.startsWith('image/')) ||
 (type === 'video' && media.type?.startsWith('video/'));
 return matchesSearch && matchesType;
 });

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
 <div className="bg-white w-full max-w-5xl h-[85vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-gray-100">
 {/* Header */}
 <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
 <div>
 <h2 className="text-3xl font-black text-gray-900 tracking-tight">Select Media</h2>
 <p className="text-gray-500 font-medium">Choose an asset from your library or upload a new one.</p>
 </div>
 <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-gray-900 border border-transparent hover:border-gray-200">
 <X size={24} />
 </button>
 </div>

 {/* Tabs & Search */}
 <div className="px-8 py-6 flex flex-col md:flex-row gap-6 items-center justify-between border-b border-gray-50">
 <div className="flex p-1.5 bg-gray-100 rounded-2xl w-full md:w-auto">
 <button
 onClick={() => setActiveTab('gallery')}
 className={`flex-1 md:flex-none px-8 py-3 rounded-xl transition-all font-black uppercase text-[11px] tracking-wider ${activeTab === 'gallery' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900'}`}
 >
 Gallery
 </button>
 <button
 onClick={() => setActiveTab('upload')}
 className={`flex-1 md:flex-none px-8 py-3 rounded-xl transition-all font-black uppercase text-[11px] tracking-wider ${activeTab === 'upload' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900'}`}
 >
 Upload New
 </button>
 </div>

 {activeTab === 'gallery' && (
 <div className="relative w-full md:w-96 group">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
 <input
 type="text"
 placeholder="Search your assets..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-primary focus:bg-white outline-none transition-all font-bold"
 />
 </div>
 )}
 </div>

 {/* Content */}
 <div className="flex-1 overflow-y-auto p-8">
 {activeTab === 'gallery' ? (
 isLoading ? (
 <div className="h-full flex flex-col items-center justify-center space-y-4">
 <Loader2 size={48} className="text-primary animate-spin" />
 <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Accessing Library...</p>
 </div>
 ) : filteredMedia.length === 0 ? (
 <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
 <div className="p-8 bg-gray-50 rounded-full text-gray-200">
 <ImageIcon size={64} />
 </div>
 <div className="space-y-2">
 <h3 className="text-xl font-black text-gray-900">No media found</h3>
 <p className="text-gray-500 max-w-xs mx-auto">We couldn't find any assets matching your criteria. Try a different search or upload something new.</p>
 </div>
 <button onClick={() => setActiveTab('upload')} className="bg-primary/10 text-primary px-8 py-3 rounded-xl font-black uppercase text-xs hover:bg-primary hover:text-white transition-all">
 Upload First Asset
 </button>
 </div>
 ) : (
 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
 {filteredMedia.map((media) => (
 <div
 key={media.id}
 onClick={() => {
 onSelect(media.url);
 onClose();
 }}
 className="group relative cursor-pointer"
 >
 <div className="aspect-square bg-gray-100 rounded-[32px] overflow-hidden border-2 border-gray-100 group-hover:border-primary transition-all shadow-sm hover:shadow-xl hover:shadow-primary/10">
 {media.type?.startsWith('image/') ? (
 <img src={media.url} alt={media.alt_text} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
 ) : (
 <div className="w-full h-full flex items-center justify-center bg-gray-50">
 <Film size={40} className="text-gray-300 group-hover:text-primary transition-colors" />
 </div>
 )}
 <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
 <div className="bg-white p-3 rounded-full shadow-lg text-primary transform scale-75 group-hover:scale-100 transition-transform">
 <Check size={24} />
 </div>
 </div>
 </div>
 <p className="mt-3 text-xs font-bold text-gray-600 truncate px-2 text-center group-hover:text-primary transition-colors">
 {media.filename}
 </p>
 </div>
 ))}
 </div>
 )
 ) : (
 <div
 {...getRootProps()}
 className={`h-full border-4 border-dashed rounded-[48px] flex flex-col items-center justify-center transition-all p-12 text-center ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'
 }`}
 >
 <input {...getInputProps()} />
 <div className={`p-8 rounded-[40px] mb-8 transition-all ${isDragActive ? 'bg-primary text-white scale-110' : 'bg-gray-50 text-gray-300'}`}>
 {uploading ? <Loader2 size={64} className="animate-spin" /> : <Upload size={64} />}
 </div>
 {uploading ? (
 <div className="space-y-3">
 <h3 className="text-2xl font-black text-gray-900">Uploading to Cloud...</h3>
 <p className="text-gray-500 font-medium tracking-tight">Your asset is being optimized and saved to the library.</p>
 </div>
 ) : (
 <div className="space-y-4">
 <h3 className="text-3xl font-black text-gray-900 tracking-tight">
 {isDragActive ? 'Drop to start upload' : 'Click or drag files here'}
 </h3>
 <p className="text-gray-500 max-w-sm mx-auto font-medium text-lg">
 Support for PNG, JPG, WEBP and MP4 files up to 50MB.
 </p>
 <button className="mt-6 bg-gray-900 text-white px-10 py-5 rounded-2xl font-black uppercase text-sm shadow-xl hover:shadow-gray-200 transition-all hover:-translate-y-1 active:translate-y-0">
 Browse Files
 </button>
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 </div>
 );
};

export default MediaPicker;
