import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { departments } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Landmark, Palette, Cpu, Heart, Scale } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const iconMap: Record<string, React.ElementType> = {
  GraduationCap, Landmark, Palette, Cpu, Heart, Scale,
};

export default function DepartmentSelect() {
  const { setSelectedDepartment } = useAuth();
  const navigate = useNavigate();

  const handleSelect = (id: string) => {
    setSelectedDepartment(id);
    navigate('/libraries');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-header">Select Department</h1>
          <p className="text-muted-foreground mt-1">Choose a cluster to view associated libraries</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map(dept => {
            const Icon = iconMap[dept.icon] || GraduationCap;
            return (
              <Card
                key={dept.id}
                className="cursor-pointer hover:shadow-lg hover:border-accent/50 transition-all group"
                onClick={() => handleSelect(dept.id)}
              >
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                    <Icon className="w-6 h-6 text-primary group-hover:text-accent transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{dept.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{dept.description}</p>
                    <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                      {dept.cluster}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
