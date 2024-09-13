import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { FaEdit, FaTrash } from 'react-icons/fa';

function App() {
  const loadInitialJson = () => {
    const savedJson = localStorage.getItem('dynamicJson');
    const initialData = savedJson ? JSON.parse(savedJson) : [
      {
        key: 'first_name',
        label: 'First Name',
        placeholder: 'Enter Your First Name',
        type: 'text'
      },
      {
        key: 'middle_name',
        label: 'Middle Name',
        placeholder: 'Enter Your Middle Name',
        type: 'text'
      },
      {
        key: 'last_name',
        label: 'Last Name',
        placeholder: 'Enter Your Last Name',
        type: 'text'
      }
    ];

    console.log('Initial JSON data:', initialData);  
    return initialData;
  };

  const [formData, setFormData] = useState(loadInitialJson);
  const [formValues, setFormValues] = useState({});  
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [editingField, setEditingField] = useState({ index: null, field: null });
  const [editInput, setEditInput] = useState('');
  const [newField, setNewField] = useState({ label: '', placeholder: '' });
  const [inputType, setInputType] = useState('text');
  const [draggedIndex, setDraggedIndex] = useState(null);

  const inputRefs = useRef([]);

  useEffect(() => {
    console.log('FormData in useEffect:', formData);  
    localStorage.setItem('dynamicJson', JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (e, key) => {
    setFormValues({
      ...formValues,
      [key]: e.target.value
    });
  };

  const handleAddField = (e) => {
    e.preventDefault();
    if (newField.label.trim()) {
      const newKey = `new_field_${formData.length + 1}`;
      const newFormData = [
        ...formData,
        {
          key: newKey,
          label: newField.label || 'New Field',
          placeholder: inputType === 'radio' ? '' : newField.placeholder || 'Enter value',
          type: inputType
        }
      ];
      setFormData(newFormData);
      console.log('Updated formData after adding field:', newFormData); 
      setNewField({ label: '', placeholder: '' });
      setInputType('text');

      setTimeout(() => {
        const index = newFormData.length - 1;
        if (inputRefs.current[index]) {
          inputRefs.current[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 0);
    } else {
      alert('Please provide a label');
    }
  };

  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  const handleOptionClick = (index, field) => {
    setEditingField({ index, field });
    setEditInput(field === 'label' ? formData[index].label : formData[index].placeholder);
    setActiveDropdown(null);
  };

  const handleEditInputChange = (e) => {
    setEditInput(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingField.index !== null) {
      const updatedFormData = [...formData];
      if (editingField.field === 'label') {
        updatedFormData[editingField.index].label = editInput;
      } else if (editingField.field === 'placeholder') {
        updatedFormData[editingField.index].placeholder = editInput;
      }
      setFormData(updatedFormData);
      console.log('FormData after edit submit:', updatedFormData);  
      setEditingField({ index: null, field: null });
    } else {
      console.log('Form values:', formValues);
    }
  };

  const handleDeleteField = (index) => {
    const updatedFormData = formData.filter((_, i) => i !== index);
    setFormData(updatedFormData);
    console.log('Updated formData after delete:', updatedFormData);  
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (index) => {
    const updatedFormData = [...formData];
    const [movedField] = updatedFormData.splice(draggedIndex, 1);
    updatedFormData.splice(index, 0, movedField);
    setFormData(updatedFormData);
    console.log('Updated formData after drag and drop:', updatedFormData);  
    setDraggedIndex(null);
  };

  return (
    <div className="App">
      {console.log('Rendering formData:', formData)} 
      <h1>Dynamic From</h1>
      <form onSubmit={handleSubmit}>
        {formData.map((field, index) => (
          <div
            className="input-container"
            key={index}
            ref={el => inputRefs.current[index] = el}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
          >
            {editingField.index === index && editingField.field === 'label' ? (
              <>
                <input
                  type="text"
                  value={editInput}
                  onChange={handleEditInputChange}
                  className="edit-input"
                />
                <button type="submit">Submit</button>
              </>
            ) : editingField.index === index && editingField.field === 'placeholder' ? (
              <>
                <input
                  type="text"
                  value={editInput}
                  onChange={handleEditInputChange}
                  className="edit-input"
                />
                <button type="submit">Submit</button>
              </>
            ) : (
              <>
                <label>{field.label}</label>
                {field.type === 'radio' ? (
                  <input
                    type="radio"
                    name={field.key}
                    onChange={(e) => handleInputChange(e, field.key)}
                  />
                ) : (
                  <input
                    type={field.type || 'text'}
                    placeholder={field.placeholder}
                    value={formValues[field.key] || ''}
                    onChange={(e) => handleInputChange(e, field.key)}
                  />
                )}
              </>
            )}
            <div className="input-with-icon">
              <FaEdit
                className="edit-icon"
                onClick={() => toggleDropdown(index)}
              />
              <FaTrash
                className="delete-icon"
                onClick={() => handleDeleteField(index)}
              />
              {activeDropdown === index && (
                <div className="dropdown">
                  <div onClick={() => handleOptionClick(index, 'label')}>
                    Edit Label
                  </div>
                  <div onClick={() => handleOptionClick(index, 'placeholder')}>
                    Edit Placeholder
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>

      <div className="add-field-container">
        <h2>Add New Field</h2>
        <form onSubmit={handleAddField}>
          <div className="input-type-selection">
            <label>
              Field Type:
              <select
                value={inputType}
                onChange={(e) => setInputType(e.target.value)}
              >
                <option value="text">Input Field</option>
                <option value="radio">Radio Button</option>
              </select>
            </label>
          </div>

          <div className="add-field-inputs">
            <input
              type="text"
              value={newField.label}
              onChange={(e) => setNewField({ ...newField, label: e.target.value })}
              placeholder="Field Label"
            />
            {inputType !== 'radio' && (
              <input
                type="text"
                value={newField.placeholder}
                onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                placeholder="Field Placeholder"
              />
            )}
          </div>
          <button type="submit">Add Field</button>
        </form>
      </div>
    </div>
  );
}

export default App;
