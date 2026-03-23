import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/library';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Library, ShieldCheck, BookOpen, User, AlertCircle } from 'lucide-react';

const roles: { value: UserRole; label: string; icon: React.ElementType; desc: string }[] = [
  { value: 'admin', label: 'Administrator', icon: ShieldCheck, desc: 'Full system access & management' },
  { value: 'librarian', label: 'Librarian', icon: BookOpen, desc: 'Branch-level inventory management' },
  { value: 'citizen', label: 'Citizen / Reader', icon: User, desc: 'Browse, borrow & request books' },
];

// Demo credentials for easy testing
const demoCredentials = {
  admin: { email: 'admin@corp.gov.in', password: 'admin@123' },
  librarian: { email: 'meera.kulkarni@lib.gov.in', password: 'librarian@123' },
  citizen: { email: 'rajesh@email.com', password: 'citizen@123' },
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    const success = login(email, password, selectedRole);
    if (success) {
      navigate('/departments');
    } else {
      setError('Invalid credentials for the selected role');
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-accent blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-info blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="logo1.png" alt="Library Logo" className="h-14 w-auto max-w-xs object-contain block" />
          </div>
          <h1 className="text-3xl font-bold text-primary-foreground" style={{ fontFamily: 'var(--font-display)' }}>
            Library Management System
          </h1>
          <p className="text-primary-foreground/60 mt-2 text-sm">Municipal Corporation Digital Library Management System</p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="pb-4">
            <p className="text-sm text-muted-foreground text-center">Sign in to access the Library Management System</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Role Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Login As</Label>
                <div className="grid grid-cols-3 gap-2">
                  {roles.map(role => {
                    const Icon = role.icon;
                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => {
                          setSelectedRole(role.value);
                          setError('');
                        }}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          selectedRole === role.value
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border hover:border-muted-foreground/30'
                        }`}
                      >
                        <Icon size={20} className="mx-auto mb-1" />
                        <span className="text-xs font-medium block">{role.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-2">
                  <AlertCircle size={16} className="text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.gov.in"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-11">
                Sign In
              </Button>

              {/* <p className="text-xs text-center text-muted-foreground">
                Don't have an account?{' '}
                <span className="text-accent cursor-pointer hover:underline" onClick={() => navigate('/signup')}>Register as Citizen</span>
              </p> */}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
