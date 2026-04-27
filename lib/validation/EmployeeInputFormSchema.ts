import { z } from 'zod';
import { VALIDATION_LABELS } from '@/lib/constants/employee';
import { formatValidationMessage } from '@/lib/constants/messages';

// Rule validate riêng cho account name ở mode add.
// Mode edit sẽ khóa field này
const employeeLoginIdSchema = z
  .string()
  .trim()
  .min(1, {
    message: formatValidationMessage('ER001', VALIDATION_LABELS.employeeLoginId),
  })
  .max(50, {
    message: formatValidationMessage('ER006', VALIDATION_LABELS.employeeLoginId, '50'),
  })
  .regex(/^[A-Za-z_][A-Za-z0-9_]*$/, {
    message: formatValidationMessage('ER019'),
  });

// Rule validate riêng cho password ở mode add.
// Password phải có độ dài từ 8 đến 50 ký tự.
// Mode edit sẽ khóa field này
const employeeLoginPasswordSchema = z
  .string()
  .min(1, {
    message: formatValidationMessage('ER001', VALIDATION_LABELS.employeeLoginPassword),
  })
  .refine((value) => value.length >= 8 && value.length <= 50, {
    message: formatValidationMessage(
      'ER007',
      VALIDATION_LABELS.employeeLoginPassword,
      '8',
      '50'
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
    .trim()
    .min(1, {
      message: formatValidationMessage('ER002', VALIDATION_LABELS.departmentId),
    }),

  // Tên nhân viên bắt buộc và tối đa 125 ký tự.
  employeeName: z
    .string()
    .trim()
    .min(1, {
      message: formatValidationMessage('ER001', VALIDATION_LABELS.employeeName),
    })
    .max(125, {
      message: formatValidationMessage('ER006', VALIDATION_LABELS.employeeName, '125'),
    }),

  // Tên katakana bắt buộc, tối đa 125 ký tự và chỉ cho phép ký tự half-width katakana.
  employeeNameKana: z
    .string()
    .trim()
    .min(1, {
      message: formatValidationMessage('ER001', VALIDATION_LABELS.employeeNameKana),
    })
    .max(125, {
      message: formatValidationMessage('ER006', VALIDATION_LABELS.employeeNameKana, '125'),
    })
    .regex(/^[\uFF66-\uFF9D\uFF9E\uFF9F]+$/, {
      message: formatValidationMessage('ER009', VALIDATION_LABELS.employeeNameKana),
    }),

  // Ngày sinh bắt buộc. DatePicker trả về Date hoặc null nên cần refine null.
  employeeBirthDate: z
    .date()
    .nullable()
    .refine((value) => value !== null, {
      message: formatValidationMessage('ER001', VALIDATION_LABELS.employeeBirthDate),
    }),

  // Email bắt buộc, tối đa 125 ký tự và đúng format email.
  employeeEmail: z
    .string()
    .trim()
    .min(1, {
      message: formatValidationMessage('ER001', VALIDATION_LABELS.employeeEmail),
    })
    .max(125, {
      message: formatValidationMessage('ER006', VALIDATION_LABELS.employeeEmail, '125'),
    })
    .email({
      message: formatValidationMessage('ER005', VALIDATION_LABELS.employeeEmail, 'xxx@xxx.xxx'),
    }),

  // Số điện thoại bắt buộc, tối đa 50 ký tự và chỉ cho phép ký tự ASCII nhìn thấy.
  employeeTelephone: z
    .string()
    .trim()
    .min(1, {
      message: formatValidationMessage('ER001', VALIDATION_LABELS.employeeTelephone),
    })
    .max(50, {
      message: formatValidationMessage('ER006', VALIDATION_LABELS.employeeTelephone, '50'),
    })
    .regex(/^[\x20-\x7E]+$/, {
      message: formatValidationMessage('ER008', VALIDATION_LABELS.employeeTelephone),
    }),

  // Password chỉ bắt buộc ở mode add. Mode edit khóa field này.
  employeeLoginPassword: isEditMode ? z.string() : employeeLoginPasswordSchema,

  // Confirm password chỉ bắt buộc ở mode add. Mode edit khóa field này.
  employeeLoginPasswordConfirm: isEditMode ? z.string() : z
    .string()
    .min(1, {
      message: formatValidationMessage(
        'ER001',
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
        message: formatValidationMessage('ER017'),
      });
    }
  })
  .superRefine((values, ctx) => {
    // Khi chưa chọn chứng chỉ thì bỏ qua toàn bộ rule liên quan.
    const hasCertification = values.certificationId.trim() !== '';

    if (!hasCertification) {
      return;
    }

    // ID chứng chỉ phải là số nguyên dương.
    if (!/^[1-9]\d*$/.test(values.certificationId.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['certificationId'],
        message: formatValidationMessage('ER018', VALIDATION_LABELS.certificationId),
      });
    }

    // Khi đã chọn chứng chỉ thì ngày cấp chứng chỉ là bắt buộc.
    if (values.certificationStartDate === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['certificationStartDate'],
        message: formatValidationMessage('ER001', VALIDATION_LABELS.certificationStartDate),
      });
    }

    // Khi đã chọn chứng chỉ thì ngày hết hạn là bắt buộc.
    if (values.certificationEndDate === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['certificationEndDate'],
        message: formatValidationMessage('ER001', VALIDATION_LABELS.certificationEndDate),
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
        message: formatValidationMessage('ER012'),
      });
    }

    // Khi đã chọn chứng chỉ thì điểm số là bắt buộc.
    if (values.score.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['score'],
        message: formatValidationMessage('ER001', VALIDATION_LABELS.score),
      });
    // Điểm số phải là số nguyên dương.
    } else if (!/^[1-9]\d*$/.test(values.score.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['score'],
        message: formatValidationMessage('ER018', VALIDATION_LABELS.score),
      });
    }
  });

// Schema mặc định cho mode add, giữ lại để các nơi import cũ vẫn dùng được.
export const employeeInputFormSchema = createEmployeeInputFormSchema();
