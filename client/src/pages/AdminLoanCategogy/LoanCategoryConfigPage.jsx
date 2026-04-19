import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
//import pb from '@/lib/pocketbaseClient.js';
import { ListTree, Edit2, Save, X, RotateCcw, Plus } from 'lucide-react';
import { Button } from '@/component/ui/button';
import { Input } from '@/component/ui/input';
import { toast } from "sonner";

const LoanCategoryConfigPage = () => {

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  //  NEW CATEGORY STATES
  const [newCategory, setNewCategory] = useState('');
  const [newRate, setNewRate] = useState('');

  //  TEMP EMPLOYEE ID (later from login system)
  const employeeId = "EMP001";

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {

      //  HARD CODED DATA
      const data = [
        { id: "1", loan_category: "30-day", interest_rate: 10, updated: "2026-04-18", updated_by: "EMP001" },
        { id: "2", loan_category: "60-day", interest_rate: 12, updated: "2026-04-18", updated_by: "EMP002" },
        { id: "3", loan_category: "90-day", interest_rate: 15, updated: "2026-04-18", updated_by: "EMP003" }
      ];

      setCategories(data);

      /*
      //  DATABASE VERSION
      const data = await pb.collection('interest_rate_config').getFullList({
        sort: 'loan_category'
      });
      setCategories(data);
      */

    } catch (error) {
      console.error(error);
      toast.error("Failed to load loan categories");
    } finally {
      setLoading(false);
    }
  };

  //  EDIT
  const handleEdit = (category) => {
    setEditingId(category.id);
    setEditValue(category.interest_rate.toString());
  };

  //  CANCEL
  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  //  SAVE
  const handleSave = async (id) => {
    try {
      const rate = parseFloat(editValue);

      if (!editValue || isNaN(rate) || rate < 0 || rate > 100) {
        toast.error("Interest rate must be between 0 and 100");
        return;
      }

      // UI UPDATE
      setCategories(prev =>
        prev.map(cat =>
          cat.id === id
            ? {
                ...cat,
                interest_rate: rate,
                updated: new Date().toISOString(),
                updated_by: employeeId
              }
            : cat
        )
      );

      /*
      // DATABASE UPDATE
      await pb.collection('interest_rate_config').update(id, {
        interest_rate: rate,
        updated_by: employeeId
      });
      */

      toast.success("Updated successfully");
      setEditingId(null);
      setEditValue("");

    } catch (error) {
      console.error(error);
      toast.error("Update failed");
    }
  };

  //  RESET BUTTON
  const handleReset = (id) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === id
          ? { ...cat, interest_rate: 10 }
          : cat
      )
    );

    toast.success("Reset to default");

    /*
    //  DATABASE RESET
    await pb.collection('interest_rate_config').update(id, {
      interest_rate: 10
    });
    */
  };

  //  ADD NEW CATEGORY
  const handleAddCategory = () => {
    if (!newCategory || !newRate) {
      toast.error("Fill all fields");
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      loan_category: newCategory,
      interest_rate: parseFloat(newRate),
      updated: new Date().toISOString(),
      updated_by: employeeId
    };

    setCategories(prev => [...prev, newItem]);

    /*
    // DATABASE CREATE
    await pb.collection('interest_rate_config').create({
      loan_category: newCategory,
      interest_rate: parseFloat(newRate),
      updated_by: employeeId
    });
    */

    setNewCategory('');
    setNewRate('');
    toast.success("Category added");
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Loan Categories</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="p-8">

          <h1 className="text-3xl font-bold mb-6">Loan Categories</h1>

          {/*ADD FORM */}
          <div className="flex gap-4 mb-6 flex-wrap">
            <Input
              placeholder="Category (e.g. 120-day)"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Interest %"
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
            />
            <Button onClick={handleAddCategory}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-xl shadow border w-full overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left">Category</th>
                  <th className="p-4 text-left">Interest</th>
                  <th className="p-4 text-left">Updated</th>
                  <th className="p-4 text-left">Employee</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id} className="border-t">

                    <td className="p-4">{cat.loan_category}</td>

                    <td className="p-4">
                      {editingId === cat.id ? (
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-24"
                        />
                      ) : (
                        `${cat.interest_rate}%`
                      )}
                    </td>

                    <td className="p-4">
                      {new Date(cat.updated).toLocaleDateString()}
                    </td>

                    <td className="p-4">{cat.updated_by}</td>

                    <td className="p-4 flex gap-2 flex-wrap">

                      {editingId === cat.id ? (
                        <>
                          <Button size="sm" onClick={() => handleSave(cat.id)}>
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancel}>
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" onClick={() => handleEdit(cat)}>
                            <Edit2 className="w-4 h-4 mr-1" /> Edit
                          </Button>

                          <Button size="sm" variant="outline" onClick={() => handleReset(cat.id)}>
                            <RotateCcw className="w-4 h-4 mr-1" /> Reset
                          </Button>
                        </>
                      )}

                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </>
  );
};

export default LoanCategoryConfigPage;