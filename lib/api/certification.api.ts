import type { CertificationDTO, CertificationResponse } from '@/types/certification';
import { apiClient } from './client';

// Endpoint lấy danh sách chứng chỉ.
const CERTIFICATION_ENDPOINT = '/certification';

// Gọi API lấy danh sách chứng chỉ để hiển thị ở combobox.
export async function getCertifications(): Promise<CertificationDTO[]> {
  const { data } = await apiClient.get<CertificationResponse>(CERTIFICATION_ENDPOINT);

  return data.certifications ?? [];
}
