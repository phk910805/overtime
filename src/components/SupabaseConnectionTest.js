import React, { useState, useEffect } from 'react'
import { testConnection } from '../lib/supabase'
import { employeeAPI } from '../services/api'

const SupabaseConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('testing')
  const [employees, setEmployees] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    const runTests = async () => {
      try {
        setConnectionStatus('testing')
        setError(null)

        // 1. 기본 연결 테스트
        console.log('🔄 Testing Supabase connection...')
        const isConnected = await testConnection()
        
        if (!isConnected) {
          throw new Error('Failed to connect to Supabase')
        }

        // 2. 직원 데이터 조회 테스트
        console.log('🔄 Testing employee API...')
        const employeeData = await employeeAPI.getAll()
        setEmployees(employeeData)

        setConnectionStatus('success')
        console.log('✅ All tests passed!')
        
      } catch (err) {
        console.error('❌ Connection test failed:', err)
        setError(err.message)
        setConnectionStatus('error')
      }
    }

    runTests()
  }, [])

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'testing': return 'text-yellow-600 bg-yellow-50'
      case 'success': return 'text-green-600 bg-green-50'
      case 'error': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing': return '🔄'
      case 'success': return '✅'
      case 'error': return '❌'
      default: return '⏳'
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Supabase Connection Test</h2>
      
      {/* Connection Status */}
      <div className={`p-4 rounded-lg border mb-4 ${getStatusColor()}`}>
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getStatusIcon()}</span>
          <div>
            <h3 className="font-semibold">
              Connection Status: {connectionStatus.toUpperCase()}
            </h3>
            {error && (
              <p className="text-sm mt-1">Error: {error}</p>
            )}
          </div>
        </div>
      </div>

      {/* Employee Data */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-2">
          Employee Data ({employees.length} records)
        </h3>
        
        {employees.length === 0 ? (
          <p className="text-gray-500 italic">No employees found (this is normal for a new database)</p>
        ) : (
          <div className="space-y-2">
            {employees.map(employee => (
              <div key={employee.id} className="p-2 bg-gray-50 rounded">
                <span className="font-medium">{employee.name}</span>
                <span className="text-sm text-gray-500 ml-2">
                  (ID: {employee.id})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Test Actions */}
      <div className="mt-4 space-y-2">
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          🔄 Retest Connection
        </button>
        
        {connectionStatus === 'success' && (
          <p className="text-sm text-green-600">
            ✅ Ready to proceed with Context integration!
          </p>
        )}
      </div>
    </div>
  )
}

export default SupabaseConnectionTest
