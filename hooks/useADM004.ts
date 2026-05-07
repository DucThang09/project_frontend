'use client';
/**
 * Copyright(C) 2026 Luvina Software Company
 * useADM004.ts, April 13, 2026 tdthang
 */
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
  EMPLOYEE_FORM_VALIDATION_MODES,
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
  isEmployeeAddSessionForRoute,
  loadEmployeeAdd,
  RestoreEmployeeAdd,
  saveEmployeeAdd,
  saveEmployeeConfirmData,
  toEmployeeAdd,
  toEmployeeConfirmData,
  toEmployeeFormValues,
  toEmployeeFormValuesFromDetail,
} from '@/lib/storage/EmployeeInputForm';
import { createEmployeeInputFormSchema } from '@/lib/validation/employees';
import type { CertificationDTO } from '@/types/certification';
import type { DepartmentDTO } from '@/types/department';
import type {
  ApiMessage,
  EmployeeFormValues,
  EmployeeValidationRequest,
} from '@/types/employee';

export interface OriginalCertification {
  certificationId: string;
  certificationStartDate: Date | null;
  certificationEndDate: Date | null;
  score: string;
}

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

const CERTIFICATION_DEPENDENT_FIELDS = [
  'certificationStartDate',
  'certificationEndDate',
  'score',
] as const;

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

