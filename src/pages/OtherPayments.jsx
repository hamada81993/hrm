import { useState, useEffect } from 'react'
import { Plus, DollarSign, Calendar, User, AlertCircle, FileText } from 'lucide-react'

const OtherPayments = () => {
  const [payments, setPayments] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    employee_id: '',
    type: '',
    residence_duration: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: ''
  })
  const [editingId, setEditingId] = useState(null)

  const API_BASE_URL = 'https://8000-ilws1uectkb5gq2pm9r49-4f62436f.manusvm.computer/api'

  const paymentTypes = [
    'تكلفة الإقامة',
    'كارت عمل',
    'تأمين طبي',
    'رسوم جوازات'
  ]

  const residenceDurations = [
    { value: '3_months', label: '3 أشهر' },
    { value: '6_months', label: '6 أشهر' },
    { value: '9_months', label: '9 أشهر' },
    { value: '1_year', label: 'سنة' }
  ]

  useEffect(() => {
    fetchPayments()
    fetchEmployees()
  }, [])

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/other-payments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setPayments(data)
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
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
        ? `${API_BASE_URL}/other-payments/${editingId}`
        : `${API_BASE_URL}/other-payments`
      
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
        fetchPayments()
        setShowForm(false)
        setEditingId(null)
        setFormData({
          employee_id: '',
          type: '',
          residence_duration: '',
          amount: '',
          payment_date: new Date().toISOString().split('T')[0],
          notes: ''
        })
      }
    } catch (error) {
      console.error('Error saving payment:', error)
    }
  }

  const handleEdit = (payment) => {
    setFormData({
      employee_id: payment.employee_id,
      type: payment.type,
      residence_duration: payment.residence_duration || '',
      amount: payment.amount,
      payment_date: payment.payment_date,
      notes: payment.notes || ''
    })
    setEditingId(payment.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE_URL}/other-payments/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          fetchPayments()
        }
      } catch (error) {
        console.error('Error deleting payment:', error)
      }
    }
  }

  const getResidenceDurationLabel = (duration) => {
    const found = residenceDurations.find(d => d.value === duration)
    return found ? found.label : '-'
  }

  const getPaymentTypeBadge = (type) => {
    const colors = {
      'تكلفة الإقامة': 'bg-blue-100 text-blue-800',
      'كارت عمل': 'bg-green-100 text-green-800',
      'تأمين طبي': 'bg-purple-100 text-purple-800',
      'رسوم جوازات': 'bg-orange-100 text-orange-800'
    }
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
        {type}
      </span>
    )
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
        <h1 className="text-3xl font-bold text-gray-900">المدفوعات الأخرى</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          إضافة مدفوعة
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? 'تعديل المدفوعة' : 'إضافة مدفوعة جديدة'}
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
                  نوع المدفوعة
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">اختر نوع المدفوعة</option>
                  {paymentTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {formData.type === 'تكلفة الإقامة' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    مدة الإقامة
                  </label>
                  <select
                    value={formData.residence_duration}
                    onChange={(e) => setFormData({...formData, residence_duration: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">اختر مدة الإقامة</option>
                    {residenceDurations.map(duration => (
                      <option key={duration.value} value={duration.value}>
                        {duration.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المبلغ
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ الدفع
                </label>
                <input
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => setFormData({...formData, payment_date: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
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
                      type: '',
                      residence_duration: '',
                      amount: '',
                      payment_date: new Date().toISOString().split('T')[0],
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
                نوع المدفوعة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                مدة الإقامة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المبلغ
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                تاريخ الدفع
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 ml-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {payment.employee?.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getPaymentTypeBadge(payment.type)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {getResidenceDurationLabel(payment.residence_duration)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-gray-400 ml-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {parseFloat(payment.amount).toLocaleString('ar-EG')} ريال
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 ml-2" />
                    <span className="text-sm text-gray-900">
                      {new Date(payment.payment_date).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(payment)}
                    className="text-blue-600 hover:text-blue-900 ml-4"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(payment.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {payments.length === 0 && (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد مدفوعات أخرى</h3>
            <p className="mt-1 text-sm text-gray-500">ابدأ بإضافة مدفوعة جديدة</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default OtherPayments

