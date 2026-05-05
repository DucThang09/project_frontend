/** Schema validate cho form nhập liệu nhân viên */
import { z } from 'zod';
import {
  EMPLOYEE_VALIDATION_FORMATS,
  EMPLOYEE_VALIDATION_LENGTHS,
  EMPLOYEE_VALIDATION_MESSAGE_CODES,
  VALIDATION_LABELS,
} from '@/lib/constants/employee';
import { formatValidationMessage } from '@/lib/constants/messages';

const {
  required,
  selectRequired,
  emailFormat,
  maxLength,
  passwordLength,
  telephoneFormat,
  kanaFormat,
  dateOrder,
  passwordConfirmMismatch,
  halfWidthNumber,
  loginIdFormat,
} = EMPLOYEE_VALIDATION_MESSAGE_CODES;

// Rule validate cho employeeLoginId ở mode add.
const employeeLoginIdSchema = z
  .string()
  // Loại bỏ khoảng trắng đầu/cuối để tránh lỗi validate khi người dùng nhập toàn khoảng trắng hoặc có khoảng trắng thừa ở đầu/cuối.
  .trim()
  // Kiểm tra không rỗng sau khi trim và tối đa 50 ký tự.
  .min(1, {
    message: formatValidationMessage(required, VALIDATION_LABELS.employeeLoginId),
  })
  // Kiểm tra tối đa 50 ký tự sau khi trim.
  .max(EMPLOYEE_VALIDATION_LENGTHS.loginIdMax, {
    message: formatValidationMessage(
      maxLength,
      VALIDATION_LABELS.employeeLoginId,
      String(EMPLOYEE_VALIDATION_LENGTHS.loginIdMax)
    ),
  })
  // Kiểm tra bắt đầu bằng chữ cái hoặc gạch dưới và chỉ chứa chữ cái, số và gạch dưới sau khi trim.
  .regex(/^[A-Za-z_][A-Za-z0-9_]*$/, {
    message: formatValidationMessage(loginIdFormat),
  });

// Rule validate riêng cho password ở mode add.
// Password phải có độ dài từ 8 đến 50 ký tự.
// Mode edit sẽ khóa field này
const employeeLoginPasswordSchema = z
  
  .string()
  // Loại bỏ khoảng trắng đầu/cuối để tránh lỗi validate khi người dùng nhập toàn khoảng trắng hoặc có khoảng trắng thừa ở đầu/cuối.
  .trim()
  // Kiểm tra không rỗng sau khi trim 
  .min(1, {
    message: formatValidationMessage(required, VALIDATION_LABELS.employeeLoginPassword),
  })
  // Kiểm tra tối đa 50 ký tự sau khi trim.
  .refine((value) => (
    value.length >= EMPLOYEE_VALIDATION_LENGTHS.passwordMin &&
    value.length <= EMPLOYEE_VALIDATION_LENGTHS.passwordMax
  ), {
    message: formatValidationMessage(
      passwordLength,
      VALIDATION_LABELS.employeeLoginPassword,
      String(EMPLOYEE_VALIDATION_LENGTHS.passwordMin),
      String(EMPLOYEE_VALIDATION_LENGTHS.passwordMax)
    ),
  });

/**
 * Tạo schema validate cho form ADM004.
 *
 * @param isEditMode true khi màn ADM004 đang ở mode chỉnh sửa.
 * @returns Zod schema tương ứng với mode add/edit.
 */
