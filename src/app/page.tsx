'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import LoginPage from '@/components/LoginPage';
import MetricCard from '@/components/MetricCard';
import ProfitChart from '@/components/ProfitChart';
import RestoTable from '@/components/RestoTable';
import UsersTab from '@/components/UsersTab';
import RestosTab from '@/components/RestosTab';
import PromosTab from '@/components/PromosTab';
import StatsTab from '@/components/StatsTab';
import ProfileSettings from '@/components/ProfileSettings';

import { Users, Store, Coins } from 'lucide-react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showProfile, setShowProfile] = React.useState(false);
  const [dashboardData, setDashboardData] = React.useState({ 
    totalRestaurants: '...', 
    totalCustomers: '...', 
    totalUsers: '...',
    totalProfit: 'Rp. 0',
    rawProfit: 0
  });

  React.useEffect(() => {
    async function loadMetrics() {
      try {
        const { fetchDashboardMetrics } = await import('@/app/actions');
        const res = await fetchDashboardMetrics();
        if (res.success && res.data) {
          setDashboardData({
            totalRestaurants: String(res.data.totalRestaurants),
            totalCustomers: String(res.data.totalCustomers),
            totalUsers: String(res.data.totalUsers),
            totalProfit: res.data.totalProfitFormatted || 'Rp. 0',
            rawProfit: res.data.rawProfit || 0
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadMetrics();
  }, []);

  // Synchronize authentication state with localStorage safely on the client
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAuth = localStorage.getItem('isLoggedIn');
      if (savedAuth === 'true') {
        setIsLoggedIn(true);
      }
    }
  }, []);

  const handleLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    setActiveTab('dashboard');
  };

  // Define metrics dynamically
  const metrics = [
    {
      label: 'Restoran',
      value: dashboardData.totalRestaurants,
      icon: Store,
      gradient: 'linear-gradient(135deg, #FF2E00 0%, #FFA800 100%)',
      iconColor: '#FF2E00',
    },
    {
      label: 'Customer',
      value: dashboardData.totalCustomers,
      icon: Users,
      gradient: 'linear-gradient(135deg, #00A3FF 0%, #6600FF 100%)',
      iconColor: '#490BFF',
    },
    {
      label: 'Total User',
      value: dashboardData.totalUsers,
      icon: Users,
      gradient: 'linear-gradient(135deg, #E21B5A 0%, #00C2FF 100%)',
      iconColor: '#E21B5A',
    },
    {
      label: 'Profit',
      value: dashboardData.totalProfit,
      icon: Coins,
      gradient: 'linear-gradient(135deg, #00F0FF 0%, #00D65A 100%)',
      iconColor: '#00D65A',
    },
  ];

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div 
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-layout)',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      {/* Main Dashboard Space */}
      <div 
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        {/* Header Section */}
        <Header 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          onFilterClick={() => console.log('Filters Clicked')} 
          onProfileClick={() => setShowProfile(!showProfile)}
          isProfileOpen={showProfile}
          onNotificationClick={() => setActiveTab('restaurants')}
        />

        {/* Account Profile Settings Dropdown */}
        <ProfileSettings isOpen={showProfile} />

        {/* Render Tab Contents Dynamically */}
        {activeTab === 'dashboard' && (
          <main 
            className="animate-fade-in"
            style={{
              padding: '32px 32px 32px 32px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Unified Floating Island White Card Wrapper */}
            <div
              className="premium-widget"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: '24px',
                border: '1px solid var(--border-color)',
                padding: '32px',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: '36px',
              }}
            >
              {/* Metric Overview Grid */}
              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '20px',
                }}
              >
                {metrics.map((m, idx) => (
                  <MetricCard 
                    key={m.label}
                    label={m.label}
                    value={m.value}
                    icon={m.icon}
                    gradient={m.gradient}
                    iconColor={m.iconColor}
                    index={idx}
                  />
                ))}
              </div>

              {/* Profit SVG Graph Chart */}
              <ProfitChart />

              {/* Resto Profit performance table & notepad memo side-by-side */}
              <RestoTable searchQuery={searchQuery} />
            </div>
          </main>
        )}

        {activeTab === 'users' && (
          <UsersTab searchQuery={searchQuery} />
        )}

        {activeTab === 'restaurants' && (
          <RestosTab searchQuery={searchQuery} />
        )}

        {activeTab === 'promos' && (
          <PromosTab />
        )}

        {activeTab === 'financial' && (
          <StatsTab />
        )}
      </div>
    </div>
  );
}
