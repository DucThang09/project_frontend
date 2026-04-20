'use client';

import Link from 'next/link';
import React from 'react';
import { useEmployeeList } from '@/hooks/useADM002';

/**
 * 社員一覧画面。
 */
export default function EmployeeList() {
  const {
    employees,
    loading,
    emptyMessage,
    register,
    currentPage,
    setCurrentPage,
    departments,
    totalPages,
    paginationPages,
    handleSearch,
    handleSort,
    getSortIndicator,
    formatDate,
    handlePreviousPage,
    handleNextPage,
    handleAddNew,
  } = useEmployeeList();

  const renderPagination = () => {
    if (paginationPages.length === 0) {
      return null;
    }

    return (
      <div className="pagin">
        <button
          className={`btn btn-sm btn-pre btn-falcon-default ${currentPage === 0 ? 'btn-disabled' : ''}`}
          onClick={handlePreviousPage}
          disabled={currentPage === 0}
        >
          <svg
            className="svg-inline--fa fa-chevron-left fa-w-10"
            aria-hidden="true"
            focusable="false"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 320 512"
          >
            <path
              fill="currentColor"
              d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z"
            />
          </svg>
        </button>

        {paginationPages.map((page, idx) =>
          page === '...' ? (
            <span
              key={`ellipsis-${idx}`}
              className="btn btn-sm text-primary btn-falcon-default"
            >
              <svg
                className="svg-inline--fa fa-ellipsis-h fa-w-16"
                aria-hidden="true"
                focusable="false"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <path
                  fill="currentColor"
                  d="M328 256c0 39.8-32.2 72-72 72s-72-32.2-72-72 32.2-72 72-72 72 32.2 72 72zm104-72c-39.8 0-72 32.2-72 72s32.2 72 72 72 72-32.2 72-72-32.2-72-72-72zm-352 0c-39.8 0-72 32.2-72 72s32.2 72 72 72 72-32.2 72-72-32.2-72-72-72z"
                />
              </svg>
            </span>
          ) : (
            <button
              key={page}
              className={`btn btn-sm text-primary btn-falcon-default ${currentPage === page ? 'active' : ''}`}
              onClick={() => setCurrentPage(page as number)}
            >
              {(page as number) + 1}
            </button>
          )
        )}

        <button
          className={`btn btn-sm btn-next btn-falcon-default ${currentPage === totalPages - 1 ? 'btn-disabled' : ''}`}
          onClick={handleNextPage}
          disabled={currentPage === totalPages - 1}
        >
          <svg
            className="svg-inline--fa fa-chevron-right fa-w-10"
            aria-hidden="true"
            focusable="false"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 320 512"
          >
            <path
              fill="currentColor"
              d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"
            />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="search-memb">
        <h1 className="title">
          会員名称で会員を検索します。検索条件無しの場合は全て表示されます。
        </h1>

        <form className="c-form" onSubmit={handleSearch}>
          <ul className="d-flex">
            <li className="form-group row">
              <label className="col-form-label">氏名:</label>
              <div className="col-sm">
                <input
                  type="text"
                  maxLength={125}
                  {...register('employeeName')}
                />
              </div>
            </li>

            <li className="form-group row">
              <label className="col-form-label">グループ:</label>
              <div className="col-sm">
                <select {...register('departmentId')}>
                  <option value="">全て</option>
                  {departments.map((department) => (
                    <option
                      key={department.departmentId}
                      value={department.departmentId}
                    >
                      {department.departmentName}
                    </option>
                  ))}
                </select>
              </div>
            </li>

            <li className="form-group row">
              <div className="btn-group">
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                >
                  検索
                </button>

                <button
                  type="button"
                  onClick={handleAddNew}
                  className="btn btn-secondary btn-sm"
                >
                  新規追加
                </button>
              </div>
            </li>
          </ul>
        </form>
      </div>

      <div className="row row-table">
        <div className="css-grid-table box-shadow">
          <div className="css-grid-table-header">
            <div>ID</div>

            <div
              style={{ cursor: 'pointer' }}
              onClick={() => handleSort('employee_name')}
            >
              氏名 {getSortIndicator('employee_name')}
            </div>

            <div>生年月日</div>
            <div>グループ</div>
            <div>メールアドレス</div>
            <div>電話番号</div>

            <div
              style={{ cursor: 'pointer' }}
              onClick={() => handleSort('certification_name')}
            >
              日本語能力 {getSortIndicator('certification_name')}
            </div>

            <div
              style={{ cursor: 'pointer' }}
              onClick={() => handleSort('end_date')}
            >
              失効日 {getSortIndicator('end_date')}
            </div>

            <div>点数</div>
          </div>

          <div className="css-grid-table-body">
            {loading ? (
              <div
                style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '20px',
                }}
              >
                読み込み中...
              </div>
            ) : employees.length === 0 ? (
              <div
                style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '20px',
                }}
              >
                {emptyMessage || '検索条件に該当するユーザが見つかりません。'}
              </div>
            ) : (
              employees.map((employee) => (
                <React.Fragment key={employee.employeeId}>
                  <div className="bor-l-none text-center">
                    <Link href={`/employees/adm003?id=${employee.employeeId}`}>
                      {employee.employeeId}
                    </Link>
                  </div>
                  <div>{employee.employeeName}</div>
                  <div>{formatDate(employee.employeeBirthDate)}</div>
                  <div>{employee.departmentName || ''}</div>
                  <div>{employee.employeeEmail}</div>
                  <div>{employee.employeeTelephone || ''}</div>
                  <div>{employee.certificationName || ''}</div>
                  <div>{formatDate(employee.endDate)}</div>
                  <div>{employee.score != null ? employee.score : ''}</div>
                </React.Fragment>
              ))
            )}
          </div>

          {renderPagination()}
        </div>
      </div>
    </>
  );
}
