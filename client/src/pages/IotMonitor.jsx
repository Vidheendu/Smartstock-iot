import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Radio,
  RadioTower,
  Cpu,
  RefreshCw,
  Send,
  Loader2,
  Battery,
  MapPin,
  Package,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Boxes,
  BellRing
} from 'lucide-react';
import { getDevices, sendTelemetry } from '../services/iot.service.js';
import ProductStatusBadge from '../components/products/ProductStatusBadge.jsx';

export const IotMonitor = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [readingUnits, setReadingUnits] = useState('15');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);
  const [telemetryLogs, setTelemetryLogs] = useState([]);

  const loadDevices = useCallback(async () => {
    try {
      setError(null);
      const data = await getDevices();
      setDevices(data || []);
      if (data && data.length > 0 && !selectedDeviceId) {
        // Select Milk's device by default (SIM-IOT-SCALE-01)
        const milkDevice = data.find((d) => d.deviceCode === 'SIM-IOT-SCALE-01') || data[0];
        setSelectedDeviceId(milkDevice.id);
        setReadingUnits(String(milkDevice.currentStock ?? 15));
      }
    } catch (err) {
      setError('Unable to load simulated devices.');
    } finally {
      setLoading(false);
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId);

  const handleDeviceChange = (deviceId) => {
    setSelectedDeviceId(deviceId);
    const dev = devices.find((d) => d.id === deviceId);
    if (dev) {
      setReadingUnits(String(dev.currentStock ?? 15));
    }
    setSimulationResult(null);
  };

  const handleSendTelemetry = async (customUnits) => {
    const unitsToSend = customUnits !== undefined ? customUnits : readingUnits;
    const parsed = parseInt(unitsToSend, 10);
    if (isNaN(parsed) || parsed < 0) {
      setError('Please enter a valid non-negative number of units.');
      return;
    }

    try {
      setSending(true);
      setError(null);

      const result = await sendTelemetry({
        deviceId: selectedDeviceId,
        calculatedUnits: parsed
      });

      setSimulationResult(result);

      // Add to local telemetry history log
      const newLog = {
        id: result.reading?.id || Date.now().toString(),
        deviceCode: selectedDevice?.deviceCode || 'SIM-DEVICE',
        productName: selectedDevice?.productName || 'Product',
        unit: selectedDevice?.unit || 'units',
        previousStock: result.previousStock,
        newStock: result.newStock,
        delta: result.newStock - result.previousStock,
        timestamp: new Date().toLocaleTimeString(),
        alertAction: result.alertResult?.action || 'EVALUATED'
      };
      setTelemetryLogs((prev) => [newLog, ...prev.slice(0, 9)]);

      // Refresh device states
      await loadDevices();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispatch simulated telemetry.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#1769C2]" />
        <p className="text-sm font-semibold text-[#0F172A]">Loading IoT Monitor...</p>
        <p className="text-xs text-[#64748B]">Connecting to software-simulated sensor network</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#D9E2EC]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
              IoT Monitor
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F2FF] border border-[#BFDBFE] text-[#1769C2] text-xs font-bold">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>SOFTWARE SIMULATION</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Software-simulated sensor readings, device statuses, and inventory telemetry streams.
          </p>
        </div>

        <button
          onClick={loadDevices}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0F172A] bg-white hover:bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl transition cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#64748B]" />
          <span>Refresh Devices</span>
        </button>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Device Selection & Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Device List Selector */}
        <div className="bg-white border border-[#D9E2EC] rounded-3xl p-5 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-2">
            <RadioTower className="w-4 h-4 text-[#1769C2]" />
            <span>Simulated Devices ({devices.length})</span>
          </h2>

          <div className="space-y-2.5">
            {devices.map((device) => {
              const isSelected = device.id === selectedDeviceId;

              return (
                <div
                  key={device.id}
                  onClick={() => handleDeviceChange(device.id)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer text-xs ${
                    isSelected
                      ? 'border-[#1769C2] bg-[#E8F2FF]/50 ring-2 ring-[#1769C2]/20'
                      : 'border-[#D9E2EC] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#0F172A] truncate">
                      {device.deviceName}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-[#D9E2EC] text-[#64748B]">
                      {device.deviceCode}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#64748B] text-[11px] mt-1">
                    <span>
                      Product:{' '}
                      <strong className="text-[#0F172A]">{device.productName}</strong>
                    </span>
                    <ProductStatusBadge status={device.stockStatus} />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-2 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#1769C2]" />
                      <span className="truncate max-w-[130px]">{device.location}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Battery className="w-3 h-3 text-emerald-600" />
                      <span>{device.batteryLevel}%</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Simulation Controller (spans 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {selectedDevice ? (
            <div className="bg-white border border-[#D9E2EC] rounded-3xl p-6 shadow-xs space-y-6">
              {/* Selected Device Status Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#D9E2EC]">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold text-[#0F172A]">
                      {selectedDevice.deviceName}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D1FAE5] text-emerald-800 border border-emerald-300">
                      ONLINE
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Sensor: <span className="font-semibold text-[#0F172A]">{selectedDevice.deviceType}</span> • Location:{' '}
                    <span className="font-semibold text-[#0F172A]">{selectedDevice.location}</span>
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                    Assigned Product
                  </span>
                  <span className="text-sm font-bold text-[#0F172A]">
                    {selectedDevice.productName}
                  </span>
                  <div className="flex items-center sm:justify-end gap-1.5 mt-0.5">
                    <span className="text-xs font-extrabold text-[#1769C2]">
                      Current: {selectedDevice.currentStock} {selectedDevice.unit}
                    </span>
                    <span className="text-[11px] text-[#64748B]">
                      (Min: {selectedDevice.minimumStock})
                    </span>
                  </div>
                </div>
              </div>

              {/* Simulation Dispatch Console */}
              <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#D9E2EC] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-[#1769C2]" />
                    <span>Send Simulated Telemetry</span>
                  </span>
                  <span className="text-[11px] text-[#64748B]">
                    Updates stock & triggers automatic alert engine
                  </span>
                </div>

                {/* Preset Testing Buttons (Matches Phase 7 Verification Steps) */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-[#64748B]">
                    Quick Test Presets:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setReadingUnits('15');
                        handleSendTelemetry(15);
                      }}
                      disabled={sending}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition cursor-pointer disabled:opacity-50"
                    >
                      15 {selectedDevice.unit} (LOW)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReadingUnits('8');
                        handleSendTelemetry(8);
                      }}
                      disabled={sending}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-300 transition cursor-pointer disabled:opacity-50"
                    >
                      8 {selectedDevice.unit} (CRITICAL)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReadingUnits('0');
                        handleSendTelemetry(0);
                      }}
                      disabled={sending}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-red-50 hover:bg-red-100 text-red-800 border border-red-300 transition cursor-pointer disabled:opacity-50"
                    >
                      0 {selectedDevice.unit} (OUT OF STOCK)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReadingUnits('30');
                        handleSendTelemetry(30);
                      }}
                      disabled={sending}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition cursor-pointer disabled:opacity-50"
                    >
                      30 {selectedDevice.unit} (NORMAL)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReadingUnits('45');
                        handleSendTelemetry(45);
                      }}
                      disabled={sending}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-[#E8F2FF] hover:bg-blue-100 text-[#1769C2] border border-[#BFDBFE] transition cursor-pointer disabled:opacity-50"
                    >
                      45 {selectedDevice.unit} (FULL)
                    </button>
                  </div>
                </div>

                {/* Custom numeric input */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      min="0"
                      value={readingUnits}
                      onChange={(e) => setReadingUnits(e.target.value)}
                      placeholder="Enter units (e.g. 15)"
                      className="w-full px-4 py-2.5 text-sm font-bold text-[#0F172A] bg-white border border-[#D9E2EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1769C2]/20 focus:border-[#1769C2] transition"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#64748B]">
                      {selectedDevice.unit}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSendTelemetry()}
                    disabled={sending}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#1769C2] hover:bg-[#1257A0] text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50 shadow-xs shrink-0"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Telemetry...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Simulated Reading</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Simulation Result Banner */}
              {simulationResult && (
                <div className="p-5 rounded-2xl bg-white border border-[#1769C2]/30 shadow-sm space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#1769C2]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Telemetry Dispatched & Stock Updated</span>
                    </span>
                    <span className="text-[11px] font-mono text-[#64748B]">
                      Source: IOT
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold uppercase text-[#64748B] block">
                        Inventory Delta
                      </span>
                      <p className="font-extrabold text-sm text-[#0F172A] mt-0.5">
                        {simulationResult.previousStock} → {simulationResult.newStock}{' '}
                        {selectedDevice.unit}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold uppercase text-[#64748B] block">
                        Calculated Status
                      </span>
                      <div className="mt-0.5">
                        <ProductStatusBadge
                          status={simulationResult.product?.stockStatus || 'NORMAL'}
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold uppercase text-[#64748B] block">
                        Alert Engine Action
                      </span>
                      <p className="font-bold text-xs text-[#0F172A] mt-0.5">
                        {simulationResult.alertResult?.action === 'CREATED' && (
                          <span className="text-red-700">
                            Created {simulationResult.alertResult.alert?.alertType}
                          </span>
                        )}
                        {simulationResult.alertResult?.action === 'EXISTING_MAINTAINED' && (
                          <span className="text-amber-700">
                            Duplicate Prevented (Active maintained)
                          </span>
                        )}
                        {simulationResult.alertResult?.action === 'RESOLVED' && (
                          <span className="text-emerald-700">
                            Active Alert Resolved (Stock normal)
                          </span>
                        )}
                        {simulationResult.alertResult?.action === 'NONE' && (
                          <span className="text-[#64748B]">No alert needed (Normal)</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Direct Verification Links */}
                  <div className="flex items-center gap-3 pt-2 text-xs">
                    <Link
                      to="/alerts"
                      className="inline-flex items-center gap-1.5 font-bold text-[#1769C2] hover:underline"
                    >
                      <BellRing className="w-3.5 h-3.5" />
                      <span>Verify in Alerts</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                    <span className="text-slate-300">•</span>
                    <Link
                      to="/inventory"
                      className="inline-flex items-center gap-1.5 font-bold text-[#1769C2] hover:underline"
                    >
                      <Boxes className="w-3.5 h-3.5" />
                      <span>Verify in Inventory</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-[#D9E2EC] rounded-3xl p-12 text-center text-[#64748B]">
              <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-semibold">Select a device from the left panel to begin.</p>
            </div>
          )}

          {/* Telemetry Stream Log Table */}
          {telemetryLogs.length > 0 && (
            <div className="bg-white border border-[#D9E2EC] rounded-3xl p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Recent Simulated Telemetry Stream
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#D9E2EC] text-[10px] font-bold uppercase text-[#64748B]">
                      <th className="py-2">Time</th>
                      <th className="py-2">Device</th>
                      <th className="py-2">Product</th>
                      <th className="py-2 text-right">Transition</th>
                      <th className="py-2 text-right">Alert Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {telemetryLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-2 text-[#64748B] font-mono text-[11px]">
                          {log.timestamp}
                        </td>
                        <td className="py-2 font-mono text-[11px] font-semibold text-[#0F172A]">
                          {log.deviceCode}
                        </td>
                        <td className="py-2 font-bold text-[#0F172A]">
                          {log.productName}
                        </td>
                        <td className="py-2 text-right font-semibold text-[#0F172A]">
                          {log.previousStock} → {log.newStock} {log.unit}
                        </td>
                        <td className="py-2 text-right font-mono text-[11px] text-[#1769C2]">
                          {log.alertAction}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IotMonitor;
