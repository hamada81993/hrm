import { useState, useEffect } from 'react';
import axios from 'axios';

const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    leave_type: 'annual',
    start_date: '',
    end_date: '',
    return_date: '',
    reason: '',
    notes: ''
  });

  const API_BASE_URL = 'http://spl-pro.com/hr/api';

  useEffect(() => {
    fetchLeaves();
    fetchEmployees();
  }, []);

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/leaves`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaves(response.data.data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (editingLeave) {
        await axios.put(`${API_BASE_URL}/leaves/${editingLeave.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_BASE_URL}/leaves`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      fetchLeaves();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving leave:', error);
      alert('حدث خطأ أثناء حفظ البيانات');
    }
  };

  const handleEdit = (leave) => {
    setEditingLeave(leave);
    setFormData({
      employee_id: leave.employee_id,
      leave_type: leave.leave_type,
      start_date: leave.start_date,
      end_date: leave.end_date,
      return_date: leave.return_date || '',
      reason: leave.reason,
      notes: leave.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/leaves/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchLeaves();
      } catch (error) {
        console.error('Error deleting leave:', error);
        alert('حدث خطأ أثناء حذف البيانات');
      }
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/leaves/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLeaves();
    } catch (error) {
      console.error('Error approving leave:', error);
      alert('حدث خطأ أثناء الموافقة على الطلب');
    }
  };

  const handleReject = async (id) => {
    const notes = prompt('أدخل سبب الرفض (اختياري):');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/leaves/${id}/reject`, { notes }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLeaves();
    } catch (error) {
      console.error('Error rejecting leave:', error);
      alert('حدث خطأ أثناء رفض الطلب');
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      leave_type: 'annual',
      start_date: '',
      end_date: '',
      return_date: '',
      reason: '',
      notes: ''
    });
    setEditingLeave(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'موافق عليها';
      case 'rejected': return 'مرفوضة';
      case 'pending': return 'في الانتظار';
      default: return status;
    }
  };

  const getLeaveTypeText = (type) => {
    switch (type) {
      case 'annual': return 'إجازة سنوية';
      case 'sick': return 'إجازة مرضية';
      case 'emergency': return 'إجازة طارئة';
      case 'maternity': return 'إجازة أمومة';
      case 'paternity': return 'إجازة أبوة';
      case 'unpaid': return 'إجازة بدون راتب';
      default: return 'أخرى';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">جاري التحميل...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">إدارة الإجازات</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          طلب إجازة جديد
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الموظف
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                نوع الإجازة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                تاريخ البداية
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                تاريخ النهاية
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                تاريخ العودة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaves.map((leave) => (
              <tr key={leave.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {leave.employee?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getLeaveTypeText(leave.leave_type)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(leave.start_date).toLocaleDateString('ar-SA')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(leave.end_date).toLocaleDateString('ar-SA')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {leave.return_date ? new Date(leave.return_date).toLocaleDateString('ar-SA') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(leave.status)}`}>
                    {getStatusText(leave.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  {leave.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(leave.id)}
                        className="text-green-600 hover:text-green-900 ml-2"
                      >
                        موافقة
                      </button>
                      <button
                        onClick={() => handleReject(leave.id)}
                        className="text-red-600 hover:text-red-900 ml-2"
                      >
                        رفض
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleEdit(leave)}
                    className="text-indigo-600 hover:text-indigo-900 ml-2"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(leave.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingLeave ? 'تعديل طلب الإجازة' : 'طلب إجازة جديد'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الموظف
                  </label>
                  <select
                    value={formData.employee_id}
                    onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">اختر الموظف</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نوع الإجازة
                  </label>
                  <select
                    value={formData.leave_type}
                    onChange={(e) => setFormData({...formData, leave_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="annual">إجازة سنوية</option>
                    <option value="sick">إجازة مرضية</option>
                    <option value="emergency">إجازة طارئة</option>
                    <option value="maternity">إجازة أمومة</option>
                    <option value="paternity">إجازة أبوة</option>
                    <option value="unpaid">إجازة بدون راتب</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تاريخ البداية
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تاريخ النهاية
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تاريخ العودة المتوقع
                  </label>
                  <input
                    type="date"
                    value={formData.return_date}
                    onChange={(e) => setFormData({...formData, return_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    سبب الإجازة
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ملاحظات
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 ml-2"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
                  >
                    {editingLeave ? 'تحديث' : 'حفظ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaves;

