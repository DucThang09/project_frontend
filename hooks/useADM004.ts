'use client';
//Comment đầu file
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { getCertifications } from '@/lib/api/certification.api';
import { getDepartments } from '@/lib/api/department.api';
import {
  getEmployeeDetail,
  validateEmployeeInput,
} from '@/lib/api/employee.api';
import {
  EMPLOYEE_MODE_ADD,
  EMPLOYEE_MODE_EDIT,
  HTTP_STATUS_OK,
  VALIDATION_LABELS,
} from '@/lib/constants/employee';
import {
  VALIDATION_MESSAGES,
  type ValidationMessageCode,
  formatValidationMessage,
} from '@/lib/constants/messages';
import {
  clearEmployeeAdd,
  clearEmployeeAddRestore,
  loadEmployeeAdd,
  RestoreEmployeeAdd,
  saveEmployeeAdd,
  saveEmployeeConfirmData,
  toEmployeeAdd,
  toEmployeeConfirmData,
  toEmployeeFormValues,
  toEmployeeFormValuesFromDetail,
} from '@/lib/storage/EmployeeInputForm';
import { createEmployeeInputFormSchema } from '@/lib/validation/EmployeeInputFormSchema';
import type { CertificationDTO } from '@/types/certification';
import type { DepartmentDTO } from '@/types/department';
import type {
  ApiMessage,
  EmployeeFormValues,
  EmployeeValidationRequest,
} from '@/types/employee';

// Map label lỗi từ backend sang tên field trong form để set lỗi đúng vị trí.
const LABEL_TO_FIELD: Partial<Record<string, keyof EmployeeFormValues>> = {
  [VALIDATION_LABELS.employeeLoginId]: 'employeeLoginId',
  [VALIDATION_LABELS.departmentId]: 'departmentId',
  [VALIDATION_LABELS.employeeName]: 'employeeName',
  [VALIDATION_LABELS.employeeNameKana]: 'employeeNameKana',
  [VALIDATION_LABELS.employeeBirthDate]: 'employeeBirthDate',
  [VALIDATION_LABELS.employeeEmail]: 'employeeEmail',
  [VALIDATION_LABELS.employeeTelephone]: 'employeeTelephone',
  [VALIDATION_LABELS.employeeLoginPassword]: 'employeeLoginPassword',
  [VALIDATION_LABELS.employeeLoginPasswordConfirm]:
    'employeeLoginPasswordConfirm',
  [VALIDATION_LABELS.certificationId]: 'certificationId',
  [VALIDATION_LABELS.certificationStartDate]: 'certificationStartDate',
  [VALIDATION_LABELS.certificationEndDate]: 'certificationEndDate',
  [VALIDATION_LABELS.score]: 'score',
};

/**
 * Tạo giá trị mặc định rỗng cho form thêm mới nhân viên.
 *
 * @returns Dữ liệu form nhân viên ở trạng thái ban đầu.
 */
export function createEmployeeEmpty(): EmployeeFormValues {
  return {
    employeeLoginId: '',
    departmentId: '',
    employeeName: '',
    employeeNameKana: '',
    employeeBirthDate: null,
    employeeEmail: '',
    employeeTelephone: '',
    employeeLoginPassword: '',
    employeeLoginPasswordConfirm: '',
    certificationId: '',
    certificationStartDate: null,
    certificationEndDate: null,
    score: '',
  };
}

/**
 * Quản lý dữ liệu màn hình thêm/sửa nhân viên ADM004.
 *
 * @returns Toàn bộ form state, dữ liệu master, mode xử lý và các handler của màn hình.
 */
