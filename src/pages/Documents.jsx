import { useState, useEffect } from 'react';
import axios from 'axios';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    document_type: 'general',
    notes: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const API_BASE_URL = 'https://8000-i4rcy7spqh5n40ny0z4f3-4f62436f.manusvm.computer/api';

  useEffect(() => {
    fetchDocuments();
    fetchEmployees();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(response.data.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
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
      const formDataToSend = new FormData();
      
      if (formData.employee_id) {
        formDataToSend.append('employee_id', formData.employee_id);
      }
      formDataToSend.append('document_type', formData.document_type);
      if (formData.notes) {
        formDataToSend.append('notes', formData.notes);
      }
      
      if (selectedFile) {
        formDataToSend.append('file', selectedFile);
      }

      if (editingDocument) {
        await axios.post(`${API_BASE_URL}/documents/${editingDocument.id}?_method=PUT`, formDataToSend, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        if (!selectedFile) {
          alert('يرجى اختيار ملف للرفع');
          return;
        }
        await axios.post(`${API_BASE_URL}/documents`, formDataToSend, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      fetchDocuments();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving document:', error);
      alert('حدث خطأ أثناء حفظ البيانات');
    }
  };

  const handleEdit = (document) => {
    setEditingDocument(document);
    setFormData({
      employee_id: document.employee_id || '',
      document_type: document.document_type,
      notes: document.notes || ''
    });
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستند؟')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/documents/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchDocuments();
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('حدث خطأ أثناء حذف البيانات');
      }
    }
  };

  const handleDownload = async (id, fileName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/documents/${id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('حدث خطأ أثناء تحميل الملف');
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      document_type: 'general',
      notes: ''
    });
    setSelectedFile(null);
    setEditingDocument(null);
  };

  const getDocumentTypeText = (type) => {
    switch (type) {
      case 'contract': return 'عقد عمل';
      case 'id': return 'هوية';
      case 'passport': return 'جواز سفر';
      case 'certificate': return 'شهادة';
      case 'medical_report': return 'تقرير طبي';
      case 'cv': return 'سيرة ذاتية';
      case 'photo': return 'صورة شخصية';
      case 'general': return 'مستند عام';
      default: return 'أخرى';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'غير محدد';
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">جاري التحميل...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">إدارة المستندات</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          رفع مستند جديد
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                اسم الملف
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                نوع المستند
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الموظف
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                حجم الملف
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                تاريخ الرفع
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {documents.map((document) => (
              <tr key={document.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {document.file_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getDocumentTypeText(document.document_type)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {document.employee?.name || 'مستند عام'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatFileSize(document.file_size)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(document.created_at).toLocaleDateString('ar-SA')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleDownload(document.id, document.file_name)}
                    className="text-blue-600 hover:text-blue-900 ml-2"
                  >
                    تحميل
                  </button>
                  <button
                    onClick={() => handleEdit(document)}
                    className="text-indigo-600 hover:text-indigo-900 ml-2"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(document.id)}
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
                {editingDocument ? 'تعديل المستند' : 'رفع مستند جديد'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الموظف (اختياري)
                  </label>
                  <select
                    value={formData.employee_id}
                    onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">مستند عام (غير مرتبط بموظف)</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نوع المستند
                  </label>
                  <select
                    value={formData.document_type}
                    onChange={(e) => setFormData({...formData, document_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="general">مستند عام</option>
                    <option value="contract">عقد عمل</option>
                    <option value="id">هوية</option>
                    <option value="passport">جواز سفر</option>
                    <option value="certificate">شهادة</option>
                    <option value="medical_report">تقرير طبي</option>
                    <option value="cv">سيرة ذاتية</option>
                    <option value="photo">صورة شخصية</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الملف {editingDocument ? '(اختياري للتحديث)' : ''}
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    required={!editingDocument}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    الملفات المدعومة: PDF, DOC, DOCX, JPG, PNG, GIF (حد أقصى 10 ميجابايت)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ملاحظات
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="أضف ملاحظات حول هذا المستند..."
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
                    {editingDocument ? 'تحديث' : 'رفع'}
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

export default Documents;

