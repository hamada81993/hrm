import { useState, useEffect } from 'react'
import { Plus, Clock, Calendar, User, AlertCircle } from 'lucide-react'

const Attendance = () => {
  const [attendances, setAttendances] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    check_in: '',
    check_out: ''
  })
  const [editingId, setEditingId] = useState(null)

  const API_BASE_URL = 'https://8000-ilws1uectkb5gq2pm9r49-4f62436f.manusvm.computer/api'

  useEffect(() => {
    fetchAttendances()
    fetchEmployees()
  }, [])

  const fetchAttendances = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/attendances`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setAttendances(data)
      }
    } catch (error) {
      console.error('Error fetching attendances:', error)
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
        ? `${API_BASE_URL}/attendances/${editingId}`
        : `${API_BASE_URL}/attendances`
      
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
        fetchAttendances()
        setShowForm(false)
        setEditingId(null)
        setFormData({
          employee_id: '',
          date: new Date().toISOString().split('T')[0],
          check_in: '',
          check_out: ''
        })
      }
    } catch (error) {
      console.error('Error saving attendance:', error)
    }
  }

  const handleEdit = (attendance) => {
    setFormData({
      employee_id: attendance.employee_id,
      date: attendance.date,
      check_in: attendance.check_in,
      check_out: attendance.check_out || ''
    })
    setEditingId(attendance.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE_URL}/attendances/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          fetchAttendances()
        }
      } catch (error) {
        console.error('Error deleting attendance:', error)
      }
    }
  }

  const formatTime = (time) => {
    if (!time) return '-'
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const getLateBadge = (lateMinutes) => {
    if (lateMinutes === 0) {
      return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">في الوقت</span>
    }
    return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">تأخير {lateMinutes} دقيقة</span>
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
        <h1 className="text-3xl font-bold text-gray-900">الحضور والانصراف</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          تسجيل حضور
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? 'تعديل الحضور' : 'تسجيل حضور جديد'}
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
                  التاريخ
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وقت الدخول
                </label>
                <input
                  type="time"
                  value={formData.check_in}
                  onChange={(e) => setFormData({...formData, check_in: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              {editingId && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    وقت الخروج
                  </label>
                  <input
                    type="time"
                    value={formData.check_out}
                    onChange={(e) => setFormData({...formData, check_out: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              )}

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
                      date: new Date().toISOString().split('T')[0],
                      check_in: '',
                      check_out: ''
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
                التاريخ
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                وقت الدخول
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                وقت الخروج
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                حالة التأخير
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendances.map((attendance) => (
              <tr key={attendance.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 ml-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {attendance.employee?.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 ml-2" />
                    <span className="text-sm text-gray-900">
                      {new Date(attendance.date).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-400 ml-2" />
                    <span className="text-sm text-gray-900">
                      {formatTime(attendance.check_in)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-400 ml-2" />
                    <span className="text-sm text-gray-900">
                      {formatTime(attendance.check_out)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getLateBadge(attendance.late_minutes)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(attendance)}
                    className="text-blue-600 hover:text-blue-900 ml-4"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(attendance.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {attendances.length === 0 && (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد سجلات حضور</h3>
            <p className="mt-1 text-sm text-gray-500">ابدأ بإضافة سجل حضور جديد</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Attendance

