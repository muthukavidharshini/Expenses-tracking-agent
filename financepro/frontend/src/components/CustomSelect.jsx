import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';

function CustomSelect({ 
  value, 
  onChange, 
  options = [], 
  className = '', 
  style = {}, 
  disabled = false, 
  placeholder = 'Select Category',
  searchable = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen, searchable]);

  const getOptionLabel = (option) => {
    if (typeof option === 'object' && option !== null) {
      return option.label;
    }
    return option;
  };

  const getOptionValue = (option) => {
    if (typeof option === 'object' && option !== null) {
      return option.value;
    }
    return option;
  };

  // Find label of active selected item
  const selectedOption = options.find(
    (opt) => getOptionValue(opt)?.toString() === value?.toString()
  );
  
  const displayLabel = selectedOption ? getOptionLabel(selectedOption) : placeholder;

  const handleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } }); // Mimic standard target value event structure
    setIsOpen(false);
  };

  // Filter options based on search term
  const filteredOptions = options.filter(opt => 
    getOptionLabel(opt).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div 
      ref={dropdownRef} 
      className={`custom-select-container ${className}`} 
      style={{ position: 'relative', width: '100%', ...style }}
    >
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="form-input"
        disabled={disabled}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          textAlign: 'left',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          paddingRight: '1rem',
          userSelect: 'none',
          color: selectedOption ? 'var(--text-primary)' : 'var(--text-muted)'
        }}
      >
        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {displayLabel}
        </span>
        <ChevronDown 
          size={16} 
          style={{ 
            color: 'var(--text-muted)', 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
            marginLeft: '0.5rem'
          }} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '4px',
              background: '#1E293B',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.8), 0 0 15px rgba(139, 92, 246, 0.08)',
              zIndex: 9999,
              overflow: 'hidden'
            }}
          >
            {/* Search Input Box */}
            {searchable && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '0.5rem 0.75rem', 
                borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                background: 'rgba(255, 255, 255, 0.02)'
              }}>
                <Search size={14} style={{ color: 'var(--text-muted)', marginRight: '0.5rem', flexShrink: 0 }} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.85rem',
                    color: '#ffffff',
                    padding: '0.2rem 0'
                  }}
                />
              </div>
            )}

            <div
              className="custom-select-menu"
              style={{
                maxHeight: '220px',
                overflowY: 'auto',
                padding: '0.35rem'
              }}
            >
              {filteredOptions.length === 0 ? (
                <div style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  No options found
                </div>
              ) : (
                filteredOptions.map((opt, idx) => {
                  const optVal = getOptionValue(opt);
                  const optLabel = getOptionLabel(opt);
                  const isSelected = optVal?.toString() === value?.toString();

                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelect(optVal)}
                      className="custom-select-option"
                      style={{
                        padding: '0.65rem 1rem',
                        fontSize: '0.875rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: isSelected ? '#3B82F6' : 'transparent',
                        color: '#ffffff',
                        fontWeight: isSelected ? '700' : '500',
                        marginBottom: idx === filteredOptions.length - 1 ? 0 : '2px',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = '#8B5CF6';
                          e.currentTarget.style.color = '#ffffff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#ffffff';
                        }
                      }}
                    >
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {optLabel}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CustomSelect;
