import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FaPlus, FaTrash, FaEdit, FaSearch, FaCheck, FaTimes, FaTshirt, FaTag, FaCrown } from 'react-icons/fa';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Shirts', 'Jeans', 'T-Shirts', 'Hoodies', 'Footwear', 'Accessories', 'Trousers', 'Jackets'];

const ProductManagement = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();

  useEffect(() => {
    document.title = 'Clothing Catalog | Sri Mens Street Wear';
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form inputs
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Shirts');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [sizes, setSizes] = useState([]);
  const [sizeInput, setSizeInput] = useState('');
  const [colors, setColors] = useState([]);
  const [colorInput, setColorInput] = useState('');

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Shirts');
    setPrice('');
    setDescription('');
    setActive(true);
    setSizes(['S', 'M', 'L', 'XL']);
    setColors(['Black', 'White']);
    setSizeInput('');
    setColorInput('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setCategory(product.category || 'Shirts');
    setPrice(product.price);
    setDescription(product.description || '');
    setActive(product.active);
    setSizes(product.sizes ? [...product.sizes] : []);
    setColors(product.colors ? [...product.colors] : []);
    setSizeInput('');
    setColorInput('');
    setIsModalOpen(true);
  };

  const handleAddSize = () => {
    if (!sizeInput.trim()) return;
    if (sizes.includes(sizeInput.trim().toUpperCase())) {
      toast.error('Size already added');
      return;
    }
    setSizes([...sizes, sizeInput.trim().toUpperCase()]);
    setSizeInput('');
  };

  const handleRemoveSize = (sz) => {
    setSizes(sizes.filter(s => s !== sz));
  };

  const handleAddColor = () => {
    if (!colorInput.trim()) return;
    if (colors.includes(colorInput.trim())) {
      toast.error('Color already added');
      return;
    }
    setColors([...colors, colorInput.trim()]);
    setColorInput('');
  };

  const handleRemoveColor = (col) => {
    setColors(colors.filter(c => c !== col));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Item name is required');
      return;
    }
    if (price === '' || Number(price) < 0) {
      toast.error('Valid price is required');
      return;
    }

    const payload = {
      name: name.trim(),
      category,
      price: Number(price),
      description: description.trim(),
      active,
      sizes,
      colors
    };

    if (editingProduct) {
      const success = await updateProduct(editingProduct._id, payload);
      if (success) setIsModalOpen(false);
    } else {
      const success = await addProduct(payload);
      if (success) setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Row */}
      {/* Header with Brand Logo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-cardBg border border-borderCol rounded-3xl p-4 sm:p-5 shadow-sm gap-4">
        <div className="flex items-center space-x-3.5">
          <img
            src="/logo.png"
            alt="Sri Mens Street Wear Logo"
            className="h-12 sm:h-14 w-auto max-w-[140px] sm:max-w-[170px] object-contain rounded-2xl border border-amber-500/30 shadow-md bg-darknavy p-1"
          />
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-primaryTxt flex items-center gap-2 font-['Montserrat',sans-serif]">
              <FaTshirt className="text-amber-500" />
              <span>Clothing Catalog & Price Guide</span>
            </h2>
            <p className="text-xs text-secondaryTxt">
              Manage reference garments, standard retail prices, sizes, and color variants.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="flex items-center space-x-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-darknavy font-black text-xs rounded-2xl shadow-md shadow-amber-500/20 transition-all self-start sm:self-auto"
        >
          <FaPlus className="text-xs" />
          <span>ADD CLOTHING ITEM</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-cardBg border border-borderCol rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-mutedTxt">
              <FaSearch className="text-xs" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search garments by name or description..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-borderCol focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-primaryTxt font-medium"
            />
          </div>

          <span className="text-xs font-bold text-secondaryTxt">
            Showing {filteredProducts.length} items
          </span>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-borderCol/60">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                categoryFilter === cat
                  ? 'bg-amber-500 text-darknavy shadow-md shadow-amber-500/20 font-black'
                  : 'text-secondaryTxt bg-slate-50 hover:bg-slate-100 border border-borderCol'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((p) => (
            <div
              key={p._id}
              className={`bg-cardBg border rounded-3xl p-5 shadow-sm flex flex-col justify-between transition-all hover:border-amber-300 ${
                !p.active ? 'opacity-60 bg-slate-50' : ''
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800">
                    {p.category}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(p)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg"
                      title="Edit Item"
                    >
                      <FaEdit className="text-xs" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete ${p.name}?`)) deleteProduct(p._id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                      title="Delete Item"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-extrabold text-primaryTxt leading-snug">
                  {p.name}
                </h3>
                {p.description && (
                  <p className="text-xs text-secondaryTxt line-clamp-2">
                    {p.description}
                  </p>
                )}

                {/* Sizes and Colors Badges */}
                <div className="space-y-1.5 pt-2">
                  {p.sizes && p.sizes.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="text-[9px] uppercase font-bold text-mutedTxt">Sizes:</span>
                      {p.sizes.map((sz, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 text-[9px] font-bold text-slate-700">
                          {sz}
                        </span>
                      ))}
                    </div>
                  )}
                  {p.colors && p.colors.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="text-[9px] uppercase font-bold text-mutedTxt">Colors:</span>
                      {p.colors.map((c, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 text-[9px] font-medium text-slate-700">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Price Row */}
              <div className="flex justify-between items-center pt-4 border-t border-borderCol/60 mt-3">
                <span className="text-base font-black text-amber-700">
                  ₹{p.price.toLocaleString('en-IN')}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.active ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-200'}`}>
                  {p.active ? 'In Stock' : 'Inactive'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-secondaryTxt text-sm bg-cardBg rounded-3xl border border-borderCol">
            No clothing items found matching your filters.
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-darknavy/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-cardBg border border-borderCol rounded-3xl p-6 w-full max-w-lg shadow-2xl relative text-primaryTxt max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-secondaryTxt hover:text-primaryTxt p-1"
            >
              <FaTimes />
            </button>

            <h4 className="text-base font-extrabold text-primaryTxt border-b border-borderCol pb-3 mb-4 flex items-center gap-2">
              <FaTshirt className="text-amber-500" />
              <span>{editingProduct ? 'Edit Clothing Item' : 'Add New Clothing Item'}</span>
            </h4>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Item Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-secondaryTxt uppercase">Cloth Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Slim Fit Denim Jeans"
                  className="w-full bg-white border border-borderCol rounded-xl text-xs py-2 px-3 text-primaryTxt font-semibold focus:border-amber-500"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-secondaryTxt uppercase">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-borderCol rounded-xl text-xs py-2 px-3 text-primaryTxt font-semibold focus:border-amber-500"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-secondaryTxt uppercase">Standard Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 1499"
                    className="w-full bg-white border border-borderCol rounded-xl text-xs py-2 px-3 text-primaryTxt font-bold focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-secondaryTxt uppercase">Description</label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Fabric blend, fit details, or style notes..."
                  className="w-full bg-white border border-borderCol rounded-xl text-xs py-2 px-3 text-primaryTxt focus:border-amber-500"
                ></textarea>
              </div>

              {/* Sizes Tag input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-secondaryTxt uppercase">Available Sizes</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    placeholder="e.g. M, 32"
                    className="w-full bg-white border border-borderCol rounded-xl text-xs py-1.5 px-3"
                  />
                  <button
                    type="button"
                    onClick={handleAddSize}
                    className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {sizes.map((sz) => (
                    <span key={sz} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 text-xs font-bold">
                      {sz}
                      <button type="button" onClick={() => handleRemoveSize(sz)} className="text-amber-800 hover:text-red-600">×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Colors Tag input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-secondaryTxt uppercase">Available Colors</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    placeholder="e.g. Black, Light Blue"
                    className="w-full bg-white border border-borderCol rounded-xl text-xs py-1.5 px-3"
                  />
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {colors.map((c) => (
                    <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium">
                      {c}
                      <button type="button" onClick={() => handleRemoveColor(c)} className="text-slate-600 hover:text-red-600">×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4"
                />
                <label htmlFor="activeCheck" className="text-xs font-bold text-primaryTxt">
                  Item is active and available in shop
                </label>
              </div>

              {/* Buttons */}
              <div className="flex space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-xl text-secondaryTxt border border-borderCol"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-amber-500 hover:bg-amber-600 text-xs font-black rounded-xl text-darknavy shadow-md shadow-amber-500/20"
                >
                  {editingProduct ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
