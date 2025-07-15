import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

export default function ReportCard({ report }: { report: any }) {
    const handleDownload = () => {
    const element = document.getElementById('report');
    const downloadBtn = element?.querySelector('button');
        if (element && downloadBtn) {
            downloadBtn.style.display = 'none';
            import('html2pdf.js').then((module) => {
                const html2pdf = module.default;
                html2pdf().from(element).save('YouPay_Financial_Report.pdf')
                .then(() => {
                    downloadBtn.style.display = 'inline-block';
                })
                .catch(() => {
                    downloadBtn.style.display = 'inline-block';
                });
            });
        }
    };

    let barData;
    let pieData;

    if (report) {
        barData = {
            labels: ['Total Sent', 'Total Received'],
            datasets: [
            {
                label: 'Transaction Summary ($)',
                data: [parseFloat(report.totalSent), parseFloat(report.totalReceived)],
                backgroundColor: ['#f87171', '#4ade80'],
                borderRadius: 6,
            },
            ],
        };

        pieData = {
            labels: ['Plaid Checking', 'Plaid Saving'],
            datasets: [
            {
                label: 'Account Distribution',
                data: [parseFloat(report.fType), parseFloat(report.sType)],
                backgroundColor: ['#60a5fa', '#facc15'],
                borderWidth: 1,
            },
            ],
        };
    }

    return (
        report && (
        <div
            id="report"
            className="mt-6 bg-white shadow-lg rounded-2xl p-6 max-w-2xl mx-auto space-y-4 border border-gray-200"
        >
            <h3 className="text-xl font-semibold text-gray-800">📊 Your Financial Report</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">📤 Transaction Summary</h4>
                    <div className="space-y-2 text-base text-gray-800">
                    <p><span className="font-medium">Total Sent:</span> <span className="text-red-500">${report.totalSent}</span></p>
                    <p><span className="font-medium">Total Received:</span> <span className="text-green-600">${report.totalReceived}</span></p>
                    <p><span className="font-medium">Balance:</span> <span className="text-blue-600">${report.balance}</span></p>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">🏦 Bank Breakdown</h4>
                    <div className="space-y-2 text-base text-gray-800">
                    {report.fType && <p><span className="font-medium">Plaid Checking:</span> ${report.fType}</p>}
                    {report.sType && <p><span className="font-medium">Plaid Saving:</span> ${report.sType}</p>}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="bg-gray-50 p-3 rounded-xl flex flex-col items-center justify-center">
                    <h4 className="text-sm font-medium text-gray-800 mb-2">💸 Transactions</h4>
                    <div className="w-full h-[200px]">
                    <Bar
                        data={barData}
                        options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        }}
                    />
                    </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl flex flex-col items-center justify-center">
                    <h4 className="text-sm font-medium text-gray-800 mb-2">🏦 Account Distribution</h4>
                    <div className="w-full h-[200px]">
                    <Pie
                        data={pieData}
                        options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom' } },
                        }}
                    />
                    </div>
                </div>
            </div>

            <div className="text-right">
                <button
                    onClick={handleDownload}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                    Download as PDF
                </button>
            </div>
        </div>
        )
    );
}