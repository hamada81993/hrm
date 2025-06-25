import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'https://hr.spl-pro.com/api';

const Payroll = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [salaryDetails, setSalaryDetails] = useState(null);
  const [payrollSummary, setPayrollSummary] = useState(null);
  const [advances, setAdvances] = useState([]);
  const [penalties, setPenalties] = useState([]);
  const [allowances, setAllowances] = useState([]);
  const [otherPayments, setOtherPayments] = useState([]);
  const [custodies, setCustodies] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchEmployees();
    fetchPayrollSummary();
    fetchAdvances();
    fetchPenalties();
    fetchAllowances();
    fetchOtherPayments();
    fetchCustodies();
    fetchAttendances();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/employees`, {
        headers: getAuthHeaders(),
      });
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchPayrollSummary = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/payroll/summary`, {
        headers: getAuthHeaders(),
      });
      setPayrollSummary(response.data);
    } catch (error) {
      console.error("Error fetching payroll summary:", error);
    }
  };

  const fetchAdvances = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/advances`, {
        headers: getAuthHeaders(),
      });
      setAdvances(response.data);
    } catch (error) {
      console.error("Error fetching advances:", error);
    }
  };

  const fetchPenalties = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/penalties`, {
        headers: getAuthHeaders(),
      });
      setPenalties(response.data);
    } catch (error) {
      console.error("Error fetching penalties:", error);
    }
  };

  const fetchAllowances = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/allowances`, {
        headers: getAuthHeaders(),
      });
      setAllowances(response.data);
    } catch (error) {
      console.error("Error fetching allowances:", error);
    }
  };

  const fetchOtherPayments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/other-payments`, {
        headers: getAuthHeaders(),
      });
      setOtherPayments(response.data);
    } catch (error) {
      console.error("Error fetching other payments:", error);
    }
  };

  const fetchCustodies = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/custodies`, {
        headers: getAuthHeaders(),
      });
      setCustodies(response.data);
    } catch (error) {
      console.error("Error fetching custodies:", error);
    }
  };

  const fetchAttendances = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/attendances`, {
        headers: getAuthHeaders(),
      });
      setAttendances(response.data);
    } catch (error) {
      console.error("Error fetching attendances:", error);
    }
  };

  const fetchEmployeeSalaryDetails = async (employeeId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/employees/${employeeId}/salary-details`,
        {
          headers: getAuthHeaders(),
        }
      );
      setSalaryDetails(response.data);
      setSelectedEmployee(response.data.employee);
    } catch (error) {
      console.error("Error fetching salary details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let endpoint = "";
      let dataToSend = { ...formData };

      // Add default values and format data based on modal type to fix validation errors
      switch (modalType) {
        case "advance":
          endpoint = `${API_BASE_URL}/advances`;
          dataToSend = {
            ...formData,
            date: formData.date || new Date().toISOString().slice(0, 10),
            repayment_status: formData.repayment_status || 'pending'
          };
          break;
        case "penalty":
          endpoint = `${API_BASE_URL}/penalties`;
          dataToSend = {
            ...formData,
            date: formData.date || new Date().toISOString().slice(0, 10)
          };
          break;
        case "allowance":
          endpoint = `${API_BASE_URL}/allowances`;
          dataToSend = {
            ...formData,
            calculation_type: formData.calculation_type || 'fixed',
            payment_date: formData.payment_date || new Date().toISOString().slice(0, 10),
            // Ensure type is a valid allowance type
            type: formData.type || 'housing_allowance'
          };
          break;
        case "otherPayment":
          endpoint = `${API_BASE_URL}/other-payments`;
          dataToSend = {
            ...formData,
            calculation_type: formData.calculation_type || 'fixed',
            payment_date: formData.payment_date || new Date().toISOString().slice(0, 10),
            // Ensure type is a valid payment type
            type: formData.type || 'bonus'
          };
          break;
        case "custody":
          endpoint = `${API_BASE_URL}/custodies`;
          dataToSend = {
            ...formData,
            item_name: formData.item_name || 'عهدة',
            issue_date: formData.issue_date || new Date().toISOString().slice(0, 10)
          };
          break;
        case "attendance":
          endpoint = `${API_BASE_URL}/attendances`;
          // Format check_in and check_out to H:i format (24-hour time)
          let checkInTime = '';
          let checkOutTime = '';
          
          if (formData.check_in) {
            const checkInDate = new Date(formData.check_in);
            checkInTime = checkInDate.toTimeString().slice(0, 5); // HH:MM format
          } else {
            const now = new Date();
            checkInTime = now.toTimeString().slice(0, 5);
          }
          
          if (formData.check_out) {
            const checkOutDate = new Date(formData.check_out);
            checkOutTime = checkOutDate.toTimeString().slice(0, 5); // HH:MM format
          }
          
          dataToSend = {
            ...formData,
            check_in: checkInTime,
            check_out: checkOutTime || null,
            date: formData.date || new Date().toISOString().slice(0, 10)
          };
          break;
      }

      if (dataToSend.id) {
        await axios.put(`${endpoint}/${dataToSend.id}`, dataToSend, {
          headers: getAuthHeaders(),
        });
      } else {
        await axios.post(endpoint, dataToSend, {
          headers: getAuthHeaders(),
        });
      }

      setShowModal(false);
      setFormData({});

      // Refresh data
      fetchAdvances();
      fetchPenalties();
      fetchAllowances();
      fetchOtherPayments();
      fetchCustodies();
      fetchAttendances();
      fetchPayrollSummary();

      if (selectedEmployee) {
        fetchEmployeeSalaryDetails(selectedEmployee.id);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      // Show error message to user
      if (error.response && error.response.data && error.response.data.errors) {
        console.error("Validation errors:", error.response.data.errors);
        alert("خطأ في التحقق من البيانات: " + JSON.stringify(error.response.data.errors));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;

    try {
      let endpoint = "";
      switch (type) {
        case "advance":
          endpoint = `${API_BASE_URL}/advances`;
          break;
        case "penalty":
          endpoint = `${API_BASE_URL}/penalties`;
          break;
        case "allowance":
          endpoint = `${API_BASE_URL}/allowances`;
          break;
        case "otherPayment":
          endpoint = `${API_BASE_URL}/other-payments`;
          break;
        case "custody":
          endpoint = `${API_BASE_URL}/custodies`;
          break;
        case "attendance":
          endpoint = `${API_BASE_URL}/attendances`;
          break;
      }

      await axios.delete(`${endpoint}/${id}`, {
        headers: getAuthHeaders(),
      });

      // Refresh data
      fetchAdvances();
      fetchPenalties();
      fetchAllowances();
      fetchOtherPayments();
      fetchCustodies();
      fetchAttendances();
      fetchPayrollSummary();

      if (selectedEmployee) {
        fetchEmployeeSalaryDetails(selectedEmployee.id);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, item = {}) => {
    setModalType(type);
    // Initialize form data with default values based on type
    let initialFormData = { ...item };
    
    switch (type) {
      case "advance":
        initialFormData = {
          ...item,
          date: item.date || new Date().toISOString().slice(0, 10),
          repayment_status: item.repayment_status || 'pending'
        };
        break;
      case "allowance":
        initialFormData = {
          ...item,
          calculation_type: item.calculation_type || 'fixed',
          payment_date: item.payment_date || new Date().toISOString().slice(0, 10),
          type: item.type || 'housing_allowance'
        };
        break;
      case "otherPayment":
        initialFormData = {
          ...item,
          calculation_type: item.calculation_type || 'fixed',
          payment_date: item.payment_date || new Date().toISOString().slice(0, 10),
          type: item.type || 'bonus'
        };
        break;
      case "custody":
        initialFormData = {
          ...item,
          item_name: item.item_name || '',
          issue_date: item.issue_date || new Date().toISOString().slice(0, 10)
        };
        break;
      case "attendance":
        // Format datetime-local values for the form
        let checkInValue = '';
        let checkOutValue = '';
        
        if (item.check_in) {
          // If it's already in H:i format, convert to datetime-local
          if (item.check_in.includes(':') && !item.check_in.includes('T')) {
            const today = item.date || new Date().toISOString().slice(0, 10);
            checkInValue = `${today}T${item.check_in}`;
          } else {
            checkInValue = item.check_in;
          }
        } else {
          const now = new Date();
          checkInValue = now.toISOString().slice(0, 16);
        }
        
        if (item.check_out) {
          if (item.check_out.includes(':') && !item.check_out.includes('T')) {
            const today = item.date || new Date().toISOString().slice(0, 10);
            checkOutValue = `${today}T${item.check_out}`;
          } else {
            checkOutValue = item.check_out;
          }
        }
        
        initialFormData = {
          ...item,
          check_in: checkInValue,
          check_out: checkOutValue,
          date: item.date || new Date().toISOString().slice(0, 10)
        };
        break;
    }
    
    setFormData(initialFormData);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({});
    setShowModal(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الرواتب</h1>
        <p className="text-gray-600">إدارة السلف والجزاءات والبدلات</p>
      </div>
      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("summary")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "summary"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              ملخص الرواتب
            </button>
            <button
              onClick={() => setActiveTab("employees")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "employees"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              رواتب الموظفين
            </button>
            <button
              onClick={() => setActiveTab("advances")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "advances"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              السلف
            </button>
            <button
              onClick={() => setActiveTab("penalties")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "penalties"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              الجزاءات والخصومات
            </button>
            <button
              onClick={() => setActiveTab("allowances")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "allowances"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              البدلات
            </button>
            <button
              onClick={() => setActiveTab("otherPayments")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "otherPayments"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              مدفوعات أخرى
            </button>
            <button
              onClick={() => setActiveTab("custodies")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "custodies"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              العهد
            </button>
            <button
              onClick={() => setActiveTab("attendances")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "attendances"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              الحضور والانصراف
            </button>
          </nav>
        </div>
      </div>

      {/* Summary Tab */}
      {activeTab === "summary" && payrollSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">إجمالي الموظفين</h3>
            <p className="text-3xl font-bold text-blue-600">{payrollSummary.total_employees}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">إجمالي الرواتب الأساسية</h3>
            <p className="text-3xl font-bold text-green-600">{parseFloat(payrollSummary.total_basic_salary || '0').toLocaleString()} ريال</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">إجمالي البدلات</h3>
            <p className="text-3xl font-bold text-blue-600">{parseFloat(payrollSummary.total_allowances || '0').toLocaleString()} ريال</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">إجمالي الخصومات</h3>
            <p className="text-3xl font-bold text-red-600">{parseFloat(payrollSummary.total_deductions || '0').toLocaleString()} ريال</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">صافي الرواتب</h3>
            <p className="text-3xl font-bold text-green-600">{parseFloat(payrollSummary.total_net_salary || '0').toLocaleString()} ريال</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">متوسط الراتب</h3>
            <p className="text-3xl font-bold text-purple-600">{parseFloat(payrollSummary.average_net_salary || '0').toLocaleString()} ريال</p>
          </div>
        </div>
      )}

      {/* Employees Tab */}
      {activeTab === "employees" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">اختر موظف</h3>
            <div className="space-y-2">
              {employees.map((employee) => (
                <button
                  key={employee.id}
                  onClick={() => fetchEmployeeSalaryDetails(employee.id)}
                  className={`w-full text-right p-3 rounded-lg border ${
                    selectedEmployee?.id === employee.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium">{employee.name}</div>
                  <div className="text-sm text-gray-500">{employee.position}</div>
                </button>
              ))}
            </div>
          </div>

          {selectedEmployee && salaryDetails && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">تفاصيل راتب {selectedEmployee.name}</h3>
              <div className="space-y-2">
                <p><strong>الراتب الأساسي:</strong> {parseFloat(salaryDetails.data.basic_salary || '0').toLocaleString()} ريال</p>
                <p><strong>البدلات:</strong> {(parseFloat(salaryDetails.data.housing_allowance || '0') + parseFloat(salaryDetails.data.transportation_allowance || '0') + parseFloat(salaryDetails.data.commissions || '0') + parseFloat(salaryDetails.data.other_allowances || '0')).toLocaleString()} ريال</p>
                <p><strong>الخصومات:</strong> {parseFloat(salaryDetails.data.total_deductions || '0').toLocaleString()} ريال</p>
                <p><strong>صافي الراتب:</strong> {parseFloat(salaryDetails.data.total_salary || '0').toLocaleString()} ريال</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Advances Tab */}
      {activeTab === "advances" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">السلف</h2>
            <button
              onClick={() => openModal("advance")}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              إضافة سلفة جديدة
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الموظف</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ الإجمالي</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عدد أشهر التقسيط</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">القسط الشهري</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {advances.map((advance) => (
                  <tr key={advance.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {advance.employee?.name || 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parseFloat(advance.total_amount || '0').toLocaleString()} ريال
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {advance.installment_months || 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parseFloat(advance.monthly_installment || '0').toLocaleString()} ريال
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        advance.repayment_status === 'paid' ? 'bg-green-100 text-green-800' :
                        advance.repayment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {advance.repayment_status === 'paid' ? 'مسدد' :
                         advance.repayment_status === 'pending' ? 'معلق' : 'متأخر'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openModal("advance", advance)}
                        className="text-indigo-600 hover:text-indigo-900 ml-2"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete("advance", advance.id)}
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
        </div>
      )}

      {/* Penalties Tab */}
      {activeTab === "penalties" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">الجزاءات والخصومات</h2>
            <button
              onClick={() => openModal("penalty")}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              إضافة جزاء جديد
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الموظف</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نوع الجزاء</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">السبب</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {penalties.map((penalty) => (
                  <tr key={penalty.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {penalty.employee?.name || 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {penalty.type || 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parseFloat(penalty.amount || '0').toLocaleString()} ريال
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {penalty.reason || 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {penalty.date ? new Date(penalty.date).toLocaleDateString('ar-SA') : 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openModal("penalty", penalty)}
                        className="text-indigo-600 hover:text-indigo-900 ml-2"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete("penalty", penalty.id)}
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
        </div>
      )}

      {/* Allowances Tab */}
      {activeTab === "allowances" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">البدلات</h2>
            <button
              onClick={() => openModal("allowance")}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              إضافة بدل جديد
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الموظف</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نوع البدل</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نوع الحساب</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الدفع</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allowances.map((allowance) => (
                  <tr key={allowance.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {allowance.employee?.name || 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {allowance.type === 'housing_allowance' ? 'بدل سكن' :
                       allowance.type === 'transportation_allowance' ? 'بدل مواصلات' :
                       allowance.type === 'food_allowance' ? 'بدل طعام' :
                       allowance.type || 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parseFloat(allowance.amount || '0').toLocaleString()} ريال
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {allowance.calculation_type === 'fixed' ? 'ثابت' : 'متغير'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {allowance.payment_date ? new Date(allowance.payment_date).toLocaleDateString('ar-SA') : 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openModal("allowance", allowance)}
                        className="text-indigo-600 hover:text-indigo-900 ml-2"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete("allowance", allowance.id)}
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
        </div>
      )}

      {/* Other Payments Tab */}
      {activeTab === "otherPayments" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">مدفوعات أخرى</h2>
            <button
              onClick={() => openModal("otherPayment")}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
            >
              إضافة مدفوعة جديدة
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الموظف</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">النوع</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نوع الحساب</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الدفع</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {otherPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.employee?.name || 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.type === 'bonus' ? 'مكافأة' :
                       payment.type === 'commission' ? 'عمولة' :
                       payment.type === 'overtime' ? 'ساعات إضافية' :
                       payment.type || 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parseFloat(payment.amount || '0').toLocaleString()} ريال
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.calculation_type === 'fixed' ? 'ثابت' : 'متغير'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('ar-SA') : 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openModal("otherPayment", payment)}
                        className="text-indigo-600 hover:text-indigo-900 ml-2"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete("otherPayment", payment.id)}
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
        </div>
      )}

      {/* Custodies Tab */}
      {activeTab === "custodies" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">العهد</h2>
            <button
              onClick={() => openModal("custody")}
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
            >
              إضافة عهدة جديدة
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الموظف</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">اسم العهدة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">القيمة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الإصدار</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {custodies.map((custody) => (
                  <tr key={custody.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {custody.employee?.name || 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {custody.item_name || 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parseFloat(custody.value || '0').toLocaleString()} ريال
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {custody.issue_date ? new Date(custody.issue_date).toLocaleDateString('ar-SA') : 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        custody.status === 'returned' ? 'bg-green-100 text-green-800' :
                        custody.status === 'issued' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {custody.status === 'returned' ? 'مُرجعة' :
                         custody.status === 'issued' ? 'مُصدرة' : 'مفقودة'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openModal("custody", custody)}
                        className="text-indigo-600 hover:text-indigo-900 ml-2"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete("custody", custody.id)}
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
        </div>
      )}

      {/* Attendances Tab */}
      {activeTab === "attendances" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">الحضور والانصراف</h2>
            <button
              onClick={() => openModal("attendance")}
              className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
            >
              إضافة سجل حضور
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الموظف</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">وقت الحضور</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">وقت الانصراف</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ساعات العمل</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendances.map((attendance) => (
                  <tr key={attendance.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {attendance.employee?.name || 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {attendance.date ? new Date(attendance.date).toLocaleDateString('ar-SA') : 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {attendance.check_in || 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {attendance.check_out || 'لم ينصرف'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {attendance.total_hours || 'غير محسوب'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openModal("attendance", attendance)}
                        className="text-indigo-600 hover:text-indigo-900 ml-2"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete("attendance", attendance.id)}
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
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {modalType === "advance" && "إضافة/تعديل سلفة"}
                {modalType === "penalty" && "إضافة/تعديل جزاء"}
                {modalType === "allowance" && "إضافة/تعديل بدل"}
                {modalType === "otherPayment" && "إضافة/تعديل مدفوعة أخرى"}
                {modalType === "custody" && "إضافة/تعديل عهدة"}
                {modalType === "attendance" && "إضافة/تعديل حضور"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Employee Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الموظف</label>
                  <select
                    value={formData.employee_id || ""}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">اختر موظف</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Common fields based on modal type */}
                {(modalType === "advance" || modalType === "penalty") && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.amount || ""}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                      <input
                        type="date"
                        value={formData.date || ""}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </>
                )}

                {modalType === "advance" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">عدد أشهر التقسيط</label>
                      <input
                        type="number"
                        value={formData.installment_months || ""}
                        onChange={(e) => setFormData({ ...formData, installment_months: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">حالة السداد</label>
                      <select
                        value={formData.repayment_status || "pending"}
                        onChange={(e) => setFormData({ ...formData, repayment_status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="pending">معلق</option>
                        <option value="paid">مسدد</option>
                        <option value="overdue">متأخر</option>
                      </select>
                    </div>
                  </>
                )}

                {modalType === "penalty" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">نوع الجزاء</label>
                      <input
                        type="text"
                        value={formData.type || ""}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">السبب</label>
                      <textarea
                        value={formData.reason || ""}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                      />
                    </div>
                  </>
                )}

                {(modalType === "allowance" || modalType === "otherPayment") && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">النوع</label>
                      <select
                        value={formData.type || ""}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">اختر النوع</option>
                        {modalType === "allowance" ? (
                          <>
                            <option value="housing_allowance">بدل سكن</option>
                            <option value="transportation_allowance">بدل مواصلات</option>
                            <option value="food_allowance">بدل طعام</option>
                            <option value="other_allowance">بدل آخر</option>
                          </>
                        ) : (
                          <>
                            <option value="bonus">مكافأة</option>
                            <option value="commission">عمولة</option>
                            <option value="overtime">ساعات إضافية</option>
                            <option value="other">أخرى</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.amount || ""}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">نوع الحساب</label>
                      <select
                        value={formData.calculation_type || "fixed"}
                        onChange={(e) => setFormData({ ...formData, calculation_type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="fixed">ثابت</option>
                        <option value="percentage">نسبة مئوية</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الدفع</label>
                      <input
                        type="date"
                        value={formData.payment_date || ""}
                        onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </>
                )}

                {modalType === "custody" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">اسم العهدة</label>
                      <input
                        type="text"
                        value={formData.item_name || ""}
                        onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">القيمة</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.value || ""}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الإصدار</label>
                      <input
                        type="date"
                        value={formData.issue_date || ""}
                        onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                      <select
                        value={formData.status || "issued"}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="issued">مُصدرة</option>
                        <option value="returned">مُرجعة</option>
                        <option value="lost">مفقودة</option>
                      </select>
                    </div>
                  </>
                )}

                {modalType === "attendance" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                      <input
                        type="date"
                        value={formData.date || ""}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">وقت الحضور</label>
                      <input
                        type="datetime-local"
                        value={formData.check_in || ""}
                        onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">وقت الانصراف</label>
                      <input
                        type="datetime-local"
                        value={formData.check_out || ""}
                        onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "جاري الحفظ..." : "حفظ"}
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

export default Payroll;

