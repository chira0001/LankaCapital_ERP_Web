import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
//import pb from '@/lib/pocketbaseClient.js';
import { Settings, Save } from 'lucide-react';
import { Button } from '@/component/ui/button';
import { Input } from '@/component/ui/input';
import { Label } from '@/component/ui/label';
import { toast } from "sonner"; // ✅ SONNER

const SystemConfigurationPage = () => {
  const [configs, setConfigs] = useState({
    default_interest_rate: '',
    penalty_rate: '',
    min_loan_duration: '',
    max_loan_duration: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfigs();
  }, []);

  /* ===============================
     FETCH CONFIGS (HARDCODE + DB)
  =============================== */
  const fetchConfigs = async () => {
    try {

      /* ===============================
         HARD CODE DATA (FOR TESTING)
      =============================== */
      const data = {
        default_interest_rate: "12.5",
        penalty_rate: "2.0",
        min_loan_duration: "3",
        max_loan_duration: "60"
      };

      setConfigs(data);

      /* ===============================
         DATABASE VERSION (UNCOMMENT LATER)
      =============================== */
      /*
      const allConfigs = await pb.collection('system_config').getFullList({ $autoCancel: false });

      const configMap = {};
      allConfigs.forEach(config => {
        configMap[config.config_key] = config.config_value;
      });

      setConfigs({
        default_interest_rate: configMap.default_interest_rate || '',
        penalty_rate: configMap.penalty_rate || '',
        min_loan_duration: configMap.min_loan_duration || '',
        max_loan_duration: configMap.max_loan_duration || ''
      });
      */

    } catch (error) {
      console.error('Failed to fetch configs:', error);
      toast.error("Failed to load configuration");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     SAVE CONFIGS
  =============================== */
  const handleSave = async () => {
    try {

      /* ===============================
         HARD CODE MODE (UI ONLY)
      =============================== */
      toast.success("System configuration updated successfully");

      /* ===============================
         DATABASE VERSION (UNCOMMENT LATER)
      =============================== */
      /*
      const configKeys = Object.keys(configs);

      for (const key of configKeys) {
        try {
          const existing = await pb.collection('system_config').getFirstListItem(
            `config_key = "${key}"`,
            { $autoCancel: false }
          );

          await pb.collection('system_config').update(existing.id, {
            config_value: configs[key]
          }, { $autoCancel: false });

        } catch (error) {

          await pb.collection('system_config').create({
            config_key: key,
            config_value: configs[key],
            description: key.replace(/_/g, ' ').toUpperCase()
          }, { $autoCancel: false });

        }
      }

      toast.success("System configuration updated successfully");
      */

    } catch (error) {
      console.error('Failed to save configs:', error);
      toast.error("Failed to update configuration");
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading configuration...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>System Configuration - LendPro</title>
        <meta name="description" content="Configure system-wide settings for your money lending business." />
      </Helmet>

      <div className="flex min-h-screen bg-slate-50">
        <div className="flex-1 overflow-auto">
          <div className="p-8">

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">System Configuration</h1>
              <p className="text-slate-600">Manage system-wide settings and parameters</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 max-w-2xl">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-slate-600" />
                <h3 className="font-bold text-slate-900">Loan Settings</h3>
              </div>

              <div className="space-y-6">

                <div>
                  <Label className="text-slate-700 mb-2 block">Default Interest Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={configs.default_interest_rate}
                    onChange={(e) => setConfigs({ ...configs, default_interest_rate: e.target.value })}
                    placeholder="12.5"
                    className="bg-slate-50 border-slate-300 text-slate-900"
                  />
                  <p className="text-sm text-slate-500 mt-1">Default interest rate for new loans</p>
                </div>

                <div>
                  <Label className="text-slate-700 mb-2 block">Penalty Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={configs.penalty_rate}
                    onChange={(e) => setConfigs({ ...configs, penalty_rate: e.target.value })}
                    placeholder="2.0"
                    className="bg-slate-50 border-slate-300 text-slate-900"
                  />
                  <p className="text-sm text-slate-500 mt-1">Penalty rate for overdue payments</p>
                </div>

                <div>
                  <Label className="text-slate-700 mb-2 block">Minimum Loan Duration (months)</Label>
                  <Input
                    type="number"
                    value={configs.min_loan_duration}
                    onChange={(e) => setConfigs({ ...configs, min_loan_duration: e.target.value })}
                    placeholder="3"
                    className="bg-slate-50 border-slate-300 text-slate-900"
                  />
                  <p className="text-sm text-slate-500 mt-1">Minimum allowed loan duration</p>
                </div>

                <div>
                  <Label className="text-slate-700 mb-2 block">Maximum Loan Duration (months)</Label>
                  <Input
                    type="number"
                    value={configs.max_loan_duration}
                    onChange={(e) => setConfigs({ ...configs, max_loan_duration: e.target.value })}
                    placeholder="60"
                    className="bg-slate-50 border-slate-300 text-slate-900"
                  />
                  <p className="text-sm text-slate-500 mt-1">Maximum allowed loan duration</p>
                </div>

                <Button
                  onClick={handleSave}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </Button>

              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default SystemConfigurationPage;