"use client";

import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Save, ChevronDown, ChevronUp } from 'lucide-react';

const MintTracker = () => {
  const [variants, setVariants] = useState([]);
  const [consumptions, setConsumptions] = useState([]);
  const [newVariant, setNewVariant] = useState({ name: '', price: '' });
  const [newConsumption, setNewConsumption] = useState({ people: '', variant: '', amount: '' });
  const [expandedPeople, setExpandedPeople] = useState({});

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedVariants = localStorage.getItem('mintTrackerVariants');
    const storedConsumptions = localStorage.getItem('mintTrackerConsumptions');
    if (storedVariants) setVariants(JSON.parse(storedVariants));
    if (storedConsumptions) setConsumptions(JSON.parse(storedConsumptions));
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('mintTrackerVariants', JSON.stringify(variants));
    localStorage.setItem('mintTrackerConsumptions', JSON.stringify(consumptions));
  }, [variants, consumptions]);

  const addVariant = () => {
    if (newVariant.name && newVariant.price) {
      setVariants([...variants, { ...newVariant, price: parseFloat(newVariant.price) }]);
      setNewVariant({ name: '', price: '' });
    }
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const logConsumption = () => {
    if (newConsumption.people && newConsumption.variant && newConsumption.amount) {
      setConsumptions([...consumptions, {
        ...newConsumption,
        people: newConsumption.people.toUpperCase().split(''),
        amount: parseFloat(newConsumption.amount),
        date: new Date().toISOString()
      }]);
      setNewConsumption({ people: '', variant: '', amount: '' });
    }
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      setVariants([]);
      setConsumptions([]);
      localStorage.removeItem('mintTrackerVariants');
      localStorage.removeItem('mintTrackerConsumptions');
    }
  };

  const calculateSummary = () => {
    const summary = {};
    consumptions.forEach(consumption => {
      const variantData = variants.find(v => v.name === consumption.variant);
      if (!variantData) return;

      const amountPerPerson = consumption.amount / consumption.people.length;
      const costPerPerson = amountPerPerson * variantData.price;

      consumption.people.forEach(person => {
        if (!summary[person]) summary[person] = { amount: 0, cost: 0, details: [] };
        summary[person].amount += amountPerPerson;
        summary[person].cost += costPerPerson;
        summary[person].details.push({
          date: consumption.date,
          variant: consumption.variant,
          amount: amountPerPerson,
          cost: costPerPerson
        });
      });
    });
    return summary;
  };

  const togglePersonDetails = (person) => {
    setExpandedPeople(prev => ({ ...prev, [person]: !prev[person] }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Mint Tracker</h1>

        {/* Mint Variants Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Mint Variants</h2>
          {variants.map((variant, index) => (
            <div key={index} className="flex items-center mb-2">
              <input 
                type="text" 
                value={variant.name} 
                onChange={(e) => setVariants(variants.map((v, i) => i === index ? { ...v, name: e.target.value } : v))}
                className="bg-gray-700 text-white px-3 py-2 rounded mr-2 flex-1"
                placeholder="Name"
              />
              <input 
                type="number" 
                value={variant.price} 
                onChange={(e) => setVariants(variants.map((v, i) => i === index ? { ...v, price: parseFloat(e.target.value) } : v))}
                className="bg-gray-700 text-white px-3 py-2 rounded mr-2 flex-1"
                placeholder="Price per g"
                step="0.01"
              />
              <button onClick={() => removeVariant(index)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded">
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          <div className="flex items-center mt-4">
            <input 
              type="text" 
              value={newVariant.name} 
              onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
              className="bg-gray-700 text-white px-3 py-2 rounded mr-2 flex-1"
              placeholder="Name"
            />
            <input 
              type="number" 
              value={newVariant.price} 
              onChange={(e) => setNewVariant({ ...newVariant, price: e.target.value })}
              className="bg-gray-700 text-white px-3 py-2 rounded mr-2 flex-1"
              placeholder="Price per g"
              step="0.01"
            />
            <button onClick={addVariant} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded">
              <PlusCircle size={20} />
            </button>
          </div>
        </div>

        {/* Log Consumption Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Log Consumption</h2>
          <div className="flex items-center mb-4">
            <input 
              type="text" 
              value={newConsumption.people} 
              onChange={(e) => setNewConsumption({ ...newConsumption, people: e.target.value })}
              className="bg-gray-700 text-white px-3 py-2 rounded mr-2 flex-1"
              placeholder="People (e.g., T, D, L, TD)"
            />
            <select 
              value={newConsumption.variant} 
              onChange={(e) => setNewConsumption({ ...newConsumption, variant: e.target.value })}
              className="bg-gray-700 text-white px-3 py-2 rounded mr-2 flex-1"
            >
              <option value="">Select Variant</option>
              {variants.map((variant, index) => (
                <option key={index} value={variant.name}>{variant.name}</option>
              ))}
            </select>
            <input 
              type="number" 
              value={newConsumption.amount} 
              onChange={(e) => setNewConsumption({ ...newConsumption, amount: e.target.value })}
              className="bg-gray-700 text-white px-3 py-2 rounded mr-2 flex-1"
              placeholder="Amount (g)"
              step="0.1"
            />
            <button onClick={logConsumption} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded">
              <Save size={20} />
            </button>
          </div>
        </div>

        {/* Consumption Summary Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Consumption Summary</h2>
          {Object.entries(calculateSummary()).map(([person, data]) => (
            <div key={person} className="mb-4">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => togglePersonDetails(person)}>
                <p className="text-lg font-semibold">
                  {person}: {data.amount.toFixed(2)}g (€{data.cost.toFixed(2)})
                </p>
                {expandedPeople[person] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              {expandedPeople[person] && (
                <div className="mt-2 pl-4 border-l border-gray-600">
                  {data.details.map((detail, index) => (
                    <p key={index} className="text-sm mb-1">
                      {detail.variant} - {detail.amount.toFixed(2)}g (€{detail.cost.toFixed(2)})
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Clear Data Button */}
        <button onClick={clearAllData} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
          Clear All Data
        </button>
      </div>
    </div>
  );
};

export default MintTracker;