import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  User,
  CreditCard,
  Shield,
  FileText,
  Download,
  Filter
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'https://spl-pro.com/hr/api';

const ExpiryManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [expiryData, setExpiryData] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterDays, setFilterDays] = useState('30');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, [filterDays]);

  useEffect(() => {
    filterData();
  }, [employees, filterType, searchTerm]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [employeesRes, expiryRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/employees`, { headers: getAuthHeaders() }),
        axios.get(`${API_BASE_URL}/expiry/expiring-documents/${filterDays}`, { headers: getAuthHeaders() }),
        axios.get(`${API_BASE_URL}/expiry/statistics`, { headers: getAuthHeaders() })
      ]);

      setEmployees(employeesRes.data);
      setExpiryData(expiryRes.data.employees || []);
      setStatistics(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = expiryData;

    if (filterType !== 'all') {
      filtered = filtered.filter(employee => 
        employee.expiring_documents.some(doc => doc.type === filterType)
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(employee => 
        employee.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employee_number.includes(searchTerm) ||
        employee.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'attention':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'valid':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'expired':
        return <XCircle className="h-4 w-4" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'warning':
        return <Clock className="h-4 w-4" />;
      case 'attention':
        return <Clock className="h-4 w-4" />;
      case 'valid':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'expired':
        return 'منتهي';
      case 'critical':
        return 'حرج';
      case 'warning':
        return 'تحذير';
      case 'attention':
        return 'انتباه';
      case 'valid':
        return 'صالح';
      default:
        return 'غير محدد';
    }
  };

  const getDocumentIcon = (type) => {
    switch (type) {
      case 'id_residence':
        return <CreditCard className="h-4 w-4" />;
      case 'passport':
        return <FileText className="h-4 w-4" />;
      case 'medical_insurance':
        return <Shield className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getDocumentLabel = (type) => {
    switch (type) {
      case 'id_residence':
        return 'الهوية/الإقامة';
      case 'passport':
        return 'جواز السفر';
      case 'medical_insurance':
        return 'التأمين الطبي';
      default:
        return 'مستند';
    }
  };

  const formatDaysRemaining = (days) => {
    if (days < 0) {
      return `منتهي منذ ${Math.abs(days)} يوم`;
    } else if (days === 0) {
      return 'ينتهي اليوم';
    } else if (days === 1) {
      return 'ينتهي غداً';
    } else {
      return `${days} يوم متبقي`;
    }
  };

  const exportToCSV = () => {
    const csvData = [];
    const headers = ['اسم الموظف', 'رقم الموظف', 'القسم', 'نوع المستند', 'رقم المستند', 'تاريخ الانتهاء', 'الأيام المتبقية', 'الحالة'];
    csvData.push(headers.join(','));

    filterData().forEach(employee => {
      employee.expiring_documents.forEach(doc => {
        const row = [
          employee.employee_name,
          employee.employee_number,
          employee.department,
          getDocumentLabel(doc.type),
          doc.number || '',
          doc.expiry_date,
          doc.days_remaining,
          getStatusText(doc.status)
        ];
        csvData.push(row.join(','));
      });
    });

    const csvContent = csvData.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expiry_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={fetchData}>إعادة المحاولة</Button>
      </div>
    );
  }

  const filteredData = filterData();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة انتهاء الصلاحيات</h1>
        <p className="text-gray-600">مراقبة انتهاء صلاحيات الهويات وجوازات السفر والتأمين الطبي</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">إجمالي الموظفين</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{statistics.total_employees}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">وثائق منتهية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {(statistics.id_residence?.expired || 0) + 
                 (statistics.passport?.expired || 0) + 
                 (statistics.medical_insurance?.expired || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">وثائق حرجة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {(statistics.id_residence?.critical || 0) + 
                 (statistics.passport?.critical || 0) + 
                 (statistics.medical_insurance?.critical || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">وثائق تحذيرية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {(statistics.id_residence?.warning || 0) + 
                 (statistics.passport?.warning || 0) + 
                 (statistics.medical_insurance?.warning || 0)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            الفلاتر والبحث
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">البحث</label>
              <Input
                placeholder="اسم الموظف، رقم الموظف، أو القسم"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">فترة الانتهاء</label>
              <Select value={filterDays} onValueChange={setFilterDays}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">خلال 7 أيام</SelectItem>
                  <SelectItem value="30">خلال 30 يوم</SelectItem>
                  <SelectItem value="90">خلال 90 يوم</SelectItem>
                  <SelectItem value="180">خلال 180 يوم</SelectItem>
                  <SelectItem value="365">خلال سنة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نوع المستند</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المستندات</SelectItem>
                  <SelectItem value="id_residence">الهوية/الإقامة</SelectItem>
                  <SelectItem value="passport">جواز السفر</SelectItem>
                  <SelectItem value="medical_insurance">التأمين الطبي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={exportToCSV} className="w-full">
                <Download className="h-4 w-4 ml-2" />
                تصدير التقرير
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expiry Data */}
      <Card>
        <CardHeader>
          <CardTitle>الوثائق المنتهية أو التي تنتهي قريباً ({filteredData.length} موظف)</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredData.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">لا توجد وثائق تنتهي في الفترة المحددة</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredData.map((employee) => (
                <div key={employee.employee_id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-500" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{employee.employee_name}</h3>
                        <p className="text-sm text-gray-600">
                          {employee.employee_number} - {employee.department}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {employee.expiring_documents.map((doc, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          {getDocumentIcon(doc.type)}
                          <span className="font-medium text-sm">{getDocumentLabel(doc.type)}</span>
                        </div>
                        
                        {doc.number && (
                          <p className="text-xs text-gray-600 mb-1">رقم: {doc.number}</p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-600">تاريخ الانتهاء</p>
                            <p className="text-sm font-medium">{new Date(doc.expiry_date).toLocaleDateString('ar-SA')}</p>
                          </div>
                          <div className="text-left">
                            <Badge className={`${getStatusColor(doc.status)} flex items-center gap-1`}>
                              {getStatusIcon(doc.status)}
                              {getStatusText(doc.status)}
                            </Badge>
                            <p className="text-xs text-gray-600 mt-1">
                              {formatDaysRemaining(doc.days_remaining)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpiryManagement;

