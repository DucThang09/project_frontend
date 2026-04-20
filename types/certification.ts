// Dữ liệu một chứng chỉ trả về từ API.
export interface CertificationDTO {
  readonly certificationId: number;
  readonly certificationName: string;
}

// Cấu trúc response của API danh sách chứng chỉ.
export interface CertificationResponse {
  readonly code: number;
  readonly certifications: CertificationDTO[];
}
