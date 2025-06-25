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
      alert("حدث خطأ أثناء جلب تفاصيل راتب الموظف. يرجى المحاولة مرة أخرى.");
      setSalaryDetails(null); // Clear previous details on error
      setSelectedEmployee(null); // Clear selected employee on error
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
            // Ensure repayment_status is valid, 'pending' is a common default
            repayment_status: formData.repayment_status || 'pending',
            // Ensure installment_months is present and a number
            installment_months: parseInt(formData.installment_months) || 1 // Default to 1 if not provided
          };
          break;
        case "penalty":
          endpoint = `${API_BASE_URL}/penalties`;
          dataToSend = {
            ...formData,
            date: formData.date || new Date().toISOString().slice(0, 10),
            type: formData.type || 'خصم' // Added default type for penalty
          };
          break;
        case "allowance":
          endpoint = `${API_BASE_URL}/allowances`;
          dataToSend = {
            ...formData,
            calculation_type: formData.calculation_type || 'fixed',
            payment_date: formData.payment_date || new Date().toISOString().slice(0, 10),
            type: formData.type || 'housing_allowance'
          };
          break;
        case "otherPayment":
          endpoint = `${API_BASE_URL}/other-payments`;
          dataToSend = {
            ...formData,
            calculation_type: formData.calculation_type || 'fixed',
            payment_date: formData.payment_date || new Date().toISOString().slice(0, 10),
            type: formData.type || 'bonus' // Added default type for otherPayment
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
          const formatTime = (date) => {
            return date.toTimeString().slice(0, 5); // HH:MM
          };

          let checkInTime = '';
          let checkOutTime = '';
          
          if (formData.check_in) {
            const checkInDate = new Date(formData.check_in);
            checkInTime = formatTime(checkInDate);
          } else {
            checkInTime = formatTime(new Date());
          }
          
          if (formData.check_out) {
            const checkOutDate = new Date(formData.check_out);
            checkOutTime = formatTime(checkOutDate);
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
      if (error.response && error.response.data && error.response.data.errors) {
        console.error("Validation errors:", error.response.data.errors);
        alert("خطأ في التحقق من البيانات: " + JSON.stringify(error.response.data.errors));
      } else {
        alert("حدث خطأ غير متوقع أثناء إرسال البيانات.");
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
      alert("حدث خطأ أثناء حذف العنصر.");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, item = {}) => {
    setModalType(type);
    let initialFormData = { ...item };
    
    switch (type) {
      case "advance":
        initialFormData = {
          ...item,
          date: item.date || new Date().toISOString().slice(0, 10),
          repayment_status: item.repayment_status || 'pending',
          installment_months: item.installment_months || 1 // Default to 1 if not provided
        };
        break;
      case "penalty":
        initialFormData = {
          ...item,
          date: item.date || new Date().toISOString().slice(0, 10),
          type: item.type || 'خصم' // Default type for penalty
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
          type: item.type || 'bonus' // Default type for otherPayment
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
        let checkInValue = '';
        let checkOutValue = '';
        
        const formatToDateTimeLocal = (dateStr, timeStr) => {
          if (!dateStr || !timeStr) return '';
          return `${dateStr}T${timeStr}`;
        };

        if (item.check_in) {
          if (item.check_in.includes(':') && !item.check_in.includes('T')) {
            const today = item.date || new Date().toISOString().slice(0, 10);
            checkInValue = formatToDateTimeLocal(today, item.check_in);
          } else {
            checkInValue = item.check_in;
          }
        } else {
          const now = new Date();
          checkInValue = now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
        }
        
        if (item.check_out) {
          if (item.check_out.includes(':') && !item.check_out.includes('T')) {
            const today = item.date || new Date().toISOString().slice(0, 10);
            checkOutValue = formatToDateTimeLocal(today, item.check_out);
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
          {/* Summary content here */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800">إجمالي الرواتب</h2>
            <p className="text-2xl font-bold text-blue-600">{payrollSummary.totalSalaries} ر.س</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800">إجمالي السلف</h2>
            <p className="text-2xl font-bold text-red-600">{payrollSummary.totalAdvances} ر.س</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800">إجمالي الجزاءات</h2>
            <p className="text-2xl font-bold text-red-600">{payrollSummary.totalPenalties} ر.س</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800">إجمالي البدلات</h2>
            <p className="text-2xl font-bold text-green-600">{payrollSummary.totalAllowances} ر.س</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800">إجمالي المدفوعات الأخرى</h2>
            <p className="text-2xl font-bold text-green-600">{payrollSummary.totalOtherPayments} ر.س</p>
          </div>
        </div>
      )}

      {/* Employees Tab */}
      {activeTab === "employees" && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">رواتب الموظفين</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className="bg-white p-4 rounded-lg shadow cursor-pointer hover:bg-gray-100"
                onClick={() => fetchEmployeeSalaryDetails(employee.id)}
              >
                <h3 className="text-lg font-semibold text-gray-800">{employee.name}</h3>
                <p className="text-gray-600">{employee.position}</p>
              </div>
            ))}
          </div>

          {selectedEmployee && salaryDetails && (
            <div className="mt-8 bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold text-gray-800 mb-4">تفاصيل راتب {selectedEmployee.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p><strong>الراتب الأساسي:</strong> {salaryDetails.base_salary} ر.س</p>
                <p><strong>البدلات:</strong> {salaryDetails.total_allowances} ر.س</p>
                <p><strong>السلف:</strong> {salaryDetails.total_advances} ر.س</p>
                <p><strong>الجزاءات:</strong> {salaryDetails.total_penalties} ر.س</p>
                <p><strong>المدفوعات الأخرى:</strong> {salaryDetails.total_other_payments} ر.س</p>
                <p><strong>صافي الراتب:</strong> {salaryDetails.net_salary} ر.س</p>
              </div>
            </div>
          )}

          {loading && <p className="text-center mt-4">جاري التحميل...</p>}
        </div>
      )}

      {/* Advances Tab */}
      {activeTab === "advances" && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">السلف</h2>
          <button
            onClick={() => openModal("advance")}
            className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4 hover:bg-blue-600"
          >
            إضافة سلفة جديدة
          </button>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-2 px-4 text-right text-gray-600">الموظف</th>
                  <th className="py-2 px-4 text-right text-gray-600">المبلغ</th>
                  <th className="py-2 px-4 text-right text-gray-600">التاريخ</th>
                  <th className="py-2 px-4 text-right text-gray-600">حالة السداد</th>
                  <th className="py-2 px-4 text-right text-gray-600">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {advances.map((advance) => (
                  <tr key={advance.id} className="border-b border-gray-200 last:border-b-0">
                    <td className="py-2 px-4">{advance.employee_name}</td>
                    <td className="py-2 px-4">{advance.amount}</td>
                    <td className="py-2 px-4">{advance.date}</td>
                    <td className="py-2 px-4">{advance.repayment_status}</td>
                    <td className="py-2 px-4">
                      <button
                        onClick={() => openModal("advance", advance)}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete("advance", advance.id)}
                        className="text-red-600 hover:text-red-800"
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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">الجزاءات والخصومات</h2>
          <button
            onClick={() => openModal("penalty")}
            className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4 hover:bg-blue-600"
          >
            إضافة جزاء جديد
          </button>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-2 px-4 text-right text-gray-600">الموظف</th>
                  <th className="py-2 px-4 text-right text-gray-600">المبلغ</th>
                  <th className="py-2 px-4 text-right text-gray-600">التاريخ</th>
                  <th className="py-2 px-4 text-right text-gray-600">السبب</th>
                  <th className="py-2 px-4 text-right text-gray-600">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {penalties.map((penalty) => (
                  <tr key={penalty.id} className="border-b border-gray-200 last:border-b-0">
                    <td className="py-2 px-4">{penalty.employee_name}</td>
                    <td className="py-2 px-4">{penalty.amount}</td>
                    <td className="py-2 px-4">{penalty.date}</td>
                    <td className="py-2 px-4">{penalty.reason}</td>
                    <td className="py-2 px-4">
                      <button
                        onClick={() => openModal("penalty", penalty)}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete("penalty", penalty.id)}
                        className="text-red-600 hover:text-red-800"
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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">البدلات</h2>
          <button
            onClick={() => openModal("allowance")}
            className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4 hover:bg-blue-600"
          >
            إضافة بدل جديد
          </button>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-2 px-4 text-right text-gray-600">الموظف</th>
                  <th className="py-2 px-4 text-right text-gray-600">النوع</th>
                  <th className="py-2 px-4 text-right text-gray-600">المبلغ</th>
                  <th className="py-2 px-4 text-right text-gray-600">تاريخ الدفع</th>
                  <th className="py-2 px-4 text-right text-gray-600">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {allowances.map((allowance) => (
                  <tr key={allowance.id} className="border-b border-gray-200 last:border-b-0">
                    <td className="py-2 px-4">{allowance.employee_name}</td>
                    <td className="py-2 px-4">{allowance.type}</td>
                    <td className="py-2 px-4">{allowance.amount}</td>
                    <td className="py-2 px-4">{allowance.payment_date}</td>
                    <td className="py-2 px-4">
                      <button
                        onClick={() => openModal("allowance", allowance)}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete("allowance", allowance.id)}
                        className="text-red-600 hover:text-red-800"
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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">مدفوعات أخرى</h2>
          <button
            onClick={() => openModal("otherPayment")}
            className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4 hover:bg-blue-600"
          >
            إضافة دفعة أخرى
          </button>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-2 px-4 text-right text-gray-600">الموظف</th>
                  <th className="py-2 px-4 text-right text-gray-600">النوع</th>
                  <th className="py-2 px-4 text-right text-gray-600">المبلغ</th>
                  <th className="py-2 px-4 text-right text-gray-600">تاريخ الدفع</th>
                  <th className="py-2 px-4 text-right text-gray-600">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {otherPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-200 last:border-b-0">
                    <td className="py-2 px-4">{payment.employee_name}</td>
                    <td className="py-2 px-4">{payment.type}</td>
                    <td className="py-2 px-4">{payment.amount}</td>
                    <td className="py-2 px-4">{payment.payment_date}</td>
                    <td className="py-2 px-4">
                      <button
                        onClick={() => openModal("otherPayment", payment)}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete("otherPayment", payment.id)}
                        className="text-red-600 hover:text-red-800"
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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">العهد</h2>
          <button
            onClick={() => openModal("custody")}
            className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4 hover:bg-blue-600"
          >
            إضافة عهدة جديدة
          </button>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-2 px-4 text-right text-gray-600">الموظف</th>
                  <th className="py-2 px-4 text-right text-gray-600">اسم العهدة</th>
                  <th className="py-2 px-4 text-right text-gray-600">تاريخ الإصدار</th>
                  <th className="py-2 px-4 text-right text-gray-600">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {custodies.map((custody) => (
                  <tr key={custody.id} className="border-b border-gray-200 last:border-b-0">
                    <td className="py-2 px-4">{custody.employee_name}</td>
                    <td className="py-2 px-4">{custody.item_name}</td>
                    <td className="py-2 px-4">{custody.issue_date}</td>
                    <td className="py-2 px-4">
                      <button
                        onClick={() => openModal("custody", custody)}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete("custody", custody.id)}
                        className="text-red-600 hover:text-red-800"
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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">الحضور والانصراف</h2>
          <button
            onClick={() => openModal("attendance")}
            className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4 hover:bg-blue-600"
          >
            إضافة حضور/انصراف
          </button>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-2 px-4 text-right text-gray-600">الموظف</th>
                  <th className="py-2 px-4 text-right text-gray-600">التاريخ</th>
                  <th className="py-2 px-4 text-right text-gray-600">وقت الحضور</th>
                  <th className="py-2 px-4 text-right text-gray-600">وقت الانصراف</th>
                  <th className="py-2 px-4 text-right text-gray-600">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {attendances.map((attendance) => (
                  <tr key={attendance.id} className="border-b border-gray-200 last:border-b-0">
                    <td className="py-2 px-4">{attendance.employee_name}</td>
                    <td className="py-2 px-4">{attendance.date}</td>
                    <td className="py-2 px-4">{attendance.check_in}</td>
                    <td className="py-2 px-4">{attendance.check_out}</td>
                    <td className="py-2 px-4">
                      <button
                        onClick={() => openModal("attendance", attendance)}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete("attendance", attendance.id)}
                        className="text-red-600 hover:text-red-800"
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

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {modalType === "advance" && "إضافة / تعديل سلفة"}
              {modalType === "penalty" && "إضافة / تعديل جزاء"}
              {modalType === "allowance" && "إضافة / تعديل بدل"}
              {modalType === "otherPayment" && "إضافة / تعديل دفعة أخرى"}
              {modalType === "custody" && "إضافة / تعديل عهدة"}
              {modalType === "attendance" && "إضافة / تعديل حضور وانصراف"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="employee_id" className="block text-gray-700 text-sm font-bold mb-2">الموظف:</label>
                <select
                  id="employee_id"
                  name="employee_id"
                  value={formData.employee_id || ''}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">اختر موظف</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              {(modalType === "advance" || modalType === "penalty" || modalType === "allowance" || modalType === "otherPayment") && (
                <div className="mb-4">
                  <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">المبلغ:</label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
              )}

              {(modalType === "advance" || modalType === "penalty" || modalType === "custody") && (
                <div className="mb-4">
                  <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">التاريخ:</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date || new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
              )}

              {modalType === "advance" && (
                <>
                  <div className="mb-4">
                    <label htmlFor="repayment_status" className="block text-gray-700 text-sm font-bold mb-2">حالة السداد:</label>
                    <select
                      id="repayment_status"
                      name="repayment_status"
                      value={formData.repayment_status || 'pending'}
                      onChange={(e) => setFormData({ ...formData, repayment_status: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    >
                      <option value="pending">معلقة</option>
                      <option value="paid">مدفوعة</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="installment_months" className="block text-gray-700 text-sm font-bold mb-2">عدد أشهر التقسيط:</label>
                    <input
                      type="number"
                      id="installment_months"
                      name="installment_months"
                      value={formData.installment_months || 1} // Changed default to 1
                      onChange={(e) => setFormData({ ...formData, installment_months: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                </>
              )}

              {modalType === "penalty" && (
                <>
                  <div className="mb-4">
                    <label htmlFor="reason" className="block text-gray-700 text-sm font-bold mb-2">السبب:</label>
                    <input
                      type="text"
                      id="reason"
                      name="reason"
                      value={formData.reason || ''}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="type" className="block text-gray-700 text-sm font-bold mb-2">النوع:</label>
                    <input
                      type="text"
                      id="type"
                      name="type"
                      value={formData.type || 'خصم'} // Added default type for penalty
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                </>
              )}

              {(modalType === "allowance" || modalType === "otherPayment") && (
                <div className="mb-4">
                  <label htmlFor="type" className="block text-gray-700 text-sm font-bold mb-2">النوع:</label>
                  <input
                    type="text"
                    id="type"
                    name="type"
                    value={formData.type || ''}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
              )}

              {(modalType === "allowance" || modalType === "otherPayment") && (
                <div className="mb-4">
                  <label htmlFor="calculation_type" className="block text-gray-700 text-sm font-bold mb-2">نوع الحساب:</label>
                  <select
                    id="calculation_type"
                    name="calculation_type"
                    value={formData.calculation_type || 'fixed'}
                    onChange={(e) => setFormData({ ...formData, calculation_type: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="fixed">ثابت</option>
                    <option value="percentage">نسبة مئوية</option>
                  </select>
                </div>
              )}

              {(modalType === "allowance" || modalType === "otherPayment") && (
                <div className="mb-4">
                  <label htmlFor="payment_date" className="block text-gray-700 text-sm font-bold mb-2">تاريخ الدفع:</label>
                  <input
                    type="date"
                    id="payment_date"
                    name="payment_date"
                    value={formData.payment_date || new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
              )}

              {modalType === "custody" && (
                <div className="mb-4">
                  <label htmlFor="item_name" className="block text-gray-700 text-sm font-bold mb-2">اسم العهدة:</label>
                  <input
                    type="text"
                    id="item_name"
                    name="item_name"
                    value={formData.item_name || ''}
                    onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
              )}

              {modalType === "attendance" && (
                <>
                  <div className="mb-4">
                    <label htmlFor="attendance_date" className="block text-gray-700 text-sm font-bold mb-2">التاريخ:</label>
                    <input
                      type="date"
                      id="attendance_date"
                      name="date"
                      value={formData.date || new Date().toISOString().slice(0, 10)}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="check_in" className="block text-gray-700 text-sm font-bold mb-2">وقت الحضور:</label>
                    <input
                      type="datetime-local"
                      id="check_in"
                      name="check_in"
                      value={formData.check_in || new Date().toISOString().slice(0, 16)}
                      onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="check_out" className="block text-gray-700 text-sm font-bold mb-2">وقت الانصراف:</label>
                    <input
                      type="datetime-local"
                      id="check_out"
                      name="check_out"
                      value={formData.check_out || ''}
                      onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md mr-2 hover:bg-gray-400"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  disabled={loading}
                >
                  {loading ? "جاري الحفظ..." : "حفظ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;


