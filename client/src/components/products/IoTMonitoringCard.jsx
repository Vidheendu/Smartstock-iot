import React from 'react';
import { Link } from 'react-router-dom';
import { Radio, RadioTower, Battery, MapPin, Cpu, ArrowUpRight, Clock, AlertCircle } from 'lucide-react';

/**
 * IoTMonitoringCard component.
 * Displays associated simulated IoT device information and latest sensor telemetry.
 * Strictly presents simulated sensor indicators and real sensor_readings data.
 */
export const IoTMonitoringCard = ({ iotDevice, telemetry = [], unit = 'units' }) => {
  return (
    <div className="bg-white border border-[#D9E2EC] rounded-2xl p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D9E2EC]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-[#0F172A] flex items-center gap-2">
              <RadioTower className="w-4 h-4 text-[#1769C2]" />
              <span>IoT Monitoring</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E8F2FF] text-[#1769C2] border border-[#BFDBFE]">
              SIMULATED IoT DEVICE
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Software-simulated sensor integration and inventory telemetry streams
          </p>
        </div>

        <Link
          to="/iot"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1769C2] hover:text-[#1257A0] bg-[#E8F2FF] hover:bg-[#dbeafe] border border-[#BFDBFE] rounded-xl transition cursor-pointer self-start sm:self-auto shadow-2xs"
        >
          <span>View All IoT Readings</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Hardware Disclaimer Banner */}
      <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center gap-2.5 text-xs text-blue-900">
        <Radio className="w-4 h-4 text-[#1769C2] shrink-0" />
        <span>
          <strong className="font-bold">SIMULATED IoT DEVICE:</strong> This project does not use physical hardware. Telemetry is software-generated for inventory tracking.
        </span>
      </div>

      {!iotDevice ? (
        <div className="p-8 text-center bg-[#F8FAFC] rounded-xl border border-dashed border-[#D9E2EC] space-y-1">
          <AlertCircle className="w-6 h-6 text-[#64748B] mx-auto" />
          <p className="text-xs font-semibold text-[#0F172A]">No simulated IoT device assigned.</p>
          <p className="text-[11px] text-[#64748B]">
            This product does not currently have an automated sensor monitoring its physical shelf inventory.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Device Profile Card */}
          <div className="bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D9E2EC]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-extrabold text-[#0F172A]">
                    {iotDevice.deviceName}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      iotDevice.status === 'ONLINE'
                        ? 'bg-[#D1FAE5] text-emerald-800 border-emerald-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    {iotDevice.status}
                  </span>
                </div>
                <p className="text-xs font-mono font-semibold text-[#1769C2]">
                  Code: {iotDevice.deviceCode}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-[#0F172A] font-medium">
                  <Battery className="w-4 h-4 text-emerald-600" />
                  <span>Battery: <strong>{iotDevice.battery}%</strong></span>
                </span>
                <span className="flex items-center gap-1.5 text-[#64748B]">
                  <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>
                    Last Seen:{' '}
                    <strong className="text-[#0F172A]">
                      {iotDevice.lastSeen
                        ? new Date(iotDevice.lastSeen).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Never'}
                    </strong>
                  </span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
              <div>
                <span className="text-[#64748B] text-[10px] uppercase font-bold block">Type</span>
                <span className="font-semibold text-[#0F172A]">{iotDevice.deviceType}</span>
              </div>
              <div>
                <span className="text-[#64748B] text-[10px] uppercase font-bold block">Location</span>
                <span className="font-semibold text-[#0F172A]">{iotDevice.location || 'Store Shelf'}</span>
              </div>
              <div>
                <span className="text-[#64748B] text-[10px] uppercase font-bold block">Device Status</span>
                <span className="font-semibold text-[#0F172A]">{iotDevice.status}</span>
              </div>
              <div>
                <span className="text-[#64748B] text-[10px] uppercase font-bold block">Simulation Mode</span>
                <span className="font-semibold text-[#1769C2]">{iotDevice.simulationStatus}</span>
              </div>
            </div>
          </div>

          {/* Telemetry Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                Recent Sensor Readings ({telemetry.length} latest)
              </h4>
            </div>

            {telemetry.length === 0 ? (
              <p className="text-xs text-[#64748B] italic p-4 bg-[#F8FAFC] rounded-xl text-center">
                No sensor readings logged for this device yet.
              </p>
            ) : (
              <div className="overflow-x-auto border border-[#D9E2EC] rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#D9E2EC] text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3 text-right">Raw Reading</th>
                      <th className="py-2.5 px-3 text-right">Calculated Quantity</th>
                      <th className="py-2.5 px-3 text-center">Battery</th>
                      <th className="py-2.5 px-3 text-center">Reading Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D9E2EC] bg-white">
                    {telemetry.map((t) => (
                      <tr key={t.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-2 px-3 text-[#64748B] text-[11px] whitespace-nowrap">
                          {new Date(t.timestamp).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric'
                          })}{' '}
                          <span className="text-[10px]">
                            {new Date(t.timestamp).toLocaleTimeString(undefined, {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-[#0F172A]">
                          {typeof t.rawReading === 'number' ? t.rawReading.toLocaleString() : t.rawReading}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-700">
                          {t.calculatedQuantity} {unit}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="inline-flex items-center gap-1 font-medium text-[#0F172A]">
                            <Battery className="w-3 h-3 text-emerald-600" />
                            <span>{t.battery}%</span>
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#E8F2FF] text-[#1769C2] border border-[#BFDBFE]">
                            {t.readingType || 'SIMULATED'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IoTMonitoringCard;
