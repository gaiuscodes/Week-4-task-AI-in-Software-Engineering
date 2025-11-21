// app/(dashboard)/reports/page.tsx
// Frontend: Reports listing page with map

'use client';

import { useState } from 'react';
import { AlertTriangle, MapPin, Filter, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useReports, Report } from '@/hooks/useReports';
import dynamic from 'next/dynamic';

// Use the unified map component that shows all vehicles
const UnifiedMatatuMap = dynamic(() => import('@/components/map/PublicMatatuMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  ),
});

export default function ReportsPage() {
  const { isAuthenticated } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showMap, setShowMap] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const { reports, isLoading, error } = useReports({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
  });

  // Check if error is authentication related
  const isAuthError = error?.includes('Authentication') || error?.includes('UNAUTHORIZED');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'DISMISSED':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    return <AlertTriangle className="w-5 h-5" />;
  };

  // Show login prompt if authentication error or not authenticated
  if (isAuthError || (!isAuthenticated && error)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view reports.</p>
          <Link href="/login" className="btn btn-primary btn-md">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Safety Reports</h1>
            <div className="flex gap-4">
              <button
                onClick={() => setShowMap(!showMap)}
                className="btn btn-secondary btn-md gap-2"
              >
                <MapPin className="w-5 h-5" />
                {showMap ? 'Hide Map' : 'Show Map'}
              </button>
              <Link href="/vehicles" className="btn btn-ghost btn-md">
                View Vehicles
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="VERIFIED">Verified</option>
                <option value="DISMISSED">Dismissed</option>
              </select>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="RECKLESS_DRIVING">Reckless Driving</option>
              <option value="SPEEDING">Speeding</option>
              <option value="HARASSMENT">Harassment</option>
              <option value="OVERLOADING">Overloading</option>
              <option value="UNROADWORTHY">Unroadworthy</option>
              <option value="ROUTE_DEVIATION">Route Deviation</option>
              <option value="FARE_DISPUTE">Fare Dispute</option>
              <option value="DRUNK_DRIVING">Drunk Driving</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Map Section */}
        {showMap && (
          <div className="mb-8">
            <UnifiedMatatuMap />
          </div>
        )}

        {/* Reports List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20">
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No reports found</p>
            <p className="text-gray-400 mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mb-4">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{reports.length}</span> reports
              </p>
            </div>

            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      {getCategoryIcon(report.category)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {report.category.replace(/_/g, ' ')}
                        </h3>
                        <span className={`px-3 py-1 rounded-full border-2 text-sm font-medium ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </div>
                      <Link
                        href={`/vehicles/${report.vehicleId}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {report.vehicle.registrationPlate}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">
                        {report.vehicle.route} • {report.vehicle.sacco.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                    {!report.isAnonymous && report.user && (
                      <p className="text-xs text-gray-400 mt-1">
                        by {report.user.name}
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{report.description}</p>

                {report.photoUrl && (
                  <div className="mb-4">
                    <img
                      src={report.photoUrl}
                      alt="Report evidence"
                      className="max-w-md rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <Link
                    href={`/vehicles/${report.vehicleId}`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Vehicle Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-6 mt-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2025 MatSafy. Making matatu journeys safer in Kenya.</p>
          <p className="mt-2 text-sm text-gray-500">with love by Gaiuscodes</p>
        </div>
      </footer>
    </div>
  );
}

