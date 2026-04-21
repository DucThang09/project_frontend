'use client';

import { useRef } from 'react';
import { Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useADM004 } from '@/hooks/useADM004';

export default function EmployeeInputForm() {
  const {
    departments,
    certifications,
    errorMessage,
    register,
    control,
    watch,
    onConfirm,
    onBack,
  } = useADM004();

  // Giữ ref cho 3 DatePicker để icon lịch có thể focus và mở calendar.
  const birthDateRef = useRef<DatePicker>(null);
  const certificationStartDateRef = useRef<DatePicker>(null);
  const certificationEndDateRef = useRef<DatePicker>(null);
  const selectedDepartmentId = watch('departmentId');
  const selectedCertificationId = watch('certificationId');
  const isCertificationSelected = selectedCertificationId !== '';

  // Các ô ngày chỉ được chọn từ calendar, không cho nhập tay.
  const preventManualDateInput = (event: React.KeyboardEvent<HTMLElement>) => {
    event.preventDefault();
  };

  return (
    <div className="row">
      <form className="c-form box-shadow">
        <ul>
          <li className="title">会員情報追加</li>
          {errorMessage ? (
            <li className="box-err">
              <div className="box-err-content">{errorMessage}</div>
            </li>
          ) : null}
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2"><i className="relative">アカウント名:<span className="note-red">*</span></i></label>
            <div className="col-sm col-sm-10">
              <input type="text" className="form-control" {...register('employeeLoginId')} />
            </div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2"><i className="relative">グループ:<span className="note-red">*</span></i></label>
            <div className="col-sm col-sm-10">
              {/* Bind dữ liệu departments vào combobox nhóm, có phần tử rỗng ở đầu. */}
              <select className="form-control" value={selectedDepartmentId} {...register('departmentId')}>
                <option value="">選択してください</option>
                {departments.map((department) => (
                  <option key={department.departmentId} value={department.departmentId}>
                    {department.departmentName}
                  </option>
                ))}
              </select>
            </div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2"><i className="relative">氏名:<span className="note-red">*</span></i></label>
            <div className="col-sm col-sm-10">
              <input type="text" className="form-control" {...register('employeeName')} />
            </div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2"><i className="relative">カタカナ氏名:<span className="note-red">*</span></i></label>
            <div className="col-sm col-sm-10">
              <input type="text" className="form-control" {...register('employeeNameKana')} />
            </div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2"><i className="relative">生年月日:<span className="note-red">*</span></i></label>
            <div className="col-sm col-sm-10 d-flex">
              <div className="datepicker-wrapper">
                {/* Dùng Controller để đồng bộ DatePicker với react-hook-form cho các ô ngày. */}
                <Controller
                  name="employeeBirthDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      ref={birthDateRef}
                      placeholderText="yyyy/MM/dd"
                      selected={field.value}
                      onChange={(date) => field.onChange(date)}
                      onKeyDown={preventManualDateInput}
                      dateFormat="yyyy/MM/dd"
                    />
                  )}
                />
                <span className="glyphicon glyphicon-calendar" onClick={() => birthDateRef.current?.setFocus()}></span>
              </div>
            </div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2"><i className="relative">メールアドレス:<span className="note-red">*</span></i></label>
            <div className="col-sm col-sm-10">
              <input type="text" className="form-control" {...register('employeeEmail')} />
            </div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2"><i className="relative">電話番号:<span className="note-red">*</span></i></label>
            <div className="col-sm col-sm-10">
              <input type="text" className="form-control" {...register('employeeTelephone')} />
            </div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2"><i className="relative">パスワード:<span className="note-red">*</span></i></label>
            <div className="col-sm col-sm-10">
              <input type="password" className="form-control" {...register('employeeLoginPassword')} />
            </div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2"><i className="relative">パスワード（確認）:</i></label>
            <div className="col-sm col-sm-10">
              <input type="password" className="form-control" {...register('employeeLoginPasswordConfirm')} />
            </div>
          </li>
          <li className="title mt-12"><a href="#!">日本語能力</a></li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2"><i className="relative">資格:</i></label>
            <div className="col-sm col-sm-10">
              {/* Bind dữ liệu certificates vào combobox chứng chỉ, có phần tử rỗng ở đầu. */}
              <select className="form-control" value={selectedCertificationId} {...register('certificationId')}>
                <option value="">選択してください</option>
                {certifications.map((certification) => (
                  <option key={certification.certificationId} value={certification.certificationId}>
                    {certification.certificationName}
                  </option>
                ))}
              </select>
            </div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2"><i className="relative">資格交付日:<span className="note-red">*</span></i></label>
            <div className="col-sm col-sm-10 d-flex">
              <div className="datepicker-wrapper">
                {/* Các field ngày này phụ thuộc vào việc đã chọn 資格 hay chưa. */}
                <Controller
                  name="certificationStartDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      ref={certificationStartDateRef}
                      placeholderText="yyyy/MM/dd"
                      selected={field.value}
                      onChange={(date) => field.onChange(date)}
                      onKeyDown={preventManualDateInput}
                      disabled={!isCertificationSelected}
                      dateFormat="yyyy/MM/dd"
                    />
                  )}
                />
                <span className="glyphicon glyphicon-calendar" onClick={() => certificationStartDateRef.current?.setFocus()}></span>
              </div>
            </div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2"><i className="relative">失効日:<span className="note-red">*</span></i></label>
            <div className="col-sm col-sm-10 d-flex">
              <div className="datepicker-wrapper">
                {/* Các field ngày này phụ thuộc vào việc đã chọn 資格 hay chưa. */}
                <Controller
                  name="certificationEndDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      ref={certificationEndDateRef}
                      placeholderText="yyyy/MM/dd"
                      selected={field.value}
                      onChange={(date) => field.onChange(date)}
                      onKeyDown={preventManualDateInput}
                      disabled={!isCertificationSelected}
                      dateFormat="yyyy/MM/dd"
                    />
                  )}
                />
                <span className="glyphicon glyphicon-calendar" onClick={() => certificationEndDateRef.current?.setFocus()}></span>
              </div>
            </div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2"><i className="relative">点数:</i></label>
            <div className="col-sm col-sm-10">
              {/* Điểm số cũng chỉ được nhập khi người dùng đã chọn chứng chỉ. */}
              <input type="text" className="form-control" disabled={!isCertificationSelected} {...register('score')} />
            </div>
          </li>
          <li className="form-group row d-flex">
            <div className="btn-group col-sm col-sm-10 ml">
              <button type="button" onClick={onConfirm} className="btn btn-primary btn-sm">確認</button>
              <button type="button" onClick={onBack} className="btn btn-secondary btn-sm">戻る</button>
            </div>
          </li>
        </ul>
      </form>
    </div>
  );
}
