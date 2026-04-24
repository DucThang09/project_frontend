'use client';

import { useADM003 } from '@/hooks/useADM003';

export default function EmployeeDetail() {
  const { employeeDetail, loading, onEdit, onBack, formatDate } = useADM003();

  if (loading) {
    return (
      <div className="row">
        <div className="box-shadow" style={{ padding: '20px' }}>
          読み込み中...
        </div>
      </div>
    );
  }

  if (!employeeDetail) {
    return null;
  }

  return (
    <div className="row">
      <form className="c-form box-shadow">
        <ul className="show-data">
          <li className="title">会員情報詳細</li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">アカウント名</label>
            <div className="col-sm col-sm-10">{employeeDetail.employeeLoginId}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">グループ</label>
            <div className="col-sm col-sm-10">{employeeDetail.departmentName}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">氏名</label>
            <div className="col-sm col-sm-10">{employeeDetail.employeeName}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">カタカナ氏名</label>
            <div className="col-sm col-sm-10">{employeeDetail.employeeNameKana}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">生年月日</label>
            <div className="col-sm col-sm-10">{formatDate(employeeDetail.employeeBirthDate)}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">メールアドレス</label>
            <div className="col-sm col-sm-10">{employeeDetail.employeeEmail}</div>
          </li>
          <li className="form-group row d-flex bor-none">
            <label className="col-form-label col-sm-2">電話番号</label>
            <div className="col-sm col-sm-10">{employeeDetail.employeeTelephone ?? ''}</div>
          </li>
          <li className="title mt-12"><a href="#!">日本語能力</a></li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">資格</label>
            <div className="col-sm col-sm-10">{employeeDetail.certificationName ?? ''}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">資格交付日</label>
            <div className="col-sm col-sm-10">{formatDate(employeeDetail.certificationStartDate)}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">失効日</label>
            <div className="col-sm col-sm-10">{formatDate(employeeDetail.certificationEndDate)}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">点数</label>
            <div className="col-sm col-sm-10">
              {employeeDetail.score != null ? employeeDetail.score : ''}
            </div>
          </li>
          <li className="form-group row d-flex">
            <div className="btn-group col-sm col-sm-10 ml">
              <button type="button" onClick={onEdit} className="btn btn-primary btn-sm">編集</button>
              <button type="button" className="btn btn-secondary btn-sm">削除</button>
              <button type="button" onClick={onBack} className="btn btn-secondary btn-sm">戻る</button>
            </div>
          </li>
        </ul>
      </form>
    </div>
  );
}
