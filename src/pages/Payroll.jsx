import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://spl-pro.com/hr/api';

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
            <p className="text-3xl font-bold text-green-600">{payrollSummary.total_basic_salary.toLocaleString()} ريال</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">إجمالي البدلات</h3>
            <p className="text-3xl font-bold text-blue-600">{payrollSummary.total_allowances.toLocaleString()} ريال</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">إجمالي الخصومات</h3>
            <p className="text-3xl font-bold text-red-600">{payrollSummary.total_deductions.toLocaleString()} ريال</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">صافي الرواتب</h3>
            <p className="text-3xl font-bold text-green-600">{payrollSummary.total_net_salary.toLocaleString()} ريال</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">متوسط الراتب</h3>
            <p className="text-3xl font-bold text-purple-600">{Math.round(payrollSummary.average_net_salary).toLocaleString()} ريال</p>
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
                <p><strong>الراتب الأساسي:</strong> {salaryDetails.basic_salary.toLocaleString()} ريال</p>
                <p><strong>البدلات:</strong> {salaryDetails.total_allowances.toLocaleString()} ريال</p>
                <p><strong>الخصومات:</strong> {salaryDetails.total_deductions.toLocaleString()} ريال</p>
                <p><strong>صافي الراتب:</strong> {salaryDetails.net_salary.toLocaleString()} ريال</p>
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ المتبقي</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ البدء</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {advances.map((advance) => (
                  <tr key={advance.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{advance.employee?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{advance.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{advance.installment_months}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{advance.monthly_amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{advance.total_deducted}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{advance.amount - advance.total_deducted}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{advance.start_date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openModal("advance", advance)}
                        className="text-blue-600 hover:text-blue-900 ml-2"
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {penalties.map((penalty) => (
                  <tr key={penalty.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{penalty.employee?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{penalty.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{penalty.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{penalty.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openModal("penalty", penalty)}
                        className="text-blue-600 hover:text-blue-900 ml-2"
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allowances.map((allowance) => (
                  <tr key={allowance.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{allowance.employee?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{allowance.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{allowance.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{allowance.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openModal("allowance", allowance)}
                        className="text-blue-600 hover:text-blue-900 ml-2"
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
              إضافة مدفوعات أخرى
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {otherPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.employee?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openModal("otherPayment", payment)}
                        className="text-blue-600 hover:text-blue-900 ml-2"
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الوصف</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">القيمة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الاستلام</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {custodies.map((custody) => (
                  <tr key={custody.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{custody.employee?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{custody.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{custody.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{custody.value}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{custody.received_date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openModal("custody", custody)}
                        className="text-blue-600 hover:text-blue-900 ml-2"
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
              تسجيل حضور/انصراف
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التأخير (دقائق)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendances.map((attendance) => (
                  <tr key={attendance.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{attendance.employee?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attendance.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attendance.check_in_time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attendance.check_out_time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attendance.late_minutes}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openModal("attendance", attendance)}
                        className="text-blue-600 hover:text-blue-900 ml-2"
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

      {/* Modals */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-1/2" dir="rtl">
            <h2 className="text-2xl font-bold mb-4">
              {modalType === "advance"
                ? "إضافة / تعديل سلفة"
                : modalType === "penalty"
                ? "إضافة / تعديل جزاء"
                : modalType === "allowance"
                ? "إضافة / تعديل بدل"
                : modalType === "otherPayment"
                ? "إضافة / تعديل مدفوعات أخرى"
                : modalType === "custody"
                ? "إضافة / تعديل عهدة"
                : modalType === "attendance"
                ? "تسجيل حضور / انصراف"
                : ""}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="employee_id" className="block text-gray-700 text-sm font-bold mb-2">الموظف:</label>
                <select
                  id="employee_id"
                  name="employee_id"
                  value={formData.employee_id || ""}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">اختر موظف</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>{employee.name}</option>
                  ))}
                </select>
              </div>

              {modalType === "advance" && (
                <>
                  <div className="mb-4">
                    <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">المبلغ الإجمالي:</label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount || ""}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="installment_months" className="block text-gray-700 text-sm font-bold mb-2">عدد أشهر التقسيط:</label>
                    <input
                      type="number"
                      id="installment_months"
                      name="installment_months"
                      value={formData.installment_months || ""}
                      onChange={(e) => setFormData({ ...formData, installment_months: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="start_date" className="block text-gray-700 text-sm font-bold mb-2">تاريخ البدء:</label>
                    <input
                      type="date"
                      id="start_date"
                      name="start_date"
                      value={formData.start_date || ""}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                </>
              )}

              {modalType === "penalty" && (
                <>
                  <div className="mb-4">
                    <label htmlFor="type" className="block text-gray-700 text-sm font-bold mb-2">النوع:</label>
                    <input
                      type="text"
                      id="type"
                      name="type"
                      value={formData.type || ""}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">المبلغ:</label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount || ""}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">التاريخ:</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date || ""}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                </>
              )}

              {modalType === "allowance" && (
                <>
                  <div className="mb-4">
                    <label htmlFor="type" className="block text-gray-700 text-sm font-bold mb-2">النوع:</label>
                    <input
                      type="text"
                      id="type"
                      name="type"
                      value={formData.type || ""}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">المبلغ:</label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount || ""}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">التاريخ:</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date || ""}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                </>
              )}

              {modalType === "otherPayment" && (
                <>
                  <div className="mb-4">
                    <label htmlFor="type" className="block text-gray-700 text-sm font-bold mb-2">النوع:</label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type || ""}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    >
                      <option value="">اختر نوع المدفوعات</option>
                      <option value="تكلفة الإقامة">تكلفة الإقامة</option>
                      <option value="كارت عمل">كارت عمل</option>
                      <option value="تأمين طبي">تأمين طبي</option>
                      <option value="رسوم جوازات">رسوم جوازات</option>
                    </select>
                  </div>
                  {formData.type === "تكلفة الإقامة" && (
                    <div className="mb-4">
                      <label htmlFor="residency_type" className="block text-gray-700 text-sm font-bold mb-2">نوع الإقامة:</label>
                      <select
                        id="residency_type"
                        name="residency_type"
                        value={formData.residency_type || ""}
                        onChange={(e) => setFormData({ ...formData, residency_type: e.target.value })}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      >
                        <option value="">اختر نوع الإقامة</option>
                        <option value="3 أشهر">3 أشهر</option>
                        <option value="6 أشهر">6 أشهر</option>
                        <option value="9 أشهر">9 أشهر</option>
                        <option value="سنة">سنة</option>
                      </select>
                    </div>
                  )}
                  <div className="mb-4">
                    <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">المبلغ:</label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount || ""}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">التاريخ:</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date || ""}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                </>
              )}

              {modalType === "custody" && (
                <>
                  <div className="mb-4">
                    <label htmlFor="type" className="block text-gray-700 text-sm font-bold mb-2">النوع:</label>
                    <input
                      type="text"
                      id="type"
                      name="type"
                      value={formData.type || ""}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">الوصف:</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    ></textarea>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="value" className="block text-gray-700 text-sm font-bold mb-2">القيمة:</label>
                    <input
                      type="number"
                      id="value"
                      name="value"
                      value={formData.value || ""}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="received_date" className="block text-gray-700 text-sm font-bold mb-2">تاريخ الاستلام:</label>
                    <input
                      type="date"
                      id="received_date"
                      name="received_date"
                      value={formData.received_date || ""}
                      onChange={(e) => setFormData({ ...formData, received_date: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                </>
              )}

              {modalType === "attendance" && (
                <>
                  <div className="mb-4">
                    <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">التاريخ:</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date || ""}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="check_in_time" className="block text-gray-700 text-sm font-bold mb-2">وقت الدخول:</label>
                    <input
                      type="time"
                      id="check_in_time"
                      name="check_in_time"
                      value={formData.check_in_time || ""}
                      onChange={(e) => setFormData({ ...formData, check_in_time: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="check_out_time" className="block text-gray-700 text-sm font-bold mb-2">وقت الخروج:</label>
                    <input
                      type="time"
                      id="check_out_time"
                      name="check_out_time"
                      value={formData.check_out_time || ""}
                      onChange={(e) => setFormData({ ...formData, check_out_time: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 mr-2"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  حفظ
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


