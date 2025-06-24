import { useState, useEffect } from 'react'
import { Plus, Package, Calendar, User, AlertCircle, Hash, ArrowLeft, ArrowRight } from 'lucide-react'

const Custodies = () => {
  const [custodies, setCustodies] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    employee_id: '',
    item_name: '',
    item_number: '',
    issue_date: new Date().toISOString().split('T')[0],
    return_date: '',
    notes: ''
  })
  const [editingId, setEditingId] = useState(null)

  const API_BASE_URL = 'https://8000-ilws1uectkb5gq2pm9r49-4f62436f.manusvm.computer/api'

  useEffect(() => {
    fetchCustodies()
    fetchEmployees()
  }, [])

  const fetchCustodies = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/custodies`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setCustodies(data)
      }
    } catch (error) {
      console.error('Error fetching custodies:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/employees`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const url = editingId 
        ? `${API_BASE_URL}/custodies/${editingId}`
        : `${API_BASE_URL}/custodies`
      
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        fetchCustodies()
        setShowForm(false)
        setEditingId(null)
        setFormData({
          employee_id: '',
          item_name: '',
          item_number: '',
          issue_date: new Date().toISOString().split('T')[0],
          return_date: '',
          notes: ''
        })
      }
    } catch (error) {
      console.error('Error saving custody:', error)
    }
  }

  const handleEdit = (custody) => {
    setFormData({
      employee_id: custody.employee_id,
      item_name: custody.item_name,
      item_number: custody.item_number || '',
      issue_date: custody.issue_date,
      return_date: custody.return_date || '',
      notes: custody.notes || ''
    })
    setEditingId(custody.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE_URL}/custodies/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          fetchCustodies()
        }
      } catch (error) {
        console.error('Error deleting custody:', error)
      }
    }
  }

  const getStatusBadge = (custody) => {
    if (custody.return_date) {
      return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">مُستردة</span>
    }
    return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">قيد الاستخدام</span>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">العهدة</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          إضافة عهدة
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? 'تعديل العهدة' : 'إضافة عهدة جديدة'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الموظف
                </label>
                <select
                  value={formData.employee_id}
                  onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">اختر الموظف</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم العهدة
                </label>
                <input
                  type="text"
                  value={formData.item_name}
                  onChange={(e) => setFormData({...formData, item_name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                  placeholder="مثال: لابتوب، هاتف، مفاتيح..."
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم العهدة
                </label>
                <input
                  type="text"
                  value={formData.item_number}
                  onChange={(e) => setFormData({...formData, item_number: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="رقم تسلسلي أو كود العهدة"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ الاستلام
                </label>
                <input
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({...formData, issue_date: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ الإرجاع (اختياري)
                </label>
                <input
                  type="date"
                  value={formData.return_date}
                  onChange={(e) => setFormData({...formData, return_date: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="3"
                  placeholder="أي ملاحظات إضافية..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  {editingId ? 'تحديث' : 'حفظ'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                    setFormData({
                      employee_id: '',
                      item_name: '',
                      item_number: '',
                      issue_date: new Date().toISOString().split('T')[0],
                      return_date: '',
                      notes: ''
                    })
                  }}
                  className="flex-1 bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الموظف
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                اسم العهدة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                رقم العهدة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                تاريخ الاستلام
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                تاريخ الإرجاع
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
            {custodies.map((custody) => (
              <tr key={custody.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 ml-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {custody.employee?.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-gray-400 ml-2" />
                    <span className="text-sm text-gray-900">
                      {custody.item_name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Hash className="h-5 w-5 text-gray-400 ml-2" />
                    <span className="text-sm text-gray-900">
                      {custody.item_number || '-'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <ArrowLeft className="h-5 w-5 text-gray-400 ml-2" />
                    <span className="text-sm text-gray-900">
                      {new Date(custody.issue_date).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <ArrowRight className="h-5 w-5 text-gray-400 ml-2" />
                    <span className="text-sm text-gray-900">
                      {custody.return_date ? new Date(custody.return_date).toLocaleDateString('ar-EG') : '-'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(custody)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(custody)}
                    className="text-blue-600 hover:text-blue-900 ml-4"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(custody.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {custodies.length === 0 && (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد عهد مسجلة</h3>
            <p className="mt-1 text-sm text-gray-500">ابدأ بإضافة عهدة جديدة</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Custodies

