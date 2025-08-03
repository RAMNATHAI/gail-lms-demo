'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ChatBot } from '@/components/ai/ChatBot';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatBotOpen, setChatBotOpen] = useState(false);
  const { user } = useAuth();

  // TC-003: Admin Role Access - Show different layout based on role
  const isAdmin = user?.role === 'admin';
  const isInstructor = user?.role === 'instructor';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={user?.role}
      />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onChatBotToggle={() => setChatBotOpen(!chatBotOpen)}
          user={user}
        />

        {/* Page Content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* TC-012: AI Chatbot - Always available for platform guidance */}
      <ChatBot
        open={chatBotOpen}
        onClose={() => setChatBotOpen(false)}
      />

      {/* TC-023, TC-024, TC-025: Notification Center for messages */}
      <NotificationCenter />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
