import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Search, 
  Download, 
  Upload, 
  Settings, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit,
  Trash2,
  User
} from 'lucide-react'
import axios from 'axios'

const API_BASE_URL = 'https://8000-ikjv94jznu3kys1ndw21z-4980ff6a.manus.computer/api'

const Employees = () => {
  const [employees, setEmployees] = useState([])
  const [filteredEmployees, setFilteredEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('الكل')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    employee_id: '',
    department: '',
    location: '',
    email: '',
    phone: '',
    join_date: '',
    status: 'نشط',
    salary: '',
    profile_image: '',
    work_type: '',
    id_residency_expiry: '',
    medical_insurance: '',
    company_name: '',
    start_date: '',
    driving_license: '',
    license_expiry_date: '',
    currency: 'SAR',
    basic_salary: '',
    housing_allowance: '',
    transportation_allowance: '',
    commissions: '',
    other_allowances: '',
    work_schedule_from: '',
    work_schedule_to: '',
    weekly_work_hours: '',
    home_country_address: '',
    nationality: '',
    relative_phone: '',
    passport_expiry_date: '',
    direct_manager: '',
    employee_photo: '',
    // Medical insurance fields
    medical_insurance_start_date: '',
    medical_insurance_end_date: '',
    medical_insurance_category: '',
    medical_insurance_company: '',
    // ID/Residence fields
    id_residence_number: '',
    id_residence_expiry_date: '',
    id_residence_type: 'هوية',
    // Passport fields
    passport_number: '',
    passport_issue_date: '',
    passport_country: ''
  })

  const departments = ['الكل', 'تقنية المعلومات', 'التصميم', 'الأعمال', 'إدارة المشاريع']

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    filterEmployees()
  }, [employees, searchTerm, selectedDepartment])

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('لا يوجد رمز مصادقة')
        setLoading(false)
        return
      }

      const response = await axios.get(`${API_BASE_URL}/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setEmployees(response.data || [])
      setError('')
    } catch (error) {
      console.error('Error fetching employees:', error)
      setError('حدث خطأ في تحميل بيانات الموظفين')
    } finally {
      setLoading(false)
    }
  }

  const filterEmployees = () => {
    let filtered = employees

    if (searchTerm) {
      filtered = filtered.filter(emp => 
        emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedDepartment !== 'الكل') {
      filtered = filtered.filter(emp => emp.department === selectedDepartment)
    }

    setFilteredEmployees(filtered)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      
      if (editingEmployee) {
        await axios.put(`${API_BASE_URL}/employees/${editingEmployee.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        await axios.post(`${API_BASE_URL}/employees`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      
      fetchEmployees()
      resetForm()
      setShowAddDialog(false)
      setEditingEmployee(null)
    } catch (error) {
      console.error('Error saving employee:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`${API_BASE_URL}/employees/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        fetchEmployees()
      } catch (error) {
        console.error('Error deleting employee:', error)
      }
    }
  }

  const handleEdit = (employee) => {
    setEditingEmployee(employee)
    setFormData({
      name: employee.name || '',
      position: employee.position || '',
      employee_id: employee.employee_id || '',
      department: employee.department || '',
      location: employee.location || '',
      email: employee.email || '',
      phone: employee.phone || '',
      join_date: employee.join_date ? employee.join_date.split('T')[0] : '',
      status: employee.status || 'نشط',
      salary: employee.salary || '',
      // New fields
      work_type: employee.work_type || '',
      id_residency_expiry: employee.id_residency_expiry ? employee.id_residency_expiry.split('T')[0] : '',
      medical_insurance: employee.medical_insurance || '',
      company_name: employee.company_name || '',
      start_date: employee.start_date ? employee.start_date.split('T')[0] : '',
      driving_license: employee.driving_license || '',
      license_expiry_date: employee.license_expiry_date ? employee.license_expiry_date.split('T')[0] : '',
      currency: employee.currency || 'SAR',
      basic_salary: employee.basic_salary || '',
      housing_allowance: employee.housing_allowance || '',
      transportation_allowance: employee.transportation_allowance || '',
      commissions: employee.commissions || '',
      other_allowances: employee.other_allowances || '',
      work_schedule_from: employee.work_schedule_from || '',
      work_schedule_to: employee.work_schedule_to || '',
      weekly_work_hours: employee.weekly_work_hours || '',
      home_country_address: employee.home_country_address || '',
      nationality: employee.nationality || '',
      relative_phone: employee.relative_phone || '',
      passport_expiry_date: employee.passport_expiry_date ? employee.passport_expiry_date.split('T')[0] : '',
      direct_manager: employee.direct_manager || '',
      employee_photo: employee.employee_photo || '',
      // New medical insurance fields
      medical_insurance_start_date: employee.medical_insurance_start_date ? employee.medical_insurance_start_date.split('T')[0] : '',
      medical_insurance_end_date: employee.medical_insurance_end_date ? employee.medical_insurance_end_date.split('T')[0] : '',
      medical_insurance_category: employee.medical_insurance_category || '',
      medical_insurance_company: employee.medical_insurance_company || ''
    })
    setShowAddDialog(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      position: '',
      employee_id: '',
      department: '',
      location: '',
      email: '',
      phone: '',
      join_date: '',
      status: 'نشط',
      salary: '',
      // New fields
      work_type: '',
      id_residency_expiry: '',
      medical_insurance: '',
      company_name: '',
      start_date: '',
      driving_license: '',
      license_expiry_date: '',
      currency: 'SAR',
      basic_salary: '',
      housing_allowance: '',
      transportation_allowance: '',
      commissions: '',
      other_allowances: '',
      work_schedule_from: '',
      work_schedule_to: '',
      weekly_work_hours: '',
      home_country_address: '',
      nationality: '',
      relative_phone: '',
      passport_expiry_date: '',
      direct_manager: '',
      employee_photo: '',
      // New medical insurance fields
      medical_insurance_start_date: '',
      medical_insurance_end_date: '',
      medical_insurance_category: '',
      medical_insurance_company: ''
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'نشط': return 'bg-green-100 text-green-800'
      case 'إجازة': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchEmployees}>إعادة المحاولة</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الموظفين</h1>
          <p className="text-gray-600">إدارة وتتبع معلومات الموظفين</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                resetForm()
                setEditingEmployee(null)
              }}
            >
              <Plus className="h-4 w-4 ml-2" />
              إضافة موظف جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEmployee ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">الاسم</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="position">المنصب</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="employee_id">رقم الموظف</Label>
                  <Input
                    id="employee_id"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="department">القسم</Label>
                  <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر القسم" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.slice(1).map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">الموقع</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="join_date">تاريخ الانضمام</Label>
                  <Input
                    id="join_date"
                    type="date"
                    value={formData.join_date}
                    onChange={(e) => setFormData({...formData, join_date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">الحالة</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="نشط">نشط</SelectItem>
                      <SelectItem value="إجازة">إجازة</SelectItem>
                      <SelectItem value="غير نشط">غير نشط</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="salary">الراتب</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({...formData, salary: e.target.value})}
                    required
                  />
                </div>
                
                {/* New Fields Section */}
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">معلومات إضافية</h3>
                </div>
                
                <div>
                  <Label htmlFor="work_type">نوع الدوام</Label>
                  <Select value={formData.work_type} onValueChange={(value) => setFormData({...formData, work_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الدوام" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="دوام كامل">دوام كامل</SelectItem>
                      <SelectItem value="دوام جزئي">دوام جزئي</SelectItem>
                      <SelectItem value="مؤقت">مؤقت</SelectItem>
                      <SelectItem value="تدريب">تدريب</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="nationality">الجنسية</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                  />
                </div>
                
                {/* ID/Residence Section */}
                <div className="col-span-2">
                  <h4 className="text-md font-medium text-gray-800 mb-2 border-b pb-1">بيانات الهوية/الإقامة</h4>
                </div>
                
                <div>
                  <Label htmlFor="id_residence_type">نوع الوثيقة</Label>
                  <Select value={formData.id_residence_type} onValueChange={(value) => setFormData({...formData, id_residence_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="هوية">هوية</SelectItem>
                      <SelectItem value="إقامة">إقامة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="id_residence_number">رقم الهوية/الإقامة</Label>
                  <Input
                    id="id_residence_number"
                    value={formData.id_residence_number}
                    onChange={(e) => setFormData({...formData, id_residence_number: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="id_residence_expiry_date">تاريخ انتهاء الهوية/الإقامة</Label>
                  <Input
                    id="id_residence_expiry_date"
                    type="date"
                    value={formData.id_residence_expiry_date}
                    onChange={(e) => setFormData({...formData, id_residence_expiry_date: e.target.value})}
                  />
                </div>
                
                {/* Passport Section */}
                <div className="col-span-2">
                  <h4 className="text-md font-medium text-gray-800 mb-2 border-b pb-1">بيانات جواز السفر</h4>
                </div>
                
                <div>
                  <Label htmlFor="passport_number">رقم جواز السفر</Label>
                  <Input
                    id="passport_number"
                    value={formData.passport_number}
                    onChange={(e) => setFormData({...formData, passport_number: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="passport_country">بلد الإصدار</Label>
                  <Input
                    id="passport_country"
                    value={formData.passport_country}
                    onChange={(e) => setFormData({...formData, passport_country: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="passport_issue_date">تاريخ الإصدار</Label>
                  <Input
                    id="passport_issue_date"
                    type="date"
                    value={formData.passport_issue_date}
                    onChange={(e) => setFormData({...formData, passport_issue_date: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="passport_expiry_date">تاريخ انتهاء جواز السفر</Label>
                  <Input
                    id="passport_expiry_date"
                    type="date"
                    value={formData.passport_expiry_date}
                    onChange={(e) => setFormData({...formData, passport_expiry_date: e.target.value})}
                  />
                </div>
                
                {/* Medical Insurance Section */}
                <div className="col-span-2">
                  <h4 className="text-md font-medium text-gray-800 mb-2 border-b pb-1">بيانات التأمين الطبي</h4>
                </div>
                
                <div>
                  <Label htmlFor="medical_insurance_category">فئة التأمين</Label>
                  <Select value={formData.medical_insurance_category} onValueChange={(value) => setFormData({...formData, medical_insurance_category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر فئة التأمين" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="أساسي">أساسي</SelectItem>
                      <SelectItem value="شامل">شامل</SelectItem>
                      <SelectItem value="VIP">VIP</SelectItem>
                      <SelectItem value="لا يوجد">لا يوجد</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="medical_insurance_company">شركة التأمين</Label>
                  <Input
                    id="medical_insurance_company"
                    value={formData.medical_insurance_company}
                    onChange={(e) => setFormData({...formData, medical_insurance_company: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="medical_insurance_start_date">تاريخ بداية التأمين</Label>
                  <Input
                    id="medical_insurance_start_date"
                    type="date"
                    value={formData.medical_insurance_start_date}
                    onChange={(e) => setFormData({...formData, medical_insurance_start_date: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="medical_insurance_end_date">تاريخ نهاية التأمين</Label>
                  <Input
                    id="medical_insurance_end_date"
                    type="date"
                    value={formData.medical_insurance_end_date}
                    onChange={(e) => setFormData({...formData, medical_insurance_end_date: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="medical_insurance">التأمين الطبي (ملاحظات)</Label>
                  <Input
                    id="medical_insurance"
                    value={formData.medical_insurance}
                    onChange={(e) => setFormData({...formData, medical_insurance: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="company_name">اسم الشركة</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="start_date">تاريخ المباشرة</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="driving_license">رخصة القيادة</Label>
                  <Select value={formData.driving_license} onValueChange={(value) => setFormData({...formData, driving_license: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="نعم">نعم</SelectItem>
                      <SelectItem value="لا">لا</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="license_expiry_date">تاريخ انتهاء الرخصة</Label>
                  <Input
                    id="license_expiry_date"
                    type="date"
                    value={formData.license_expiry_date}
                    onChange={(e) => setFormData({...formData, license_expiry_date: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="direct_manager">المدير المباشر</Label>
                  <Input
                    id="direct_manager"
                    value={formData.direct_manager}
                    onChange={(e) => setFormData({...formData, direct_manager: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="relative_phone">رقم تليفون أحد الأقارب</Label>
                  <Input
                    id="relative_phone"
                    value={formData.relative_phone}
                    onChange={(e) => setFormData({...formData, relative_phone: e.target.value})}
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="home_country_address">العنوان في البلد الأم</Label>
                  <Input
                    id="home_country_address"
                    value={formData.home_country_address}
                    onChange={(e) => setFormData({...formData, home_country_address: e.target.value})}
                  />
                </div>
                
                {/* Salary Details Section */}
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">تفاصيل الراتب</h3>
                </div>
                
                <div>
                  <Label htmlFor="currency">العملة</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAR">ريال سعودي</SelectItem>
                      <SelectItem value="USD">دولار أمريكي</SelectItem>
                      <SelectItem value="EUR">يورو</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="basic_salary">الراتب الأساسي</Label>
                  <Input
                    id="basic_salary"
                    type="number"
                    value={formData.basic_salary}
                    onChange={(e) => setFormData({...formData, basic_salary: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="housing_allowance">راتب بدل السكن</Label>
                  <Input
                    id="housing_allowance"
                    type="number"
                    value={formData.housing_allowance}
                    onChange={(e) => setFormData({...formData, housing_allowance: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="transportation_allowance">راتب بدل الانتقال</Label>
                  <Input
                    id="transportation_allowance"
                    type="number"
                    value={formData.transportation_allowance}
                    onChange={(e) => setFormData({...formData, transportation_allowance: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="commissions">عمولات</Label>
                  <Input
                    id="commissions"
                    type="number"
                    value={formData.commissions}
                    onChange={(e) => setFormData({...formData, commissions: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="other_allowances">أخرى</Label>
                  <Input
                    id="other_allowances"
                    type="number"
                    value={formData.other_allowances}
                    onChange={(e) => setFormData({...formData, other_allowances: e.target.value})}
                  />
                </div>
                
                {/* Work Schedule Section */}
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">مواعيد العمل</h3>
                </div>
                
                <div>
                  <Label htmlFor="work_schedule_from">من</Label>
                  <Input
                    id="work_schedule_from"
                    type="time"
                    value={formData.work_schedule_from}
                    onChange={(e) => setFormData({...formData, work_schedule_from: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="work_schedule_to">إلى</Label>
                  <Input
                    id="work_schedule_to"
                    type="time"
                    value={formData.work_schedule_to}
                    onChange={(e) => setFormData({...formData, work_schedule_to: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="weekly_work_hours">عدد ساعات العمل الأسبوعية</Label>
                  <Input
                    id="weekly_work_hours"
                    type="number"
                    value={formData.weekly_work_hours}
                    onChange={(e) => setFormData({...formData, weekly_work_hours: e.target.value})}
                  />
                </div>
                
                {/* Medical Insurance Section */}
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">التأمين الطبي</h3>
                </div>
                
                <div>
                  <Label htmlFor="medical_insurance_start_date">تاريخ بداية التأمين</Label>
                  <Input
                    id="medical_insurance_start_date"
                    type="date"
                    value={formData.medical_insurance_start_date}
                    onChange={(e) => setFormData({...formData, medical_insurance_start_date: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="medical_insurance_end_date">تاريخ نهاية التأمين</Label>
                  <Input
                    id="medical_insurance_end_date"
                    type="date"
                    value={formData.medical_insurance_end_date}
                    onChange={(e) => setFormData({...formData, medical_insurance_end_date: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="medical_insurance_category">فئة التأمين</Label>
                  <select
                    id="medical_insurance_category"
                    value={formData.medical_insurance_category}
                    onChange={(e) => setFormData({...formData, medical_insurance_category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">اختر فئة التأمين</option>
                    <option value="فئة أ - شاملة">فئة أ - شاملة</option>
                    <option value="فئة ب - أساسية">فئة ب - أساسية</option>
                    <option value="فئة ج - محدودة">فئة ج - محدودة</option>
                    <option value="فئة د - طوارئ">فئة د - طوارئ</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="medical_insurance_company">شركة التأمين</Label>
                  <select
                    id="medical_insurance_company"
                    value={formData.medical_insurance_company}
                    onChange={(e) => setFormData({...formData, medical_insurance_company: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">اختر شركة التأمين</option>
                    <option value="شركة بوبا العربية للتأمين">شركة بوبا العربية للتأمين</option>
                    <option value="شركة التعاونية للتأمين">شركة التعاونية للتأمين</option>
                    <option value="شركة ساب تكافل">شركة ساب تكافل</option>
                    <option value="شركة الراجحي تكافل">شركة الراجحي تكافل</option>
                    <option value="شركة وقاية للتأمين التعاوني">شركة وقاية للتأمين التعاوني</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingEmployee ? 'تحديث' : 'إضافة'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowAddDialog(false)
                    setEditingEmployee(null)
                    resetForm()
                  }}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Button variant="outline">
          <Download className="h-4 w-4 ml-2" />
          تصدير البيانات
        </Button>
        <Button variant="outline">
          <Upload className="h-4 w-4 ml-2" />
          استيراد
        </Button>
        <Button variant="outline">
          <Settings className="h-4 w-4 ml-2" />
          إعدادات
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="البحث بالاسم، البريد الإلكتروني، أو رقم الموظف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{employee.name}</CardTitle>
                    <p className="text-sm text-gray-600">{employee.position}</p>
                    <p className="text-xs text-gray-500">{employee.employee_id}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(employee)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(employee.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Badge className={getStatusColor(employee.status)}>
                  {employee.status}
                </Badge>
                <span className="text-gray-600">{employee.department}</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{employee.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{employee.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>انضم في {new Date(employee.join_date).toLocaleDateString('ar-SA')}</span>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="text-lg font-bold text-green-600">
                  {parseFloat(employee.salary).toLocaleString()} ريال
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEmployees.length === 0 && !loading && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد نتائج</h3>
          <p className="text-gray-600">لم يتم العثور على موظفين يطابقون معايير البحث</p>
        </div>
      )}
    </div>
  )
}

export default Employees