export function useADM004() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);
  const [certifications, setCertifications] = useState<CertificationDTO[]>([]);
  //Kiểm tra xem trong router xem có ID hợp lệ không  
  const employeeId = searchParams.get('employeeId');
  //Nếu tồn tại ID trong router thì xác định MH là edit, nếu không tồn tại ID trong router là MH add
  const mode = employeeId ? EMPLOYEE_MODE_EDIT : EMPLOYEE_MODE_ADD;

  // Khởi tạo react-hook-form cho màn ADM004.
  // validate thay đổi theo mode: nếu là edit thì bỏ validate account/password.
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(createEmployeeInputFormSchema(mode === EMPLOYEE_MODE_EDIT)),
    defaultValues: createEmployeeEmpty(),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });
  const { reset, handleSubmit, setError } = form;

  /**
   * Khởi tạo dữ liệu cho màn hình ADM004.
   * Effect này tải master data, restore dữ liệu khi quay lại từ màn hình confirm,
   * hoặc lấy chi tiết nhân viên khi đang ở mode chỉnh sửa.
   */
  useEffect(() => {
    const fetchMasterData = async () => {
      // `- Gọi các API list departments, list cerfiticates  để binding data vào các dropdown list (có phần tử rỗng ở đầu)
      const [departmentResult, certificationResult] = await Promise.allSettled([
        getDepartments(),
        getCertifications(),
      ]);
       // TH API thành công thì binding data reponse của các API vào dropdown list
      if (departmentResult.status === 'fulfilled') {
        setDepartments(departmentResult.value);
      } else {
        setDepartments([]);
      }
      // TH API thành công thì binding data reponse của các API vào dropdown list
      if (certificationResult.status === 'fulfilled') {
        setCertifications(certificationResult.value);
      } else {
        setCertifications([]);
      }
    };

    //lấy dữ liệu form đã lưu trong sessionStorage 
    const employeeInfo = loadEmployeeAdd();
    // cho biết người dùng đang quay lại ADM004 từ màn confirm.
    const isBackFromConfirm = RestoreEmployeeAdd();
    // Tải dữ liệu chi tiết nhân viên nếu là mode chỉnh sửa, hoặc khôi phục dữ liệu form(sửa lại để mapping với TKMH)
    const loadFormData = async () => {
      // Nếu không phải quay lại từ ADM005 thì xử lý theo mode add/edit hiện tại.
      if (!isBackFromConfirm) {
        // Nếu là mode sửa thì lấy chi tiết nhân viên từ API để bind vào form.
        if (mode === EMPLOYEE_MODE_EDIT && employeeId) {
          if (!/^\d+$/.test(employeeId)) {
            router.push('/employees/system-error');
            return;
          }

          try {
            // Gọi API lấy thông tin chi tiết nhân viên cần sửa.
            const response = await getEmployeeDetail(employeeId);
            // API lỗi hoặc không trả về nhân viên thì chuyển sang màn hình system error.
            if (response.code !== HTTP_STATUS_OK || !response.employee) {
              router.push('/employees/system-error');
              return;
            }
            // Chuyển dữ liệu chi tiết từ API sang format của form và bind vào form.
            reset(toEmployeeFormValuesFromDetail(response.employee));
            return;
          } catch {
            // Lỗi gọi API thì xóa ID đang lưu và chuyển sang màn hình system error.
            router.push('/employees/system-error');
            return;
          }
        }
        // Nếu là mode thêm mới thì khởi tạo form rỗng.
        if (mode === EMPLOYEE_MODE_ADD) {
          reset(createEmployeeEmpty());
          return;
        }
      } else {
        // Nếu quay lại từ ADM005 thì khôi phục dữ liệu form đã nhập trước đó.
        if (employeeInfo) {
          reset(toEmployeeFormValues(employeeInfo));
          clearEmployeeAddRestore();
          return;
        }
      }
    };
    fetchMasterData();
    loadFormData();
  }, [employeeId, mode, reset, router]);

  /**
   * Format message lỗi trả về từ backend theo nội dung hiển thị của hệ thống.
   *
   * @param message Message lỗi backend trả về.
   * @returns Chuỗi message đã format.
   */
  const formatBackendMessage = (message: ApiMessage | undefined) => {
    if (!message || !(message.code in VALIDATION_MESSAGES)) {
      return formatValidationMessage('ER023');
    }

    return formatValidationMessage(
      message.code as ValidationMessageCode,
      ...message.params
    );
  };

  /**
   * Áp dụng lỗi validate từ backend vào form.
   *
   * @param message Message lỗi backend trả về.
   */
  const applyBackendValidationError = (message: ApiMessage | undefined) => {
    if (!message) {
      return;
    }

    const formattedMessage = formatBackendMessage(message);

    // Các lỗi chung không gắn với field cụ thể thì không hiển thị trên ADM004.
    if (message.code === 'ER003' || message.code === 'ER004') {
      return;
    }

    // Lỗi ngày hết hạn chứng chỉ thì gắn vào field ngày hết hạn.
    if (message.code === 'ER012') {
      setError('certificationEndDate', {
        type: 'server',
        message: formattedMessage,
      });
      return;
    }

    // Lỗi xác nhận mật khẩu thì gắn vào field xác nhận mật khẩu.
    if (message.code === 'ER017') {
      setError('employeeLoginPasswordConfirm', {
        type: 'server',
        message: formattedMessage,
      });
      return;
    }

    // Các lỗi còn lại được map từ label backend sang field tương ứng trên form.
    const field = message.params[0]
      ? LABEL_TO_FIELD[message.params[0]]
      : undefined;

    if (field) {
      setError(field, {
        type: 'server',
        message: formattedMessage,
      });
      return;
    }
  };

  /**
   * Chuyển dữ liệu form hiện tại sang payload gửi API validate.
   *
   * @param values Giá trị hiện tại của form.
   * @returns Payload validate nhân viên gửi backend.
   */
  const toEmployeeValidationRequest = (
    values: EmployeeFormValues
  ): EmployeeValidationRequest => {
    // Chuẩn hóa dữ liệu form theo mode thêm/sửa và dữ liệu master đã tải.
    const employeeInfo = toEmployeeAdd(
      values,
      departments,
      certifications,
      mode,
      employeeId
    );

    return {
      employeeId: employeeInfo.employeeId || undefined,
      employeeLoginId: employeeInfo.employeeLoginId,
      departmentId: employeeInfo.departmentId,
      employeeName: employeeInfo.employeeName,
      employeeNameKana: employeeInfo.employeeNameKana,
      employeeBirthDate: employeeInfo.employeeBirthDate,
      employeeEmail: employeeInfo.employeeEmail,
      employeeTelephone: employeeInfo.employeeTelephone,
      employeeLoginPassword: employeeInfo.employeeLoginPassword,
      employeeLoginPasswordConfirm: employeeInfo.employeeLoginPasswordConfirm,
      certificationId: employeeInfo.certificationId,
      certificationStartDate: employeeInfo.certificationStartDate,
      certificationEndDate: employeeInfo.certificationEndDate,
      score: employeeInfo.score,
    };
  };

  /**
   * Validate dữ liệu form với backend, lưu dữ liệu và chuyển sang ADM005.
   */
  const handleConfirm = handleSubmit(async (values) => {
    // Gọi API validate dữ liệu trước khi cho phép chuyển sang màn confirm.
    const validatePayload = toEmployeeValidationRequest(values);
    const response = await validateEmployeeInput(validatePayload);

    // Backend trả lỗi thì hiển thị lỗi lên form và không chuyển màn.
    if (response.code !== HTTP_STATUS_OK) {
      applyBackendValidationError(response.message);
      return;
    }
    //validate thành công thì lưu dữ liệu form vào sessionStorage
    const employeeInfo = toEmployeeAdd(
      values,
      departments,
      certifications,
      mode,
      employeeId
    );
    saveEmployeeAdd(employeeInfo);
    saveEmployeeConfirmData(toEmployeeConfirmData(employeeInfo));
    if (mode === EMPLOYEE_MODE_EDIT && employeeId) {
      router.push(`/employees/adm005?employeeId=${employeeId}`);
      return;
    }

    router.push('/employees/adm005');
  });

  /**
   * Quay lại màn hình trước đó theo mode hiện tại.
   * Add mode quay về ADM002, edit mode quay về ADM003.
   */
  const onBack = () => {
    if (mode === EMPLOYEE_MODE_EDIT) {
      //TH edit: Di chuyển về MH view chi tiết (gửi kèm ID qua router)
      router.push(`/employees/adm003?employeeId=${employeeId}`);
      return;
    }else{
      //TH add mới: Từ màn add về adm002 thì xóa dữ liệu đã lưu trong sessionStorage
      clearEmployeeAdd();
      router.push('/employees/adm002');
    }
  };

  /**
   * Trả về form state, dữ liệu master, mode và handler cho component ADM004.
   */
  return {
    ...form,
    departments,
    certifications,
    mode,
    employeeId,
    handleConfirm,
    onBack,
  };
}
