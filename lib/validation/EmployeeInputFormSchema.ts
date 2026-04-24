import { z } from 'zod';
import { VALIDATION_LABELS } from '@/lib/constants/employee';
import { formatValidationMessage } from '@/lib/constants/messages';

export const employeeInputFormSchema = z.object({
  employeeLoginId: z
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
    }),

  departmentId: z
    .string()
    .trim()
    .min(1, {
      message: formatValidationMessage('ER002', VALIDATION_LABELS.departmentId),
    }),

  employeeName: z
    .string()
    .trim()
    .min(1, {
      message: formatValidationMessage('ER001', VALIDATION_LABELS.employeeName),
    })
    .max(125, {
      message: formatValidationMessage('ER006', VALIDATION_LABELS.employeeName, '125'),
    }),

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

  employeeBirthDate: z
    .date()
    .nullable()
    .refine((value) => value !== null, {
      message: formatValidationMessage('ER001', VALIDATION_LABELS.employeeBirthDate),
    }),

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

  employeeLoginPassword: z
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
    }),

  employeeLoginPasswordConfirm: z
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
    // Chỉ báo lỗi khi người dùng đã nhập confirm password nhưng 2 giá trị không khớp.
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

    // Nếu đã chọn chứng chỉ thì các field liên quan phải hợp lệ đồng bộ.
    if (!/^[1-9]\d*$/.test(values.certificationId.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['certificationId'],
        message: formatValidationMessage('ER018', VALIDATION_LABELS.certificationId),
      });
    }

    if (values.certificationStartDate === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['certificationStartDate'],
        message: formatValidationMessage('ER001', VALIDATION_LABELS.certificationStartDate),
      });
    }

    if (values.certificationEndDate === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['certificationEndDate'],
        message: formatValidationMessage('ER001', VALIDATION_LABELS.certificationEndDate),
      });
    }

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

    if (values.score.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['score'],
        message: formatValidationMessage('ER001', VALIDATION_LABELS.score),
      });
    } else if (!/^[1-9]\d*$/.test(values.score.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['score'],
        message: formatValidationMessage('ER018', VALIDATION_LABELS.score),
      });
    }
  });
