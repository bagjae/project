import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminPage() {
  const { currentUser, getAllUsers, getDormantUsers, activateUser, deactivateUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'dormant'
  const [allUsersList, setAllUsersList] = useState([]);
  const [dormantList, setDormantList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const [allList, dList] = await Promise.all([
      getAllUsers(),
      getDormantUsers()
    ]);
    setAllUsersList(allList);
    setDormantList(dList);
    setLoading(false);
  }, [getAllUsers, getDormantUsers]);

  useEffect(() => {
    if (!currentUser || !currentUser.is_admin) {
      alert("관리자 권한이 필요합니다.");
      navigate('/');
      return;
    }

    fetchUsers();
  }, [currentUser, navigate, fetchUsers]);

  const handleActivate = async (userId, name) => {
    if (window.confirm(`${name} 님의 계정을 활성화(휴면 해제) 하시겠습니까?`)) {
      const ok = await activateUser(userId);
      if (ok) {
        alert("계정이 성공적으로 활성화되었습니다.");
        fetchUsers();
      } else {
        alert("처리에 실패했습니다.");
      }
    }
  };

  const handleDeactivate = async (userId, name) => {
    if (window.confirm(`${name} 님의 계정을 수동으로 휴면 처리(비활성화) 하시겠습니까?`)) {
      const ok = await deactivateUser(userId);
      if (ok) {
        alert("계정이 수동으로 휴면 처리되었습니다.");
        fetchUsers();
      } else {
        alert("처리에 실패했습니다.");
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#fbfbfb] flex flex-col font-sans">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 flex flex-col gap-8">
        
        {/* Header Title & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] gap-4">
          <div>
            <h1 className="text-[26px] font-bold text-gray-900 mb-1">BookNest 관리자 콘솔</h1>
            <p className="text-[14px] text-gray-500">전체 회원 관리 및 휴면 계정 수동 활성화/비활성화</p>
          </div>
          <button 
            onClick={fetchUsers}
            className="px-4 py-2.5 bg-blue-50 text-blue-600 font-semibold rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors text-[14px] shrink-0 flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            목록 새로고침
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-3 px-6 font-bold text-[15px] border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            👥 전체 회원 목록 ({allUsersList.length}명)
          </button>
          <button
            onClick={() => setActiveTab('dormant')}
            className={`py-3 px-6 font-bold text-[15px] border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'dormant'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            🌙 휴면 회원 전용 목록
            {dormantList.length > 0 && (
              <span className="bg-red-100 text-red-600 text-[12px] px-2 py-0.5 rounded-full font-extrabold">
                {dormantList.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: All Users Table */}
        {activeTab === 'all' && (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h2 className="text-[20px] font-bold text-gray-900">전체 회원 목록</h2>
              <span className="text-[13px] text-gray-500 font-medium">활성 회원에게 [휴면 처리] 버튼을 눌러 수동으로 휴면 처리할 수 있습니다.</span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-gray-500">불러오는 중...</div>
            ) : allUsersList.length === 0 ? (
              <div className="py-12 text-center text-gray-400 bg-gray-50 rounded-xl border border-gray-100">
                등록된 회원이 없습니다.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 text-[14px] font-semibold">
                      <th className="py-3.5 px-4 rounded-l-lg">ID</th>
                      <th className="py-3.5 px-4">아이디</th>
                      <th className="py-3.5 px-4">이름</th>
                      <th className="py-3.5 px-4">전화번호</th>
                      <th className="py-3.5 px-4">이메일</th>
                      <th className="py-3.5 px-4">계정 상태</th>
                      <th className="py-3.5 px-4 text-right rounded-r-lg">상태 변경 작업</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-[14.5px]">
                    {allUsersList.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-4 px-4 font-mono text-gray-500">#{user.id}</td>
                        <td className="py-4 px-4 font-bold text-gray-900">
                          {user.login_id}
                          {user.is_admin && <span className="ml-2 text-[11px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold">관리자</span>}
                        </td>
                        <td className="py-4 px-4 text-gray-800 font-medium">{user.name}</td>
                        <td className="py-4 px-4 text-gray-600">{user.phone_number || '-'}</td>
                        <td className="py-4 px-4 text-gray-600">{user.email || '-'}</td>
                        <td className="py-4 px-4">
                          {user.is_active ? (
                            <span className="bg-green-50 text-green-700 font-bold px-2.5 py-1 rounded text-[13px] border border-green-200">
                              🟢 정상 (활성)
                            </span>
                          ) : (
                            <span className="bg-red-50 text-red-600 font-bold px-2.5 py-1 rounded text-[13px] border border-red-200">
                              🌙 휴면 계정
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          {user.is_active ? (
                            <button
                              onClick={() => handleDeactivate(user.id, user.name)}
                              className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-medium rounded-lg text-[13px] transition-colors"
                            >
                              휴면 처리 (비활성화)
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(user.id, user.name)}
                              className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-[13px] shadow-sm transition-colors"
                            >
                              휴면 해제 (활성화)
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Dormant Only Table */}
        {activeTab === 'dormant' && (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h2 className="text-[20px] font-bold text-gray-900">휴면 회원 전용 목록</h2>
              <span className="text-[13px] text-gray-500 font-medium">장기 미접속(90일 이상) 또는 수동 휴면 처리된 회원 목록입니다.</span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-gray-500">불러오는 중...</div>
            ) : dormantList.length === 0 ? (
              <div className="py-12 text-center text-gray-400 bg-gray-50 rounded-xl border border-gray-100">
                현재 휴면 상태인 회원이 없습니다.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 text-[14px] font-semibold">
                      <th className="py-3.5 px-4 rounded-l-lg">ID</th>
                      <th className="py-3.5 px-4">아이디</th>
                      <th className="py-3.5 px-4">이름</th>
                      <th className="py-3.5 px-4">마지막 로그인</th>
                      <th className="py-3.5 px-4">미접속 일수</th>
                      <th className="py-3.5 px-4 text-right rounded-r-lg">작업</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-[14.5px]">
                    {dormantList.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-4 px-4 font-mono text-gray-500">#{user.id}</td>
                        <td className="py-4 px-4 font-bold text-gray-900">{user.login_id}</td>
                        <td className="py-4 px-4 text-gray-800 font-medium">{user.name}</td>
                        <td className="py-4 px-4 text-gray-600">
                          {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : '로그인 기록 없음'}
                        </td>
                        <td className="py-4 px-4">
                          {user.days_since_last_login !== null ? (
                            <span className="bg-red-50 text-red-600 font-bold px-2.5 py-1 rounded text-[13px] border border-red-100">
                              {user.days_since_last_login}일째 미접속
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => handleActivate(user.id, user.name)}
                            className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-[13px] shadow-sm transition-colors"
                          >
                            휴면 해제 (활성화)
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
