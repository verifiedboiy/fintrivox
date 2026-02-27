import { useState, useEffect } from 'react';
import { Plus, Edit, Loader2, TrendingUp, CheckCircle, Trash2, RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { adminApi } from '@/services/api';

export default function AdminPlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    dailyProfitRate: '',
    minAmount: '',
    maxAmount: '',
    duration: '',
    riskLevel: 'low',
    color: '#3B82F6',
    features: '',
    referralBonus: '5',
    status: 'active',
    popular: false,
    category: 'mixed' // Add default category
  });

  const fetchPlans = async () => {
    try {
      const { data } = await adminApi.getPlans();
      setPlans(data.plans || []);
    } catch (err) {
      console.error('Failed to fetch plans:', err);
    }
    finally { setLoading(false); }
  };

  const handleRestoreDefaults = async () => {
    if (!confirm('This will restore the Starter, Growth, and Elite plans to their default values. Existing plans with these names will be updated. Continue?')) return;

    setLoading(true);
    try {
      await adminApi.restorePlans();
      await fetchPlans();
      const { toast } = await import('sonner');
      toast.success('Default plans restored successfully');
    } catch (err: any) {
      console.error('Failed to restore plans:', err);
      alert(err.response?.data?.error || 'Failed to restore plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleCreate = () => {
    setEditingPlan(null);
    setForm({
      name: '',
      description: '',
      dailyProfitRate: '',
      minAmount: '',
      maxAmount: '',
      duration: '',
      riskLevel: 'low',
      color: '#3B82F6',
      features: '',
      referralBonus: '5',
      status: 'active',
      popular: false,
      category: 'mixed'
    });
    setShowForm(true);
  };
  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      description: plan.description || '',
      dailyProfitRate: (plan.dailyProfit || plan.dailyProfitRate)?.toString() || '',
      minAmount: plan.minAmount?.toString() || '',
      maxAmount: plan.maxAmount?.toString() || '',
      duration: plan.duration?.toString() || '',
      riskLevel: plan.riskLevel || 'low',
      color: plan.color || '#3B82F6',
      features: (plan.features || []).join(', '),
      referralBonus: plan.referralBonus?.toString() || '5',
      status: plan.status || 'active',
      popular: plan.popular || false,
      category: plan.category || 'mixed'
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.name || !form.dailyProfitRate || !form.minAmount || !form.duration) {
      alert('Please fill in all required fields (Name, Profit, Min Amount, Duration)');
      return;
    }

    const dailyProfit = parseFloat(form.dailyProfitRate);
    const minAmount = parseFloat(form.minAmount);
    const maxAmount = parseFloat(form.maxAmount || '999999999');
    const duration = parseInt(form.duration);
    const referralBonus = parseFloat(form.referralBonus || '0');

    if (isNaN(dailyProfit) || isNaN(minAmount) || isNaN(duration)) {
      alert('Profit, Amount, and Duration must be valid numbers! Please check your input.');
      return;
    }

    const data = {
      ...form,
      dailyProfitRate: dailyProfit,
      minAmount: minAmount,
      maxAmount: maxAmount,
      duration: duration,
      referralBonus: referralBonus,
      features: form.features.split(',').map((f: string) => f.trim()).filter(Boolean)
    };

    try {
      console.log('Submitting plan data:', data);
      if (editingPlan) {
        await adminApi.updatePlan(editingPlan.id, data);
      } else {
        await adminApi.createPlan(data);
      }
      setShowForm(false);
      fetchPlans();
      const { toast } = await import('sonner');
      toast.success(editingPlan ? 'Plan updated' : 'Plan created successfully');
    } catch (err: any) {
      console.error('Submit plan error:', err);
      alert(err.response?.data?.error || 'Failed to save plan. Please ensure all numeric fields contain only numbers.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan? This cannot be undone.')) return;
    try {
      await adminApi.deletePlan(id);
      fetchPlans();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete plan');
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investment Plans</h1>
          <p className="text-gray-500">Manage investment plans</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleRestoreDefaults}
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restore Defaults
          </Button>
          <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Plan
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map(plan => (
          <Card key={plan.id} className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl border-none shadow-sm ring-1 ring-gray-200/50 ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
            {plan.popular && <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-bl-lg shadow-sm">Popular</div>}
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner" style={{ backgroundColor: (plan.color || '#3B82F6') + '15' }}>
                  <TrendingUp className="w-6 h-6" style={{ color: plan.color || '#3B82F6' }} />
                </div>
                <Badge className={plan.status === 'active' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100' : 'bg-rose-50 text-rose-700 hover:bg-rose-50 border-rose-100'}>{plan.status}</Badge>
              </div>
              <CardTitle className="text-xl font-bold text-gray-800">{plan.name}</CardTitle>
              <p className="text-sm text-gray-500 line-clamp-2 mt-1">{plan.description}</p>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Daily Profit</span>
                  <p className="text-lg font-bold" style={{ color: plan.color }}>{plan.dailyProfit}%</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Duration</span>
                  <p className="text-lg font-bold text-gray-700">{plan.duration} Days</p>
                </div>
              </div>

              <div className="space-y-2 py-3 border-t border-b border-gray-50">
                <div className="flex justify-between text-xs"><span className="text-gray-400">Min Investment</span><span className="font-semibold text-gray-700">${plan.minAmount?.toLocaleString()}</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-400">Max Investment</span><span className="font-semibold text-gray-700">${plan.maxAmount?.toLocaleString()}</span></div>
              </div>

              {plan.features?.length > 0 && (
                <div className="space-y-1.5">
                  {plan.features.slice(0, 2).map((f: string, i: number) => (
                    <p key={i} className="text-xs text-gray-500 flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" />{f}</p>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 border-gray-100 hover:bg-gray-50 text-gray-600 h-9" onClick={() => handleEdit(plan)}><Edit className="w-3.5 h-3.5 mr-2" /> Edit</Button>
                <Button variant="ghost" className="px-3 h-9 text-rose-500 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(plan.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingPlan ? 'Edit Plan' : 'Create Plan'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Description</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Daily Profit Rate (%)</Label><Input type="number" step="0.01" value={form.dailyProfitRate} onChange={e => setForm(f => ({ ...f, dailyProfitRate: e.target.value }))} /></div>
              <div><Label>Duration (days)</Label><Input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Min Amount</Label><Input type="number" value={form.minAmount} onChange={e => setForm(f => ({ ...f, minAmount: e.target.value }))} /></div>
              <div><Label>Max Amount</Label><Input type="number" value={form.maxAmount} onChange={e => setForm(f => ({ ...f, maxAmount: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Risk Level</Label>
                <select value={form.riskLevel} onChange={e => setForm(f => ({ ...f, riskLevel: e.target.value }))} className="w-full border rounded-lg px-3 py-2 mt-1"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select>
              </div>
              <div><Label>Status</Label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full border rounded-lg px-3 py-2 mt-1"><option value="active">Active</option><option value="inactive">Inactive</option></select>
              </div>
            </div>
            <div><Label>Features (comma separated)</Label><Input value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} placeholder="Feature 1, Feature 2, Feature 3" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Color</Label><Input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} /></div>
              <div><Label>Referral Bonus (%)</Label><Input type="number" value={form.referralBonus} onChange={e => setForm(f => ({ ...f, referralBonus: e.target.value }))} /></div>
            </div>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.popular as boolean} onChange={e => setForm(f => ({ ...f, popular: e.target.checked }))} /> Mark as Popular</label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">{editingPlan ? 'Update Plan' : 'Create Plan'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