function parseApiDate(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
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
  const [originalCertification, setOriginalCertification] =
    useState<OriginalCertification | null>(null);
  //Kiểm tra xem trong router xem có ID hợp lệ không  
  const employeeId = searchParams.get('employeeId');
  //Nếu tồn tại ID trong router thì xác định MH là edit, nếu không tồn tại ID trong router là MH add
  const mode = employeeId ? EMPLOYEE_MODE_EDIT : EMPLOYEE_MODE_ADD;
  // Kiểm tra xem có dữ liệu đã lưu nào trong sessionStorage để restore không, nếu có thì lấy dữ liệu đó để restore vào form, nếu không thì trả về null.
  const [restoreSession] = useState(() => {
    const isBackFromConfirm = RestoreEmployeeAdd();
    // Nếu có dữ liệu restore và dữ liệu đó phù hợp với route hiện tại (add thì không có ID, edit thì có ID trùng với ID trong router) thì trả về dữ liệu đó để restore, nếu không thì xóa dữ liệu restore và trả về null.
    return {
      isBackFromConfirm,
      employeeInfo: isBackFromConfirm ? loadEmployeeAdd() : null,
    };
  });

  // Khởi tạo react-hook-form cho màn ADM004.
  // validate thay đổi theo mode: nếu là edit thì bỏ validate account/password.
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(createEmployeeInputFormSchema(mode === EMPLOYEE_MODE_EDIT)),
    defaultValues: createEmployeeEmpty(),
    mode: EMPLOYEE_FORM_VALIDATION_MODES.validateMode,
    reValidateMode: EMPLOYEE_FORM_VALIDATION_MODES.reValidateMode,
  });

  const { reset, handleSubmit, setError, setValue, clearErrors, trigger, setFocus } =
    form;
  // Khi chuyển vào màn hình, nếu là mode edit thì focus vào dropdown phòng ban, nếu là mode add thì focus vào field login ID.
  useEffect(() => {
    // Nếu là mode edit thì focus vào dropdown phòng ban
    if (mode === EMPLOYEE_MODE_EDIT) {
      setFocus('departmentId');
      return;
    }
    // Nếu là mode add thì focus vào field login ID
    setFocus('employeeLoginId');
  }, [mode, setFocus]);

  /**
   * Khởi tạo dữ liệu cho màn hình ADM004.
   * Effect này tải master data, restore dữ liệu khi quay lại từ màn hình confirm,
   * hoặc lấy chi tiết nhân viên khi đang ở mode chỉnh sửa.
   */
  useEffect(() => {
    // Hàm tải dữ liệu master cho dropdown list.
    const fetchMasterData = async () => {
      //Gọi các API list departments, list cerfiticates  để binding data vào các dropdown list (có phần tử rỗng ở đầu)
      const [departmentResult, certificationResult] = await Promise.allSettled([
        getDepartments(),
        getCertifications(),
      ]);
      //TH API thành công thì binding data reponse của các API vào dropdown list
      if (
        departmentResult.status === 'fulfilled' &&
        certificationResult.status === 'fulfilled'
      ) {
        setDepartments(departmentResult.value);
        setCertifications(certificationResult.value);
      } else {
        setDepartments([]);
        setCertifications([]);
      }
    };

    // Tải dữ liệu chi tiết nhân viên nếu là mode chỉnh sửa, hoặc khôi phục dữ liệu form
    const loadFormData = async () => {
      // Nếu không phải quay lại từ ADM005 thì xử lý theo mode add/edit hiện tại.
      if (!restoreSession.isBackFromConfirm) {
        // Nếu là mode sửa thì lấy chi tiết nhân viên từ API để bind vào form.
        if (mode === EMPLOYEE_MODE_EDIT && employeeId) {
          // Nếu ID trong router không phải là chuỗi số hợp lệ thì chuyển sang màn hình system error.
          if (!/^\d+$/.test(employeeId)) {
            router.push('/employees/system-error');
            return;
          }
          // Nếu ID hợp lệ thì gọi API lấy chi tiết nhân viên và bind vào form, nếu có lỗi xảy ra trong quá trình gọi API hoặc dữ liệu trả về không hợp lệ
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
            // Lưu thông tin chứng chỉ gốc để so sánh khi validate nếu có thay đổi chứng chỉ.
            setOriginalCertification(
              response.employee.certificationId
                ? {
                  certificationId: String(response.employee.certificationId),
                  certificationStartDate: parseApiDate(
                    response.employee.certificationStartDate
                  ),
                  certificationEndDate: parseApiDate(
                    response.employee.certificationEndDate
                  ),
                  score:
                    response.employee.score != null
                      ? String(response.employee.score)
                      : '',
                }
                : null
            );
            return;
          } catch {
            // Lỗi gọi API thì xóa ID đang lưu và chuyển sang màn hình system error.
            router.push('/employees/system-error');
            return;
          }
        }
        // Nếu là mode thêm mới thì khởi tạo form rỗng.
        if (mode === EMPLOYEE_MODE_ADD) {
          setOriginalCertification(null);
          reset(createEmployeeEmpty());
          return;
        }
      } else {
        // Nếu quay lại từ ADM005 thì khôi phục dữ liệu form đã nhập trước đó.
        if (!isEmployeeAddSessionForRoute(restoreSession.employeeInfo, mode, employeeId)) {
          clearEmployeeAdd();
          router.push('/employees/system-error');
          return;
        }
        // Khôi phục dữ liệu form đã lưu trước đó và xóa dữ liệu trong sessionStorage sau khi khôi phục.
        setOriginalCertification(null);
        // Chuyển dữ liệu đã lưu sang format của form và bind vào form.
        reset(toEmployeeFormValues(restoreSession.employeeInfo));
        
        clearEmployeeAddRestore();
        return;
      }
    };
    fetchMasterData();
    loadFormData();
  }, [employeeId, mode, reset, restoreSession, router]);

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
    // Chuyển dữ liệu form sang format của payload validate API.
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
  // Các field phụ thuộc vào chứng chỉ sẽ được reset nếu chứng chỉ bị bỏ chọn hoặc thay đổi (ở mode edit).
  const clearCertificationDependentFields = () => {
    setValue('certificationStartDate', null);
    setValue('certificationEndDate', null);
    setValue('score', '');
  };
  // Handler khi thay đổi chứng chỉ, sẽ reset các field phụ thuộc nếu bỏ chọn chứng chỉ hoặc thay đổi chứng chỉ ở mode edit.
  const handleCertificationChange = async (selectedValue: string) => {
    // Nếu bỏ chọn chứng chỉ thì reset các field phụ thuộc và xóa lỗi liên quan đến chứng chỉ.
    if (selectedValue === '') {
      clearCertificationDependentFields();
      clearErrors(['certificationId', ...CERTIFICATION_DEPENDENT_FIELDS]);
      return;
    }
    // Nếu đang ở mode edit và chứng chỉ được chọn trùng với chứng chỉ gốc thì reset lại giá trị của các field phụ thuộc về giá trị gốc, đồng thời xóa lỗi liên quan đến các field này.
    if (
      mode === EMPLOYEE_MODE_EDIT &&
      originalCertification &&
      selectedValue === originalCertification.certificationId
    ) {
      setValue(
        'certificationStartDate',
        originalCertification.certificationStartDate
      );
      setValue('certificationEndDate', originalCertification.certificationEndDate);
      setValue('score', originalCertification.score);
      clearErrors(CERTIFICATION_DEPENDENT_FIELDS);
    } else if (mode === EMPLOYEE_MODE_EDIT) {
      clearCertificationDependentFields();
    }
    // Sau khi thay đổi chứng chỉ thì trigger validate cho các field phụ thuộc để cập nhật lỗi nếu có.
    await trigger(CERTIFICATION_DEPENDENT_FIELDS);
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
    // Lưu dữ liệu form vào sessionStorage
    saveEmployeeAdd(employeeInfo);
    // Chuyển sang màn hình confirm, nếu là edit thì gửi kèm ID qua router để load lại dữ liệu đã lưu, nếu là add load dữ liệu đã lưu mà không cần ID. 
    saveEmployeeConfirmData(toEmployeeConfirmData(employeeInfo));
    //TH edit: Di chuyển về MH confirm (gửi kèm ID qua router)
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
    } else {
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
    originalCertification,
    mode,
    employeeId,
    handleCertificationChange,
    handleConfirm,
    onBack,
  };
}
