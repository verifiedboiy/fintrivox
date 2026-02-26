import { useState, useEffect } from 'react';
import { Plus, Edit, Loader2, TrendingUp, CheckCircle } from 'lucide-react';
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
  const [form, setForm] = useState({ name: '', description: '', dailyProfitRate: '', minAmount: '', maxAmount: '', duration: '', riskLevel: 'low', color: '#3B82F6', features: '', referralBonus: '5', status: 'active', popular: false });

  const fetchPlans = async () => {
    try { const { data } = await adminApi.getPlans(); setPlans(data.plans); } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleCreate = () => { setEditingPlan(null); setForm({ name: '', description: '', dailyProfitRate: '', minAmount: '', maxAmount: '', duration: '', riskLevel: 'low', color: '#3B82F6', features: '', referralBonus: '5', status: 'active', popular: false }); setShowForm(true); };
  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setForm({ name: plan.name, description: plan.description || '', dailyProfitRate: plan.dailyProfitRate?.toString() || '', minAmount: plan.minAmount?.toString() || '', maxAmount: plan.maxAmount?.toString() || '', duration: plan.duration?.toString() || '', riskLevel: plan.riskLevel || 'low', color: plan.color || '#3B82F6', features: (plan.features || []).join(', '), referralBonus: plan.referralBonus?.toString() || '5', status: plan.status || 'active', popular: plan.popular || false });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    const data = { ...form, dailyProfitRate: parseFloat(form.dailyProfitRate), minAmount: parseFloat(form.minAmount), maxAmount: parseFloat(form.maxAmount), duration: parseInt(form.duration), referralBonus: parseFloat(form.referralBonus), features: form.features.split(',').map((f: string) => f.trim()).filter(Boolean) };
    try {
      if (editingPlan) { await adminApi.updatePlan(editingPlan.id, data); }
      else { await adminApi.createPlan(data); }
      setShowForm(false);
      fetchPlans();
    } catch (err: any) { alert(err.response?.data?.error || 'Failed'); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Investment Plans</h1><p className="text-gray-500">Manage investment plans</p></div>
        <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" /> Create Plan</Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map(plan => (
          <Card key={plan.id} className={`relative ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
            {plan.popular && <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-3 py-1 rounded-bl-lg">Popular</div>}
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: (plan.color || '#3B82F6') + '20' }}>
                  <TrendingUp className="w-6 h-6" style={{ color: plan.color || '#3B82F6' }} />
                </div>
                <Badge className={plan.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{plan.status}</Badge>
              </div>
              <CardTitle className="text-xl mt-4">{plan.name}</CardTitle>
              <p className="text-sm text-gray-500">{plan.description}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Daily Profit</span><span className="font-bold" style={{ color: plan.color }}>{plan.dailyProfitRate}%</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Min/Max</span><span className="font-medium">${plan.minAmount?.toLocaleString()} - ${plan.maxAmount?.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Duration</span><span className="font-medium">{plan.duration} days</span></div>
              {plan.features?.length > 0 && (
                <div className="pt-2 border-t">
                  {plan.features.slice(0, 3).map((f: string, i: number) => (
                    <p key={i} className="text-sm text-gray-600 flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-500" />{f}</p>
                  ))}
                </div>
              )}
              <Button variant="outline" className="w-full" onClick={() => handleEdit(plan)}><Edit className="w-4 h-4 mr-2" /> Edit Plan</Button>
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
