import React, { useState, useEffect } from 'react';
import { BlogPost } from '../types';
import { supabase } from '../lib/supabase';
import { Loader2, Plus, Edit, Trash2, X, Upload, AlertCircle } from 'lucide-react';

export default function BlogManager() {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBlog, setCurrentBlog] = useState<Partial<BlogPost>>({});
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('blogs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBlogs(data || []);
        } catch (error) {
            console.error('Error fetching blogs:', error);
            alert('Failed to load blogs');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setCurrentBlog(prev => ({
                ...prev,
                image_url: URL.createObjectURL(file)
            }));
        }
    };

    const uploadImage = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `blog-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('car-images')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('car-images')
            .getPublicUrl(filePath);

        return data.publicUrl;
    };

    const saveBlog = async () => {
        if (!currentBlog.title || !currentBlog.content || !currentBlog.author) {
            alert('Please fill in all required fields (Title, Content, Author)');
            return;
        }

        setSaving(true);
        try {
            let imageUrl = currentBlog.image_url;

            if (imageFile) {
                imageUrl = await uploadImage(imageFile);
            }

            const blogData = {
                title: currentBlog.title,
                content: currentBlog.content,
                author: currentBlog.author,
                image_url: imageUrl,
            };

            if (currentBlog.id) {
                // Update
                const { error } = await supabase
                    .from('blogs')
                    .update(blogData)
                    .eq('id', currentBlog.id);
                if (error) throw error;
            } else {
                // Insert
                const { error } = await supabase
                    .from('blogs')
                    .insert([blogData]);
                if (error) throw error;
            }

            setIsModalOpen(false);
            setCurrentBlog({});
            setImageFile(null);
            fetchBlogs();
        } catch (error) {
            console.error('Error saving blog:', error);
            alert('Failed to save blog');
        } finally {
            setSaving(false);
        }
    };

    const deleteBlog = async (id: string) => {
        if (!confirm('Are you sure you want to delete this blog post?')) return;

        try {
            const { error } = await supabase
                .from('blogs')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            fetchBlogs();
        } catch (error) {
            console.error('Error deleting blog:', error);
            alert('Failed to delete blog');
        }
    };

    const openAddModal = () => {
        setCurrentBlog({});
        setImageFile(null);
        setIsModalOpen(true);
    };

    const openEditModal = (blog: BlogPost) => {
        setCurrentBlog(blog);
        setImageFile(null);
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={40} className="animate-spin text-orange-600" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900">Blog Posts</h2>
                <button 
                    onClick={openAddModal} 
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black transition-colors flex items-center gap-2"
                >
                    <Plus size={16} /> Add Post
                </button>
            </div>

            {blogs.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                    <AlertCircle className="mx-auto mb-3 opacity-50" size={48} />
                    <p>No blog posts found. Click "Add Post" to start.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                <th className="p-4 font-bold border-b border-slate-100">Post</th>
                                <th className="p-4 font-bold border-b border-slate-100">Author</th>
                                <th className="p-4 font-bold border-b border-slate-100">Date</th>
                                <th className="p-4 font-bold border-b border-slate-100 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {blogs.map((blog) => (
                                <tr key={blog.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 border-b border-slate-100">
                                        <div className="flex items-center gap-3">
                                            {blog.image_url ? (
                                                <img src={blog.image_url} alt={blog.title} className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                                                    <span className="text-slate-400 text-xs">No img</span>
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-bold text-slate-900">{blog.title}</div>
                                                <div className="text-xs text-slate-500 line-clamp-1 max-w-xs">{blog.content}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 border-b border-slate-100 text-slate-600">
                                        {blog.author}
                                    </td>
                                    <td className="p-4 border-b border-slate-100 text-slate-600">
                                        {new Date(blog.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 border-b border-slate-100 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => openEditModal(blog)}
                                                className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => deleteBlog(blog.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-900">
                                {currentBlog.id ? 'Edit Post' : 'Add New Post'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4 overflow-y-auto flex-1">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Cover Image</label>
                                <div className="relative group cursor-pointer border-2 border-dashed border-slate-300 rounded-xl p-4 hover:border-orange-500 transition-colors text-center bg-slate-50">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleImageChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    {currentBlog.image_url ? (
                                        <img src={currentBlog.image_url} alt="Preview" className="h-48 w-full object-cover rounded-lg" />
                                    ) : (
                                        <div className="py-8">
                                            <Upload className="mx-auto text-slate-400 mb-2" size={32} />
                                            <p className="text-sm text-slate-500">Click to upload image</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700">Title</label>
                                <input 
                                    type="text" 
                                    value={currentBlog.title || ''} 
                                    onChange={e => setCurrentBlog(prev => ({...prev, title: e.target.value}))}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-orange-500 outline-none"
                                    placeholder="Enter post title"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700">Author</label>
                                <input 
                                    type="text" 
                                    value={currentBlog.author || ''} 
                                    onChange={e => setCurrentBlog(prev => ({...prev, author: e.target.value}))}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-orange-500 outline-none"
                                    placeholder="Enter author name"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700">Content</label>
                                <textarea 
                                    value={currentBlog.content || ''} 
                                    onChange={e => setCurrentBlog(prev => ({...prev, content: e.target.value}))}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mt-1 h-48 focus:ring-2 focus:ring-orange-500 outline-none"
                                    placeholder="Write your post content here... (Markdown supported if you add a renderer later)"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={saveBlog}
                                disabled={saving}
                                className="bg-orange-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                                {saving ? 'Saving...' : 'Save Post'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
