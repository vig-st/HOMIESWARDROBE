import { useContext, useState } from 'react';
import { AuthContext } from '../../utils/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export function Settings() {
  const { user, updatePreferences } = useContext(AuthContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [prefs, setPrefs] = useState(user?.notifications || {});

  const savePrefs = () => {
    updatePreferences(prefs);
  };

  return (
    <div className="space-y-8">
      <Card title="Notification Preferences">
        <div className="space-y-4 text-sm text-secondary">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={prefs.email} onChange={(e) => setPrefs((p) => ({ ...p, email: e.target.checked }))} />
            <span className="ml-2">Email notifications</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={prefs.sms} onChange={(e) => setPrefs((p) => ({ ...p, sms: e.target.checked }))} />
            <span className="ml-2">SMS notifications</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={prefs.promotions} onChange={(e) => setPrefs((p) => ({ ...p, promotions: e.target.checked }))} />
            <span className="ml-2">Promotional emails</span>
          </label>
          <div className="pt-4">
            <Button onClick={savePrefs}>Save preferences</Button>
          </div>
        </div>
      </Card>

      <Card title="Danger Zone">
        <div className="space-y-4 text-sm text-secondary">
          <p>Deleting your account will remove all your data. This action is irreversible.</p>
          <Button variant="ghost" onClick={() => setModalOpen(true)}>Delete Account</Button>
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Delete account" actions={<Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>}>
        <p className="text-sm text-secondary">Are you sure you want to delete your account? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
