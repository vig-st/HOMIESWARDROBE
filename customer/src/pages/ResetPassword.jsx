import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';

export function ResetPassword() {
  return (
    <div className="min-h-screen bg-section py-16">
      <div className="mx-auto w-full max-w-xl px-4 sm:px-6 lg:px-8">
        <Card className="space-y-8">
          <div className="space-y-2 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-secondary">Reset Password</p>
            <h1 className="text-4xl font-heading font-semibold">Password recovery</h1>
            <p className="text-sm text-secondary">Password recovery is not available in this demo.</p>
          </div>
          <div className="text-center">
            <Link to="/login" className="text-primary hover:text-brand">Return to login</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
