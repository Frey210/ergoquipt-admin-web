// src/components/Layout/Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings,
  UserCheck
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const menuItems = [
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      description: 'System overview'
    },
    {
      path: '/operators',
      icon: Users,
      label: 'Operators',
      description: 'Manage operators'
    },
    {
      path: '/sessions',
      icon: Calendar,
      label: 'Sessions',
      description: 'Testing sessions'
    },
    {
      path: '/respondents',
      icon: UserCheck,
      label: 'Respondents',
      description: 'Participant data'
    },
    {
      path: '/analytics',
      icon: BarChart3,
      label: 'Analytics',
      description: 'Reports & insights'
    },
    {
      path: '/settings',
      icon: Settings,
      label: 'Settings',
      description: 'System configuration'
    }
  ];

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl">
            <span className="text-white font-bold text-xl">EQ</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Ergoquipt</h2>
            <p className="text-xs text-gray-500">Laboratory System</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-blue-50 border border-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <div className={`p-2 rounded-lg group-hover:scale-110 transition-transform ${
              location.pathname === item.path 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-500'
            }`}>
              <item.icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{item.label}</p>
              <p className="text-xs text-gray-500 truncate">{item.description}</p>
            </div>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
        <div className="text-center">
          <p className="text-xs text-gray-500">Powered by</p>
          <p className="text-xs font-medium text-gray-700">Airosky Technology</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;