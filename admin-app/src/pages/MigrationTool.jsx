import React, { useState } from 'react';
import { importWooCommerceProducts, getWooCommerceCredentials } from '../utils/woocommerce-migration';
import { Package, Upload, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

const MigrationTool = () => {
  const [migrationStatus, setMigrationStatus] = useState(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResults, setMigrationResults] = useState(null);

  const { siteUrl, consumerKey, consumerSecret } = getWooCommerceCredentials();

  const [formData, setFormData] = useState({
    siteUrl: siteUrl || '',
    consumerKey: consumerKey || '',
    consumerSecret: consumerSecret || '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const startMigration = async () => {
    if (!formData.siteUrl || !formData.consumerKey || !formData.consumerSecret) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsMigrating(true);
    setMigrationStatus('Starting migration...');
    setMigrationResults(null);

    try {
      const results = await importWooCommerceProducts(
        formData.siteUrl,
        formData.consumerKey,
        formData.consumerSecret
      );

      setMigrationResults(results);

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      setMigrationStatus(`Migration completed! ${successful} successful, ${failed} failed.`);

      if (failed === 0) {
        toast.success(`Migration successful! ${successful} products imported.`);
      } else {
        toast.error(`Migration finished with errors. ${successful} successful, ${failed} failed.`);
      }
    } catch (error) {
      console.error('Migration error:', error);
      setMigrationStatus(`Migration failed: ${error.message}`);
      toast.error(`Migration failed: ${error.message}`);
    } finally {
      setIsMigrating(false);
    }
  };

  const stats = [
    { label: 'Products', value: migrationResults ? migrationResults.length : '?', icon: Package, color: 'text-slate-900', bg: 'bg-slate-50' },
    { label: 'Connected Site', value: formData.siteUrl ? 'Yes' : 'No', icon: CheckCircle, color: formData.siteUrl ? 'text-green-600' : 'text-red-600', bg: formData.siteUrl ? 'bg-green-50' : 'bg-red-50' },
    { label: 'Status', value: isMigrating ? 'Running' : 'Ready', icon: isMigrating ? RefreshCw : Upload, color: isMigrating ? 'text-blue-600' : 'text-slate-900', bg: isMigrating ? 'bg-blue-50' : 'bg-slate-50' }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white p-8 rounded-[40px] shadow-premium-sm border border-slate-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-150 duration-1000"></div>
        <div className="relative">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-slate-50 text-slate-900 rounded-2xl border border-slate-100">
              <Upload size={24} />
            </div>
            <h1 className="text-4xl font-black text-slate-950 uppercase tracking-tight">Data Migration Tool</h1>
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] ml-1">Import Products from WooCommerce to Supabase</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-premium-sm group hover:border-slate-300 transition-all duration-500">
            <div className="flex items-center gap-6">
              <div className={`w-16 h-16 flex items-center justify-center rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-500 shadow-sm border border-transparent group-hover:border-slate-100`}>
                <stat.icon size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-950">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Form Container */}
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-premium-xl space-y-8 relative overflow-hidden">
          <h3 className="text-2xl font-black text-slate-900 mb-2">WooCommerce Connection Settings</h3>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Site URL</label>
              <input
                type="url"
                name="siteUrl"
                value={formData.siteUrl}
                onChange={handleInputChange}
                placeholder="https://yoursite.com"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-slate-500/10 focus:bg-white focus:border-slate-900 outline-none transition-all font-bold text-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1 ml-1">Your WordPress/WooCommerce site URL</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Consumer Key</label>
              <input
                type="password"
                name="consumerKey"
                value={formData.consumerKey}
                onChange={handleInputChange}
                placeholder="ck_xxxxxxxxxxxxxxxx"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-slate-500/10 focus:bg-white focus:border-slate-900 outline-none transition-all font-bold text-gray-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Consumer Secret</label>
              <input
                type="password"
                name="consumerSecret"
                value={formData.consumerSecret}
                onChange={handleInputChange}
                placeholder="cs_xxxxxxxxxxxxxxxx"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-slate-500/10 focus:bg-white focus:border-slate-900 outline-none transition-all font-bold text-gray-600"
              />
            </div>

            <div className="pt-6">
              <button
                onClick={startMigration}
                disabled={isMigrating}
                className={`w-full py-5 px-6 rounded-2xl font-black text-white uppercase tracking-widest text-sm transition-all shadow-xl flex items-center justify-center gap-3 ${isMigrating
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-slate-900 hover:bg-black active:scale-95 hover:shadow-2xl'
                  }`}
              >
                {isMigrating ? (
                  <>
                    <RefreshCw className="animate-spin" size={20} />
                    Migrating... Please Wait
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Start Migration
                  </>
                )}
              </button>

              {migrationStatus && (
                <div className={`mt-6 p-5 rounded-2xl border ${migrationStatus.includes('failed')
                    ? 'bg-red-50/50 text-red-700 border-red-100'
                    : 'bg-green-50/50 text-green-700 border-green-100'
                  }`}>
                  <div className="flex items-center gap-3">
                    {migrationStatus.includes('failed') ? (
                      <XCircle size={24} className="flex-shrink-0" />
                    ) : (
                      <CheckCircle size={24} className="flex-shrink-0" />
                    )}
                    <p className="font-bold">{migrationStatus}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions Container */}
        <div className="space-y-8">
          <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-premium-sm">
            <h3 className="text-xl font-black text-slate-900 mb-6">Migration Instructions</h3>
            <ol className="list-decimal pl-6 space-y-4 font-bold text-gray-500 marker:text-slate-300">
              <li>Generate WooCommerce API keys in your WordPress admin under <span className="text-slate-800">WooCommerce → Settings → Advanced → REST API</span></li>
              <li>Enter your site URL and the API credentials in the form on the left</li>
              <li>Click "Start Migration" to begin importing products</li>
              <li>Wait for the process to complete (this may take several minutes)</li>
              <li>Check the results table below for detailed logs</li>
            </ol>
          </div>

          <div className="p-8 bg-amber-50 rounded-[40px] border border-amber-100">
            <h4 className="font-black text-amber-900 text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
              Important Notes
            </h4>
            <ul className="list-disc pl-5 space-y-3 font-bold text-amber-700/80 text-sm marker:text-amber-300">
              <li className="pl-1">Ensure your Supabase table <code className="bg-amber-100/50 px-2 py-0.5 rounded text-amber-900 mx-1">services</code> exists before running</li>
              <li className="pl-1">Products are matched by name and location to prevent duplicates</li>
              <li className="pl-1">Creating a database backup prior to migration is highly recommended</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Results Table */}
      {migrationResults && migrationResults.length > 0 && (
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-premium-xl overflow-hidden mb-20">
          <div className="p-8 text-xl font-black text-slate-900 uppercase tracking-tight border-b border-slate-100 bg-slate-50/50">
            Migration Logs
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] w-1/3">Product Name</th>
                  <th className="py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center w-32">Status</th>
                  <th className="py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Log Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {migrationResults.map((result, idx) => (
                  <tr key={idx} className="transition-all hover:bg-slate-50/50 group align-middle">
                    <td className="py-5 px-8">
                      <div className="font-bold text-gray-900 truncate max-w-sm">{result.product}</div>
                    </td>
                    <td className="py-5 px-8 text-center">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${result.success
                          ? 'bg-green-100/50 text-green-700'
                          : 'bg-red-100/50 text-red-700'
                        }`}>
                        {result.success ? 'Success' : 'Failed'}
                      </span>
                    </td>
                    <td className="py-5 px-8">
                      <div className="font-medium text-sm text-gray-500 max-w-lg">{result.error || 'Imported and linked successfully'}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MigrationTool;