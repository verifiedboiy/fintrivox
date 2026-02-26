import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Calendar, Edit, Save, Camera, Loader2, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { userApi } from '@/services/api';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', country: '',
    address: '', city: '', postalCode: '', dateOfBirth: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        country: user.country || '',
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        dateOfBirth: user.dateOfBirth || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await userApi.updateProfile(form);
      await refreshUser();
      setIsEditing(false);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const createdDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500">Manage your personal information</p>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-2xl font-bold flex items-center gap-2 justify-center md:justify-start">
                {user.firstName} {user.lastName}
                {user.kycStatus === 'VERIFIED' && <BadgeCheck className="w-6 h-6 text-blue-500" fill="currentColor" stroke="white" />}
              </h2>
              <p className="text-gray-500">{user.email}</p>
              <div className="flex gap-2 mt-2 justify-center md:justify-start">
                <Badge className={user.kycStatus === 'VERIFIED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                  KYC {user.kycStatus === 'VERIFIED' ? 'Verified' : user.kycStatus === 'PENDING' ? 'Pending' : user.kycStatus === 'REJECTED' ? 'Rejected' : 'Not Submitted'}
                </Badge>
                <Badge variant="secondary">Member since {createdDate}</Badge>
              </div>
            </div>
            <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
              {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} disabled={!isEditing} />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} disabled={!isEditing} />
            </div>
            <div>
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input defaultValue={user.email} disabled className="pl-10" />
              </div>
            </div>
            <div>
              <Label>Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} disabled={!isEditing} className="pl-10" />
              </div>
            </div>
            <div>
              <Label>Country</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} disabled={!isEditing} className="pl-10" />
              </div>
            </div>
            <div>
              <Label>Date of Birth</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input value={form.dateOfBirth} onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))} disabled={!isEditing} className="pl-10" />
              </div>
            </div>
          </div>
          {isEditing && (
            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Street Address</Label>
            <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} disabled={!isEditing} />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>City</Label>
              <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} disabled={!isEditing} />
            </div>
            <div>
              <Label>Postal Code</Label>
              <Input value={form.postalCode} onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))} disabled={!isEditing} />
            </div>
            <div>
              <Label>Country</Label>
              <Input value={form.country} disabled={!isEditing} readOnly />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
