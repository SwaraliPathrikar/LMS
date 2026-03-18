import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function GenericPage({ title }: { title: string }) {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="page-header">{title}</h1>
        <Card>
          <CardContent className="p-12 text-center">
            <Construction className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-lg font-medium text-muted-foreground">Module Under Development</p>
            <p className="text-sm text-muted-foreground mt-1">This section is being built. Check back soon!</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
