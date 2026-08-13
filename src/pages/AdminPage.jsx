import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminPage() {
  const { currentUser, getDormantUsers, activateUser, deactivateUser } = useAuth();
  const navigate = useNavigate();

  const [dormantList, setDormantList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDormantList = useCallback(async () => {
    setLoading(true);
    const list = await getDormantUsers();
    setDormantList(list);
    setLoading(false);
  }, [getDormantUsers]);

  useEffect(() => {
    if (!currentUser || !currentUser.is_admin) {
      alert("관리자 권한이 필요합니다.");
      navigate('/');
      return;
    }

    fetchDormantList();
  }, [currentUser, navigate, fetchDormantList]);

  const handleActivate = async (userId, name) => {
    if (window.confirm(`${name} 님의 계정을 활성화(휴면 해제) 하시겠습니까?`)) {
      const ok = await activateUser(userId);
      if (ok) {
        alert("계정이 활성화되었습니다.");
        fetchDormantList();
      } else {
        alert("처리에 실패했습니다.");
      }
    }
  };

  const handleDeactivate = async (userId, name) => {
    if (window.confirm(`${name} 님의 계정을 수동으로 휴면 처리하시겠습니까?`)) {
      const ok = await deactivateUser(userId);
      if (ok) {
        alert("계정이 휴면 처리되었습니다.");
        fetchDormantList();
      } else {
        alert("처리에 실패했습니다.");
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#fbfbfb] flex flex-col font-sans">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 flex flex-col gap-8">
        
        {/* Title Section */}
        <div className="flex justify-between items-center bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <div>
            <h1 className="text-[26px] font-bold text-gray-900 mb-1">BookNest 관리자 콘솔</h1>
            <p className="text-[14px] text-gray-500">휴면 계정 관리 및 회원 상태 제어</p>
          </div>
          <button 
            onClick={fetchDormantList}
            className="px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors text-[14px]"
          >
            🔄 목록 새로고침
          </button>
        </div>

        {/* Dormant Users Table */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col gap-6">
          <h2 className="text-[20px] font-bold text-gray-900">휴면 및 비활성 회원 목록</h2>

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
                      <td className="py-4 px-4 text-gray-800">{user.name}</td>
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
                          className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-[13px] shadow-sm transition-colors mr-2"
                        >
                          휴면 해제 (활성화)
                        </button>
                        <button
                          onClick={() => handleDeactivate(user.id, user.name)}
                          className="px-3.5 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg text-[13px] transition-colors"
                        >
                          휴면 처리
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
