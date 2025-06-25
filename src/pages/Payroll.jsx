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
      switch (modalType) {
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

      if (formData.id) {
        await axios.put(`${endpoint}/${formData.id}`, formData, {
          headers: getAuthHeaders(),
        });
      } else {
        await axios.post(endpoint, formData, {
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
      fetchPayrollSummary();

      if (selectedEmployee) {
        fetchEmployeeSalaryDetails(selectedEmployee.id);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
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
    setFormData(item);
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
            <p className="text-3xl font-bold text-green-600">{parseFloat(payrollSummary.total_basic_salary).toLocaleString()} ريال</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">إجمالي البدلات</h3>
            <p className="text-3xl font-bold text-blue-600">{parseFloat(payrollSummary.total_allowances).toLocaleString()} ريال</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">إجمالي الخصومات</h3>
            <p className="text-3xl font-bold text-red-600">{parseFloat(payrollSummary.total_deductions).toLocaleString()} ريال</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">صافي الرواتب</h3>
            <p className="text-3xl font-bold text-green-600">{parseFloat(payrollSummary.total_net_salary).toLocaleString()} ريال</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">متوسط الراتب</h3>
            <p className="text-3xl font-bold text-purple-600">{parseFloat(payrollSummary.average_net_salary).toLocaleString()} ريال</p>
          </div>ocaleString()} ريال</p>
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
                           <p><strong>الراتب الأساسي:</strong> {parseFloat(salaryDetails.data.basic_salary).toLocaleString()} ريال</p>ال</p>
                <p><strong>البدلات:</strong> {(parseFloat(salaryDetails.data.housing_allowance || '0') + parseFloat(salaryDetails.data.transportation_allowance || '0') + parseFloat(salaryDetails.data.commissions || '0') + parseFloat(salaryDetails.data.other_allowances || '0')).toLocaleString()} ريال</p>
                <p><strong>الخصومات:</strong> {parseFloat(salaryDetails.data.total_deductions || '0').toLocaleString()} ريال</p>
                <p><strong>صافي الراتب:</strong> {parseFloat(salaryDetails.data.total_salary).toLocaleString()} ريال</p>
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ الشهري</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ المخصوم</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المتبقي</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {advances.map((advance) => (
                  <tr key={advance.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{advance.employee_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parseFloat(advance.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{advance.installments}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parseFloat(advance.monthly_amount).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parseFloat(advance.deducted_amount).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parseFloat(advance.remaining_amount).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{advance.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              إضافة جزاء جديد
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الموظف</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">النوع</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">السبب</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {penalties.map((penalty) => (
                  <tr key={penalty.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{penalty.employee_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{penalty.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parseFloat(penalty.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(penalty.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{penalty.reason}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              إضافة بدل جديد
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الموظف</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">النوع</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الوصف</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allowances.map((allowance) => (
                  <tr key={allowance.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{allowance.employee_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{allowance.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parseFloat(allowance.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(allowance.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{allowance.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              إضافة دفعة أخرى
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الموظف</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">النوع</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الوصف</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {otherPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.employee_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parseFloat(payment.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(payment.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              إضافة عهدة جديدة
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الموظف</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">النوع</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الوصف</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {custodies.map((custody) => (
                  <tr key={custody.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{custody.employee_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{custody.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parseFloat(custody.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(custody.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{custody.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">وقت الدخول</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">وقت الخروج</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendances.map((attendance) => (
                  <tr key={attendance.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{attendance.employee_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(attendance.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attendance.check_in_time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attendance.check_out_time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit} className="p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                  {modalType === "advance" && "إضافة / تعديل سلفة"}
                  {modalType === "penalty" && "إضافة / تعديل جزاء"
                  }
                  {modalType === "allowance" && "إضافة / تعديل بدل"}
                  {modalType === "otherPayment" && "إضافة / تعديل دفعة أخرى"}
                  {modalType === "custody" && "إضافة / تعديل عهدة"}
                  {modalType === "attendance" && "إضافة / تعديل سجل حضور"}
                </h3>
                <div className="space-y-4">
                  {/* Employee Select */}
                  <div className="col-span-full">
                    <label htmlFor="employee_id" className="block text-sm font-medium leading-6 text-gray-900">الموظف</label>
                    <div className="mt-2">
                      <select
                        id="employee_id"
                        name="employee_id"
                        value={formData.employee_id || ""}
                        onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      >
                        <option value="">اختر موظف</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Fields based on modalType */}
                  {(modalType === "advance" || modalType === "penalty" || modalType === "allowance" || modalType === "otherPayment" || modalType === "custody") && (
                    <div className="col-span-full">
                      <label htmlFor="amount" className="block text-sm font-medium leading-6 text-gray-900">المبلغ</label>
                      <div className="mt-2">
                        <input
                          type="number"
                          id="amount"
                          name="amount"
                          value={formData.amount || ""}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>
                  )}

                  {(modalType === "advance") && (
                    <div className="col-span-full">
                      <label htmlFor="installments" className="block text-sm font-medium leading-6 text-gray-900">عدد أشهر التقسيط</label>
                      <div className="mt-2">
                        <input
                          type="number"
                          id="installments"
                          name="installments"
                          value={formData.installments || ""}
                          onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>
                  )}

                  {(modalType === "penalty" || modalType === "allowance" || modalType === "otherPayment" || modalType === "custody") && (
                    <div className="col-span-full">
                      <label htmlFor="date" className="block text-sm font-medium leading-6 text-gray-900">التاريخ</label>
                      <div className="mt-2">
                        <input
                          type="date"
                          id="date"
                          name="date"
                          value={formData.date || ""}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>
                  )}

                  {(modalType === "penalty" || modalType === "allowance" || modalType === "otherPayment" || modalType === "custody") && (
                    <div className="col-span-full">
                      <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">الوصف / السبب</label>
                      <div className="mt-2">
                        <textarea
                          id="description"
                          name="description"
                          rows="3"
                          value={formData.description || ""}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        ></textarea>
                      </div>
                    </div>
                  )}

                  {modalType === "attendance" && (
                    <>
                      <div className="col-span-full">
                        <label htmlFor="date" className="block text-sm font-medium leading-6 text-gray-900">التاريخ</label>
                        <div className="mt-2">
                          <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date || ""}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>
                      <div className="col-span-full">
                        <label htmlFor="check_in_time" className="block text-sm font-medium leading-6 text-gray-900">وقت الدخول</label>
                        <div className="mt-2">
                          <input
                            type="time"
                            id="check_in_time"
                            name="check_in_time"
                            value={formData.check_in_time || ""}
                            onChange={(e) => setFormData({ ...formData, check_in_time: e.target.value })}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>
                      <div className="col-span-full">
                        <label htmlFor="check_out_time" className="block text-sm font-medium leading-6 text-gray-900">وقت الخروج</label>
                        <div className="mt-2">
                          <input
                            type="time"
                            id="check_out_time"
                            name="check_out_time"
                            value={formData.check_out_time || ""}
                            onChange={(e) => setFormData({ ...formData, check_out_time: e.target.value })}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="submit"
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                    disabled={loading}
                  >
                    {loading ? "جاري الحفظ..." : "حفظ"}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                    onClick={resetForm}
                  >
                    إلغاء
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


