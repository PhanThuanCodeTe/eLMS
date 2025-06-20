"use client";

import Link from 'next/link';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';

export default function SideBar() {
  return (
    <nav className="w-full flex items-center justify-between px-6 py-3 bg-white shadow">
      {/* Trang chủ bên trái */}
      <div>
        <Link href="/" className="text-lg font-semibold text-gray-800 hover:text-indigo-600">
          Trang chủ
        </Link>
      </div>
      {/* Đăng nhập, Đăng ký và icon bên phải */}
      <div className="flex items-center gap-4">
        <Link href="/login" className="flex items-center text-gray-700 hover:text-indigo-600">
          Đăng nhập
        </Link>
        <Link href="/sign-up" className="flex items-center text-gray-700 hover:text-indigo-600">
          Đăng ký
        </Link>
        <NotificationsNoneIcon className="ml-1" fontSize="small" />
      </div>
    </nav>
  );
} 