export const createEmployeeInputFormSchema = (isEditMode = false) => z.object({
  // Ở mode edit, account/password chỉ hiển thị dạng disabled nên không validate bắt buộc ở frontend.
  employeeLoginId: isEditMode ? z.string() : employeeLoginIdSchema,

  // Phòng ban bắt buộc phải được chọn.
  departmentId: z
    .string()
    // Loại bỏ khoảng trắng đầu/cuối để tránh lỗi validate khi người dùng nhập toàn khoảng trắng hoặc có khoảng trắng thừa ở đầu/cuối.
    .trim()
    // Kiểm tra không rỗng sau khi trim.
    .min(1, {
      message: formatValidationMessage(selectRequired, VALIDATION_LABELS.departmentId),
    }),

  // Tên nhân viên bắt buộc và tối đa 125 ký tự.
  employeeName: z
    .string()
    // Loại bỏ khoảng trắng đầu/cuối để tránh lỗi validate khi người dùng nhập toàn khoảng trắng hoặc có khoảng trắng thừa ở đầu/cuối.
    .trim()
    // Kiểm tra không rỗng sau khi trim 
    .min(1, {
      message: formatValidationMessage(required, VALIDATION_LABELS.employeeName),
    })
    // Kiểm tra tối đa 125 ký tự sau khi trim.
    .max(EMPLOYEE_VALIDATION_LENGTHS.employeeNameMax, {
      message: formatValidationMessage(
        maxLength,
        VALIDATION_LABELS.employeeName,
        String(EMPLOYEE_VALIDATION_LENGTHS.employeeNameMax)
      ),
    }),

  // Tên katakana bắt buộc, tối đa 125 ký tự và chỉ cho phép ký tự half-width katakana.
  employeeNameKana: z
    .string()
    // Loại bỏ khoảng trắng đầu/cuối để tránh lỗi validate khi người dùng nhập toàn khoảng trắng hoặc có khoảng trắng thừa ở đầu/cuối.
    .trim()
    // Kiểm tra không rỗng sau khi trim và tối đa 125 ký tự.
    .min(1, {
      message: formatValidationMessage(required, VALIDATION_LABELS.employeeNameKana),
    })
    // Kiểm tra tối đa 125 ký tự sau khi trim.
    .max(EMPLOYEE_VALIDATION_LENGTHS.employeeNameKanaMax, {
      message: formatValidationMessage(
        maxLength,
        VALIDATION_LABELS.employeeNameKana,
        String(EMPLOYEE_VALIDATION_LENGTHS.employeeNameKanaMax)
      ),
    })
    // Kiểm tra chỉ chứa ký tự half-width katakana sau khi trim.
    .regex(/^[\uFF66-\uFF9D\uFF9E\uFF9F]+$/, {
      message: formatValidationMessage(kanaFormat, VALIDATION_LABELS.employeeNameKana),
    }),

  // Ngày sinh bắt buộc. DatePicker trả về Date hoặc null nên cần refine null.
  employeeBirthDate: z
    .date()
    .nullable()
    .refine((value) => value !== null, {
      message: formatValidationMessage(required, VALIDATION_LABELS.employeeBirthDate),
    }),

  // Email bắt buộc, tối đa 125 ký tự và đúng format email.
  employeeEmail: z
    .string()
    // Loại bỏ khoảng trắng đầu/cuối để tránh lỗi validate khi người dùng nhập toàn khoảng trắng hoặc có khoảng trắng thừa ở đầu/cuối.
    .trim()
    // Kiểm tra không rỗng sau khi trim 
    .min(1, {
      message: formatValidationMessage(required, VALIDATION_LABELS.employeeEmail),
    })
    // Kiểm tra tối đa 125 ký tự sau khi trim.
    .max(EMPLOYEE_VALIDATION_LENGTHS.emailMax, {
      message: formatValidationMessage(
        maxLength,
        VALIDATION_LABELS.employeeEmail,
        String(EMPLOYEE_VALIDATION_LENGTHS.emailMax)
      ),
    })
    // Kiểm tra đúng định dạng email sau khi trim.
    .email({
      message: formatValidationMessage(
        emailFormat,
        VALIDATION_LABELS.employeeEmail,
        EMPLOYEE_VALIDATION_FORMATS.emailExample
      ),
    }),

  // Số điện thoại bắt buộc, tối đa 50 ký tự 
  employeeTelephone: z
    .string()
    // Loại bỏ khoảng trắng đầu/cuối để tránh lỗi validate khi người dùng nhập toàn khoảng trắng hoặc có khoảng trắng thừa ở đầu/cuối.
    .trim()
    // Kiểm tra không rỗng sau khi trim
    .min(1, {
      message: formatValidationMessage(required, VALIDATION_LABELS.employeeTelephone),
    })
    // Kiểm tra tối đa 50 ký tự sau khi trim.
    .max(EMPLOYEE_VALIDATION_LENGTHS.telephoneMax, {
      message: formatValidationMessage(
        maxLength,
        VALIDATION_LABELS.employeeTelephone,
        String(EMPLOYEE_VALIDATION_LENGTHS.telephoneMax)
      ),
    })
    // Kiểm tra chỉ chứa ký tự ASCII sau khi trim để tránh lỗi khi người dùng nhập số điện thoại bằng ký tự full-width.
    .regex(/^[\x20-\x7E]+$/, {
      message: formatValidationMessage(telephoneFormat, VALIDATION_LABELS.employeeTelephone),
    }),

  // Password chỉ bắt buộc ở mode add. Mode edit khóa field này.
  employeeLoginPassword: isEditMode ? z.string() : employeeLoginPasswordSchema,

  // Confirm password chỉ bắt buộc ở mode add. Mode edit khóa field này.
  employeeLoginPasswordConfirm: isEditMode ? z.string() : z
    .string()
    // Loại bỏ khoảng trắng đầu/cuối để tránh lỗi validate khi người dùng nhập toàn khoảng trắng hoặc có khoảng trắng thừa ở đầu/cuối.
    .trim()
    // Kiểm tra không rỗng sau khi trim
    .min(1, {
      message: formatValidationMessage(
        required,
        VALIDATION_LABELS.employeeLoginPasswordConfirm
      ),
    }),

  // Nhóm chứng chỉ được kiểm tra chi tiết ở superRefine bên dưới.
  certificationId: z.string(),
  certificationStartDate: z.date().nullable(),
  certificationEndDate: z.date().nullable(),
  score: z.string(),
})
  .superRefine((values, ctx) => {
    // Kiểm tra password và confirm password phải giống nhau ở mode add.
    // Ở mode edit hai field này bị khóa và rỗng nên điều kiện này không phát sinh lỗi.
    if (
      values.employeeLoginPasswordConfirm.length > 0 &&
      values.employeeLoginPassword !== values.employeeLoginPasswordConfirm
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['employeeLoginPasswordConfirm'],
        message: formatValidationMessage(passwordConfirmMismatch),
      });
    }
  })
  .superRefine((values, ctx) => {
    // Khi chưa chọn chứng chỉ thì bỏ qua toàn bộ rule liên quan.
    const hasCertification = values.certificationId.trim() !== '';
    // Nếu không có chứng chỉ nào được chọn thì không cần validate các trường liên quan đến chứng chỉ.
    if (!hasCertification) {
      return;
    }

    // ID chứng chỉ phải là số nguyên dương.
    if (!/^[1-9]\d*$/.test(values.certificationId.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['certificationId'],
        message: formatValidationMessage(halfWidthNumber, VALIDATION_LABELS.certificationId),
      });
    }

    // Khi đã chọn chứng chỉ thì ngày cấp chứng chỉ là bắt buộc.
    if (values.certificationStartDate === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['certificationStartDate'],
        message: formatValidationMessage(required, VALIDATION_LABELS.certificationStartDate),
      });
    }

    // Khi đã chọn chứng chỉ thì ngày hết hạn là bắt buộc.
    if (values.certificationEndDate === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['certificationEndDate'],
        message: formatValidationMessage(required, VALIDATION_LABELS.certificationEndDate),
      });
    }

    // Ngày hết hạn không được nhỏ hơn ngày cấp.
    if (
      values.certificationStartDate !== null &&
      values.certificationEndDate !== null &&
      values.certificationEndDate < values.certificationStartDate
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['certificationEndDate'],
        message: formatValidationMessage(dateOrder),
      });
    }

    // Khi đã chọn chứng chỉ thì điểm số là bắt buộc.
    if (values.score.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['score'],
        message: formatValidationMessage(required, VALIDATION_LABELS.score),
      });
    // Điểm số phải là số nguyên dương.
    } else if (!/^[1-9]\d*$/.test(values.score.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['score'],
        message: formatValidationMessage(halfWidthNumber, VALIDATION_LABELS.score),
      });
    }
  });

// Schema mặc định cho mode add, giữ lại để các nơi import cũ vẫn dùng được.
export const employeeInputFormSchema = createEmployeeInputFormSchema();
